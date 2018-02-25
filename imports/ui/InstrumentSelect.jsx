import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {TweenMax, Power2, TimelineLite} from 'gsap';

import './css/InstrumentSelectStyle.css';

class InstrumentSelect extends Component {
  render() {
    return (
      <div id="InstrSelect" className="page">
        <h1 className="label">Select your instrument</h1>
        <div className="instruments">
          {this.RenderInstruments()}
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g ref={(b) => (this.buttons = b)} id="colorsGroup">
              <rect x="10%" y="10%" rx="5%" ry="5%" width="35%" height="35%"
                fill={this.props.song.drums.user===""?"#DF2230":"none"} stroke="#DF2230"/>
              <rect x="55%" y="10%" rx="5%" ry="5%" width="35%" height="35%"
                fill={this.props.song.bass.user===""?"#107AB3":"none"} stroke="#107AB3"/>
              <rect x="10%" y="55%" rx="5%" ry="5%" width="35%" height="35%"
                fill={this.props.song.keys.user===""?"#11882A":"none"} stroke="#11882A"/>
              <rect x="55%" y="55%" rx="5%" ry="5%" width="35%" height="35%"
                fill={this.props.song.solo.user===""?"#791FC6":"none"} stroke="#791FC6"/>
            </g>
          </svg>
        </div>
      </div>
    );
  }

  RenderInstruments() {
    var instruments = ["drums", "bass", "keys", "solo"];
    return instruments.map((instr, i) => {
      if(this.props.song[instr].user==="") {
        return (
          <div key={i} className={"instr "+instr}
            onMouseEnter={() => this.OnMouseEnterAnimation(i)}
            onMouseLeave={() => this.OnMouseLeaveAnimation(i)}
            onClick={() => this.props.select(instr)}>
            <h2>{instr}</h2>
          </div>
        );
      } else {
        return (
          <div key={i} className={"instr "+instr+" taken"}>
            <span>
              <h2>{instr}</h2>
              <h1>Played by {this.props.song[instr].user}</h1>
            </span>
          </div>
        );
      }
    });
  }

  OnMouseEnterAnimation(i) {
    let target = this.buttons.childNodes[i];
    let tl = new TimelineLite();
    tl.set(target, {scaleX: 1, scaleY: 1, transformOrigin: "50% 50%"});
    tl.to(target, 0.2, {scaleX: 1.2, scaleY: 1.2, ease: Sine.easeInOut});
  }

  OnMouseLeaveAnimation(i) {
    let target = this.buttons.childNodes[i];
    let tl = new TimelineLite();
    tl.to(target, 0.2, {scaleX: 1, scaleY: 1, ease: Sine.easeInOut});
  }
}

InstrumentSelect.propTypes = {
  song: PropTypes.object.isRequired,
  select: PropTypes.func.isRequired
}

export default InstrumentSelect;
