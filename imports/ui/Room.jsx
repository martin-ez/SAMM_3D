import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SoundEngine from '../core/SoundEngine.js';

import InstrumentSelect from './InstrumentSelect.jsx';
import Player from './Player.jsx';
import Drums from './Drums.jsx';
import Bass from './Bass.jsx';
import Solo from './Solo.jsx';

import './css/RoomStyle.css';

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "InstrumentSelect",
      instrument: "",
      engine: new SoundEngine(props.song),
      beat: -1,
      bar: 0,
      playing: false
    };
  }

  componentDidMount() {
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

  PlaySounds(currentBeat, currentBar) {
    if (currentBeat === 0) {
      this.state.engine.PlayBGSounds(currentBar);
    }
    if (this.props.song.drums.user !== "") {
      for (var i = 0; i < this.props.song.drums.pattern.length; i++) {
        if (this.props.song.drums.pattern[i][currentBeat] === 'x') {
          this.state.engine.PlayDrumSound(i);
        }
      }
    }
    if (this.props.song.bass.user !== "") {
      if (this.props.song.bass.pattern[currentBeat] !== '-') {
        this.state.engine.PlayBassSound(this.props.song.bass.pattern[currentBeat], currentBar);
      }
    }
    if (this.props.song.solo.user !== "") {
      if (currentBeat%2 === 0) {
        this.state.engine.PlaySoloSound(this.props.song.solo.pattern[currentBar][currentBeat/2]);
      }
    }
  }

  SelectInstrument(instrument) {
    var song = this.props.song;
    song[instrument].user = this.props.user;
    this.props.instrument(instrument);
    this.props.update(song);
    this.setState({
      view: "Instrument",
      instrument: instrument,
      playing: true
    });
  }

  render() {
    var MediaQuery = require('react-responsive');
    if(this.state.view === "InstrumentSelect") {
      return (
        <InstrumentSelect
          song={this.props.song}
          select={(instr) => this.SelectInstrument(instr)}/>
      );
    } else {
      return (
        <div>
          <MediaQuery query='(min-width: 800px)'>
            <div id="Room" className={"page large "+this.state.instrument}>
              {this.RenderInstrument()}
              {this.RenderControls()}
            </div>
          </MediaQuery>
          <MediaQuery query='(max-width: 800px)'>
            <div id="Room" className={"page mobile "+this.state.instrument}>
              {this.RenderInstrument()}
              {this.RenderControls()}
            </div>
          </MediaQuery>
        </div>
      );
    }
  }

  RenderInstrument() {
    switch(this.state.instrument) {
      case "drums":
      return (
        <Drums
          pattern={this.props.song.drums}
          beat={this.state.beat}
          update={(p) => this.UpdatePattern(p, "drums")}/>
      );
      break;
      case "bass":
      return (
        <Bass
          pattern={this.props.song.bass}
          beat={this.state.beat}
          update={(p) => this.UpdatePattern(p, "bass")}/>
      );
      break;
      case "keys":
      break;
      case "solo":
      return (
        <Solo
          pattern={this.props.song.solo}
          beat={this.state.beat}
          update={(p) => this.UpdatePattern(p, "solo")}/>
      );
      break;
    }
  }

  RenderControls() {
    return (
      <Player
        bar={this.state.bar}
        song={this.props.song}
        save={this.props.user!=="Guest"}
        pause={() => this.PauseSong()}
        playing={this.state.playing}/>
    );
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
  session: PropTypes.bool.isRequired,
  song: PropTypes.object.isRequired,
  user: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  saveSong: PropTypes.func.isRequired,
  instrument: PropTypes.func.isRequired
}

export default Room;
