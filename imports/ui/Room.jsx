import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SoundEngine from '../engines/sound/SoundEngine.js';
import GraphicEngine from '../engines/graphics/GraphicEngine.js';

import InstrumentSelect from './InstrumentSelect.jsx';
import SongInfo from './SongInfo.jsx';

import './css/RoomStyle.css';

class Room extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.EngineReady = this.EngineReady.bind(this);
    this.HandlePointerLockChange = this.HandlePointerLockChange.bind(this);
    this.HandleMouseMove = this.HandleMouseMove.bind(this);
    this.HandleClick = this.HandleClick.bind(this);
    this.Render = this.Render.bind(this);
    this.UpdatePattern = this.UpdatePattern.bind(this);
    this.canvasRef = React.createRef();
    this.sceneReady = false;
    this.pointerLock = false;
    this.GraphicBeatUpdate = false;
    this.tInterval = 0.0;
    this.state = {
      view: 'InstrumentSelect',
      instrument: '',
      soundEngine: new SoundEngine(props.song, this.EngineReady),
      graphicEngine: new GraphicEngine(),
      engineReady: false,
      beat: -1,
      bar: 0,
      playing: false
    };
  }

  render() {
    if(this.state.view === 'InstrumentSelect') {
      return (
        <InstrumentSelect
          loader={!this.state.engineReady}
          song={this.props.song}
          select={(instr, name) => this.SelectInstrument(instr, name)}/>
      );
    } else {
      return (
        <div id='Room'>
          <canvas ref={(c) => {this.canvasRef = c;}} onClick={() => this.EngagePointerLock()}>
            This browser don't support WebGL.
          </canvas>
          <div className="crosshair">
            <div className="chPiece"></div>
            <div className="chPiece On"></div>
            <div className="chPiece"></div>
            <div className="chPiece On"></div>
            <div className="chPiece"></div>
            <div className="chPiece On"></div>
            <div className="chPiece"></div>
            <div className="chPiece On"></div>
            <div className="chPiece"></div>
          </div>
          <SongInfo
            bar={this.state.bar}
            song={this.props.song}
            instrument={this.state.instrument}/>
        </div>
      );
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
    var tInterval = 60000 / (this.props.song.tempo * 4);
    this.tInterval = tInterval;
    this.interval = setInterval(() => {
      if(this.state.playing) {
        var currentBar = this.state.bar;
        let currentBeat = this.state.beat;
        currentBeat++;
        if (currentBeat === 16) {
          currentBeat = 0;
          currentBar++;
          if (currentBar === 4) {
            currentBar = 0;
          }
        }
        this.PlaySounds(currentBeat, currentBar);
        this.GraphicBeatUpdate = true;
        this.setState({
          beat: currentBeat,
          bar: currentBar
        });
      }
    }, tInterval);
  }

  componentDidUpdate() {
    if(this.state.view === 'Scene' && !this.state.graphicEngine.gl && !this.state.sceneReady) {
      this.updateWindowDimensions();
      this.EngagePointerLock(this.canvasRef);
      this.state.graphicEngine.SetContext(this.canvasRef);
      this.state.graphicEngine.CreateScene(this.state.instrument);
      this.Render();
      this.sceneReady = true;
    }
  }

  Render(now) {
    const deltaTime = now - this.then;
    this.then = now;
    if(this.GraphicBeatUpdate) {
      this.state.graphicEngine.BeatUpdate(this.state.beat, this.state.bar, this.tInterval, this.props.song);
      this.GraphicBeatUpdate = false;
    }
    this.state.graphicEngine.UpdateScene(this.props.song);
    this.state.graphicEngine.CalculateAnimations(now, deltaTime);
    this.state.graphicEngine.DrawScene();

    requestAnimationFrame(this.Render);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    if(this.state.graphicEngine) {
      this.state.graphicEngine.CanvasDimensions(window.innerWidth, window.innerHeight);
    }
  }

  HandleClick() {
    if(this.state.graphicEngine) {
      this.state.graphicEngine.HandleClick(this.props.song, this.UpdatePattern);
    }
  }

  EngagePointerLock() {
    var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;
    if(havePointerLock && !this.pointerLock) {
      this.canvasRef.requestPointerLock = this.canvasRef.requestPointerLock ||
			  this.canvasRef.mozRequestPointerLock ||
			  this.canvasRef.webkitRequestPointerLock;
      this.canvasRef.requestPointerLock();
      this.pointerLock = true;
      document.addEventListener('pointerlockchange', this.HandlePointerLockChange, false);
      document.addEventListener('mozpointerlockchange', this.HandlePointerLockChange, false);
      document.addEventListener('webkitpointerlockchange', this.HandlePointerLockChange, false);
      document.addEventListener('mousemove', this.HandleMouseMove, false);
      document.addEventListener('click', this.HandleClick, false);
    }
  }

  HandlePointerLockChange() {
    if (document.pointerLockElement === this.canvasRef ||
      document.mozPointerLockElement === this.canvasRef ||
      document.webkitPointerLockElement === this.canvasRef) {
      // Pointer locked
      this.pointerLock = true;
      document.addEventListener('mousemove', this.HandleMouseMove, false);
      document.addEventListener('click', this.HandleClick, false);
    } else {
      // Pointer unlocked
      this.pointerLock = false;
      document.removeEventListener('mousemove', this.HandleMouseMove, false);
      document.removeEventListener('click', this.HandleClick, false);
    }
  }

  HandleMouseMove(e) {
    var movementX = e.movementX ||
      e.mozMovementX ||
      e.webkitMovementX ||
      0;
    var movementY = e.movementY ||
      e.mozMovementY ||
      e.webkitMovementY ||
      0;
    this.state.graphicEngine.CameraMovement(movementX, movementY);
  }

  EngineReady() {
    this.setState({engineReady: true});
  }

  PlaySounds(currentBeat, currentBar) {
    if (currentBeat === 0) {
      this.state.soundEngine.PlayBGSounds(currentBar);
    }
    if (this.props.song.drums.user !== '') {
      for (var i = 0; i < this.props.song.drums.pattern.length; i++) {
        if (this.props.song.drums.pattern[i][currentBeat] === 'x') {
          this.state.soundEngine.PlayDrumSound(i);
        }
      }
    }
    if (this.props.song.bass.user !== '') {
      if (this.props.song.bass.pattern[currentBeat] !== '-') {
        this.state.soundEngine.PlayBassSound(this.props.song.bass.pattern[currentBeat], currentBar);
      }
    }
    if (this.props.song.melody.user !== '') {
      if (currentBeat%2 === 0) {
        this.state.soundEngine.PlayMelodySound(this.props.song.melody.pattern[currentBar][currentBeat/2]);
      }
    }
  }

  SelectInstrument(instrument, userName) {
    var song = this.props.song;
    song[instrument].user = userName;
    this.props.instrument(instrument);
    this.props.update(song);
    this.setState({
      view: 'Scene',
      instrument: instrument,
      playing: true
    });
  }

  UpdatePattern(pattern, instrument) {
    var song = this.props.song;
    song[instrument] = pattern;
    this.props.update(song);
  }

  PauseSong() {
    var p = !this.state.playing;
    this.setState({
      playing: p
    })
  }
}

Room.propTypes = {
  song: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  instrument: PropTypes.func.isRequired
}

export default Room;
