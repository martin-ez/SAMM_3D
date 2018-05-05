import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SoundEngine from '../engines/sound/SoundEngine.js';
import GraphicEngine from '../engines/graphics/GraphicEngine.js';

import InstrumentSelect from './InstrumentSelect.jsx';

import './css/RoomStyle.css';

class Room extends Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.EngineReady = this.EngineReady.bind(this);
    this.canvasRef = React.createRef();
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
          <canvas ref={(c) => {this.canvasRef = c;}}>
            This browser don't support WebGL.
          </canvas>
        </div>
      );
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
    var tInterval = 60000 / (this.props.song.tempo * 4);
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
        this.setState({beat: currentBeat, bar: currentBar});
      }
    }, tInterval);
  }

  componentDidUpdate() {
    if(this.state.view === 'Scene' && !this.state.graphicEngine.gl) {
      this.updateWindowDimensions();
      this.state.graphicEngine.SetContext(this.canvasRef);
      this.state.graphicEngine.CreateScene();
      this.state.graphicEngine.DrawScene();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    if(this.state.graphicEngine) {
      this.state.graphicEngine.CanvasDimensions(window.innerWidth, window.innerHeight);
    }
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
