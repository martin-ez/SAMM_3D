import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/SongInfoStyle.css';

class SongInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: ''
    }
  }

  render() {
    return (
      <div id='SongInfo' className={this.props.instrument}>
        {this.RenderButtons()}
        {this.RenderInfo()}
        {this.RenderHelp()}
      </div>
    );
  }

  RenderButtons() {
    return (
      <div className={'buttons tab'+(this.state.activeTab!==''?' hide':'')}>
        <div className='btn' onClick={() => this.setState({activeTab: 'info'})}>
          <h1>Song</h1>
        </div>
        <div className='btn' onClick={() => this.setState({activeTab: 'help'})}>
          <h1>Help</h1>
        </div>
      </div>
    );
  }

  RenderInfo() {
    return (
      <div className={'info tab'+(this.state.activeTab!=='info'?' hide':'')}>
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
        <div className='Chords'>{this.PrintChordProgression()}</div>
        <div className='exitBtn' onClick={() => this.setState({activeTab: ''})}>
          <img src='icons/exit.svg' alt=''/>
        </div>
      </div>
    );
  }

  RenderHelp() {
    return (
      <div className={'help tab'+(this.state.activeTab!=='help'?' hide':'')}>
        {this.RenderSpecificHelp()}
        <h2>How does other people join me?</h2>
        <br/>
        <p>
          If your session isn't full yet, other people can go to the SAMM website
          and join you choosing one of the free instruments. They will control their
          instrument and you will be able to hear the patterns they create.
        </p>
        <br/>
        <div className='exitBtn' onClick={() => this.setState({activeTab: ''})}>
          <img src='icons/exit.svg' alt=''/>
        </div>
      </div>
    );
  }

  RenderSpecificHelp() {
    switch (this.props.instrument) {
      case 'drums':
        return (
          <div className='specificHelp'>
            <h2>How to use the drums</h2>
            <br/>
            <p>

            </p>
            <br/>
            <h2>What patterns should I make?</h2>
            <br/>
            <p>
              SAMM is design so you don't have to worry about what kind of patterns
              you should do. Just have fun and find what sequences you like.
              <br/><br/>
              If you really want some tips to impress your friends:
            </p>
            <ul>
              <li>Put the strong sounds (Kick and Snare) in some of the down and back beats.</li>
              <li>Put the hihats in either the back or off beats.</li>
            </ul>
            <br/>
          </div>
        );
        break;
      case 'bass':
      return (
          <div className='specificHelp'>
            <h2>How to use the bass</h2>
            <br/>
            <p>

            </p>
            <br/>
            <h2>What patterns should I make?</h2>
            <br/>
            <p>
              SAMM is design so you don't have to worry about what kind of patterns
              you should do. Just have fun and find what sequences you like.
              <br/><br/>
              If you really want some tips to impress your friends:
            </p>
            <ul>
              <li>Make the root note sound on the down beat.</li>
              <li>Turn some notes off.</li>
              <li>Try alternating between the root and the octave.</li>
            </ul>
            <br/>
          </div>
        );
        break;
      case 'melody':
        return (
          <div className='specificHelp'>
            <h2>How to use the melody</h2>
            <br/>
            <p>

            </p>
            <br/>
            <h2>What patterns should I make?</h2>
            <br/>
            <p>
              SAMM is design so you don't have to worry about what kind of patterns
              you should do. Just have fun and find what sequences you like.
              <br/><br/>
              If you really want some tips to impress your friends:
            </p>
            <ul>
              <li>Create alternating sequences going up and down.</li>
              <li>Leave some notes off for dramatic silences.</li>
              <li>Try putting a different sequence in each bar.</li>
            </ul>
            <br/>
          </div>
        );
        break;
    }
  }

  PrintChordProgression() {
    return this.props.song.progressionName.map((chord, i) => {
      return <div key={i} className={'chord'+(this.props.bar===i?' active':'')}><h2>{chord}</h2></div>;
    });
  }
}

SongInfo.propTypes = {
  bar: PropTypes.number.isRequired,
  song: PropTypes.object.isRequired,
  instrument: PropTypes.string.isRequired
}

export default SongInfo;
