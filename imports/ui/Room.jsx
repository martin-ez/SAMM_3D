import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SoundEngine from '../core/SoundEngine.js';
import GraphicEngine from '../core/GraphicEngine.js';

import InstrumentSelect from './InstrumentSelect.jsx';

import './css/RoomStyle.css';

class Room extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      view: 'InstrumentSelect',
      instrument: '',
      soundEngine: new SoundEngine(props.song),
      graphicEngine: null,
      beat: -1,
      bar: 0,
      playing: false
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  render() {
    if(this.state.view === 'InstrumentSelect') {
      return (
        <InstrumentSelect
          song={this.props.song}
          select={(instr) => this.SelectInstrument(instr)}/>
      );
    } else {
      return (
        <div id='Room'>
          <canvas ref={this.canvasRef}>
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
    if(this.state.view === 'Scene' && !this.state.graphicEngine) {
      this.setState({
        graphicEngine: new GraphicEngine(this.canvasRef.current)
      }, () => {
        this.state.graphicEngine.CreateScene(this.state.instrument);
        this.state.graphicEngine.DrawScene();
      });
    }
    else {
      this.updateWindowDimensions();
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
    if (this.props.song.solo.user !== '') {
      if (currentBeat%2 === 0) {
        this.state.soundEngine.PlaySoloSound(this.props.song.solo.pattern[currentBar][currentBeat/2]);
      }
    }
  }

  SelectInstrument(instrument) {
    var song = this.props.song;
    song[instrument].user = this.props.user;
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
  user: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  instrument: PropTypes.func.isRequired
}

export default Room;
