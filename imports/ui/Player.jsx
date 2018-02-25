import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/PlayerStyle.css';

class Player extends Component {
  render() {
    return (
      <div id="Player">
        <div className="SongInfo">
          <h2>Band: </h2>
          <br/>
          <h1>{this.props.song.band}</h1>
          <br/>
          <h2>Tempo: </h2>
          <h1>{this.props.song.tempo}</h1>
          <br/>
          <h2>Key: </h2>
          <h1>{this.props.song.key}</h1>
          <br/>
          <h2>Chords:</h2>
          <br/>
          <div className="Chords">{this.PrintChordProgression()}</div>
        </div>
        <div className="buttons">
          <button className={"saveButton"+(this.props.save?"":" inactive")}>
            <h2>{this.props.save?"Save Song":"You need to be log in to save songs"}</h2>
          </button>
          <button className="playButton" onClick={() => this.props.pause()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" height="100%">
              <g fill={this.props.playing?"none":"#181818"} transform="translate(0,-952.36218)">
                <path d="M16,1030.4c0.2,6.9,7.3,11.1,13.5,7.8l50-28.2c2.7-1.5,4.6-4.4,4.6-7.7c0-3.3-1.8-6.1-4.6-7.7l-50-28.2
                  c-6.2-3.3-13.3,0.9-13.5,7.7V1030.4z"/>
              </g>
              <g fill={this.props.playing?"#181818":"none"}>
              	<path id="XMLID_4_" d="M36.5,15.9H25.3c-5.2,0-9.3,4.2-9.3,9.3v49.4c0,5.2,4.2,9.3,9.3,9.3h11.2c5.2,0,9.3-4.2,9.3-9.3V25.3
              		C45.9,20.1,41.7,15.9,36.5,15.9z"/>
              	<path id="XMLID_1_" d="M74.7,15.9H63.5c-5.2,0-9.3,4.2-9.3,9.3v49.4c0,5.2,4.2,9.3,9.3,9.3h11.2c5.2,0,9.3-4.2,9.3-9.3V25.3
              		C84.1,20.1,79.9,15.9,74.7,15.9z"/>
              </g>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  PrintChordProgression() {
    return this.props.song.progressionName.map((chord, i) => {
      return <div key={i} className={"chord"+(this.props.bar===i?" active":"")}><h2>{chord}</h2></div>;
    });
  }
}

Player.propTypes = {
  bar: PropTypes.number.isRequired,
  song: PropTypes.object.isRequired,
  save: PropTypes.bool.isRequired,
  pause: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired
}

export default Player;
