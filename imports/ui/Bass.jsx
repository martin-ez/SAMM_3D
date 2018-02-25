import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/BassStyle.css';

class Bass extends Component {
  constructor(props) {
    super(props);
    this.handles = [];
    this.bars = [];
  }

  componentDidMount() {
    import Draggable from "gsap/Draggable";
    var update = this.UpdatePattern.bind(this);
    for (var i = 0; i<this.handles.length; i++) {
      var top = i<8;
      var handle = this.handles[i];
      var bar = this.bars[i];
      Draggable.create(handle, {
        type:"y",
        edgeResistance:1,
        lockAxis:true,
        throwProps:true,
        bounds:bar,
        onDragEnd: function() {
          var v = this.endY;
          var x = 1-((v+12)/24);
          if(x>=0.937) {
            x = 1;
          } else if (x<0.937 && x>=0.812) {
            x = 0.875;
          } else if (x<0.812 && x>=0.687) {
            x = 0.75;
          } else if (x<0.687 && x>=0.562) {
            x = 0.625;
          } else if (x<0.562 && x>=0.437) {
            x = 0.5;
          } else if (x<0.437 && x>=0.312) {
            x = 0.375;
          } else if (x<0.312 && x>=0.187) {
            x = 0.25;
          } else if (x<0.187 && x>=0.062) {
            x = 0.125;
          } else if (x<0.062) {
            x = 0;
          }
          var pos = this.target.x.baseVal.value;
          var top = (pos%10===7);
          var handle = top?((pos+3)/10)-1:((pos-2)/10)+7;
          update(x, handle);
        }
      });
    }
  }

  UpdatePattern(value, index) {
    var bass = this.props.pattern;
    bass.pattern[index] = value;
    this.props.update(bass);
  }

  render() {
    var MediaQuery = require('react-responsive');
    return (
      <div>
        <MediaQuery query='(min-width: 800px)'>
          <div id="Bass" className="instrumentUILarge">
            {this.RenderBass()}
          </div>
        </MediaQuery>
        <MediaQuery query='(max-width: 800px)'>
          <div id="Bass" className="instrumentUISmall">
            {this.RenderBass()}
          </div>
        </MediaQuery>
      </div>
    );
  }

  RenderBass() {
    var sixteenthMode = (this.props.pattern.mode === 16);
    return (
      <svg id="BassModule" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g className="Controls">
      	<path className="Frame" fill="#181818"
          d="M15,0v9.4c0,3.1,2.4,5.6,5.4,5.6h58.9c3.1,0,5.7-2.5,5.7-5.6V0H15z M60,10.3c0,0.9-0.8,1.7-1.7,1.7
      		H21.7c-0.9,0-1.7-0.8-1.7-1.7V4.7C20,3.8,20.8,3,21.7,3h36.6C59.2,3,60,3.8,60,4.7V10.3z"/>
        <circle className="VolumeKnob" fill="#107AB3" cx="72" cy="7.9" r="4.3"/>
        <rect className="ModeSlider" fill="#181818"
          x={sixteenthMode?"43":"22"} y="3.5" rx="2" ry="2" width="15" height="8"/>
        <path fill={sixteenthMode?"#181818":"#107AB3"}
          d="M32,4.5c0,0-0.1-0.1-0.2,0l-3.8,0.9c-0.1,0-0.2,0.1-0.2,0.2v3c-0.2-0.2-0.5-0.3-0.7-0.3
          c-0.6,0-1.1,0.5-1.1,1.2c0,0.6,0.5,1.2,1.1,1.2s1.1-0.5,1.1-1.2V6.7l3.4-0.8v1.8c-0.2-0.2-0.5-0.3-0.7-0.3c-0.6,0-1.1,0.5-1.1,1.2
          c0,0.6,0.5,1.2,1.1,1.2S32,9.3,32,8.6v-4C32,4.6,32,4.5,32,4.5z"/>
        <path fill={sixteenthMode?"#107AB3":"#181818"}
          d="M46.1 9.8c.5 0 1-.4 1-1V6.3h2v2.4c-.1-.1-.3-.1-.4-.1-.5 0-1 .4-1 1 0 .5.4 1 1 1 .5 0 1-.4 1-1V6.3h2V8c-.1-.1-.3-.1-.4-.1-.5
          0-1 .4-1 1s.4 1 1 1c.5 0 1-.4 1-1V6.3h2v2.4c-.1-.1-.3-.1-.4-.1-.5 0-1 .4-1 1 0 .5.4 1 1 1 .5 0 1-.4 1-1V4.8c0-.1-.1-.2-.2-.2h
          -7.5c-.1 0-.2.1-.2.2V8c-.1-.1-.3-.1-.4-.1-.5 0-1 .4-1 1-.5.5-.1.9.5.9zm7.9-4h-7V5h7v.8z"/>
      </g>
      <g className="Pads">
        {this.RenderPads()}
      </g>
      </svg>
    );
  }

  RenderPads() {
    var pattern = this.props.pattern.pattern;
    return pattern.map((b, i) => {
      if(i<8) {
        return (
          <g key={i} className={"slider"+(i===this.props.beat?" active":"")}>
            <rect className="selector" fill={i===this.props.beat?"rgba(229,229,299,0.75)":"none"}
              x={((i+1)*10)-5} y="18" width="10" height="42"/>
            <rect fill="#181818" ref={(b) => {this.bars[i] = b}}
              x={((i+1)*10)-1} y="20" width="2" height="30"/>
          	<rect className="handle" stroke={b==='-'?"none":"#181818"} fill={b==='-'?"none":"#107AB3"}
              ref={(h) => {this.handles[i] = h}}
              x={((i+1)*10)-3} y="34" width="6" height="2"/>
            <circle className="toggle" stroke="#181818" fill={b==='-'?"#107AB3":"#181818"}
              onClick={() => this.ToggleBeat(i)}
              cx={(i+1)*10} cy="55" r="1.7"/>
          </g>
        );
      } else {
        var j = i%8;
        return (
          <g key={i} className={"slider"+(i===this.props.beat?" active":"")}>
            <rect className="selector" fill={i===this.props.beat?"rgba(229,229,299,0.75)":"none"}
              x={(j+1)*10} y="56" width="10" height="42"/>
            <rect fill="#181818" ref={(b) => {this.bars[i] = b}}
              x={((j+1)*10)+4} y="65" width="2" height="30"/>
            <rect className="handle" stroke={b==='-'?"none":"#181818"} fill={b==='-'?"none":"#107AB3"}
              ref={(h) => {this.handles[i] = h}}
              x={((j+1)*10)+2} y="79" width="6" height="2"/>
            <circle className="toggle" stroke="#181818" fill={b==='-'?"#107AB3":"#181818"}
              onClick={() => this.ToggleBeat(i)}
              cx={((j+1)*10)+5} cy="60" r="1.7"/>
          </g>
        );
      }
    });
  }

  ToggleBeat(i) {
    var bass = this.props.pattern;
    bass.pattern[i] = (bass.pattern[i]==='-'?0.5:'-');
    this.props.update(bass);
  }
}

Bass.propTypes = {
  beat: PropTypes.number.isRequired,
  pattern: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired
}

export default Bass;
