import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/SoloStyle.css';

class Solo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bar: 0
    }
  }

  render() {
    var MediaQuery = require('react-responsive');
    return (
      <div>
        <MediaQuery query='(min-width: 800px)'>
          <div id="Solo" className="instrumentUILarge">
            {this.RenderSolo()}
          </div>
        </MediaQuery>
        <MediaQuery query='(max-width: 800px)'>
          <div id="Solo" className="instrumentUISmall">
            {this.RenderSolo()}
          </div>
        </MediaQuery>
      </div>
    );
  }

  RenderSolo() {
    return (
      <svg id="BassModule" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      {this.RenderControls()}
      {this.RenderGrid()}
      {this.RenderLines()}
      <g className="pads">
        {this.RenderPads()}
      </g>
      {this.RenderSelector()}
      </svg>
    );
  }

  RenderControls() {
    return (
      <g className="controls">
        <g className={"bar"+(this.state.bar===0?" active":"")}
           onClick={() => this.ChangeBar(0)}>
      		<rect stroke="#181818" fill={this.state.bar===0?"#181818":"#791FC6"}
            x="12.4" y="2.6" rx="1" ry="1" width="15" height="15"/>
      		<path fill={this.state.bar===0?"#791FC6":"#181818"}
            d="M21.6,14.4h-3.4v-0.9h1.1V6.5h-1.1V5.6h3.4v0.9h-1.1v6.9h1.1V14.4z"/>
      	</g>
      	<g className={"bar"+(this.state.bar===1?" active":"")}
           onClick={() => this.ChangeBar(1)}>
      		<rect stroke="#181818" fill={this.state.bar===1?"#181818":"#791FC6"}
            x="32.4" y="2.6" rx="1" ry="1" width="15" height="15"/>
      		<g fill={this.state.bar===1?"#791FC6":"#181818"}>
      			<path d="M39.9,14.5h-3.5v-0.9h1.2v-7h-1.2V5.6h3.5v0.9h-1.2v7h1.2V14.5z"/>
      			<path d="M43.4,14.5h-3.5v-0.9h1.2v-7h-1.2V5.6h3.5v0.9h-1.2v7h1.2V14.5z"/>
      		</g>
      	</g>
      	<g className={"bar"+(this.state.bar===2?" active":"")}
           onClick={() => this.ChangeBar(2)}>
      		<rect stroke="#181818" fill={this.state.bar===2?"#181818":"#791FC6"}
            x="52.5" y="2.6" rx="1" ry="1" width="15" height="15"/>
      		<g fill={this.state.bar===2?"#791FC6":"#181818"}>
      			<path d="M58.3,14.4h-3.4v-0.9H56V6.6h-1.1V5.7h3.4v0.9h-1.1v6.9h1.1V14.4z"/>
      			<path d="M61.7,14.4h-3.4v-0.9h1.1V6.6h-1.1V5.7h3.4v0.9h-1.1v6.9h1.1V14.4z"/>
      			<path d="M65.2,14.4h-3.4v-0.9h1.1V6.6h-1.1V5.7h3.4v0.9H64v6.9h1.1V14.4z"/>
      		</g>
      	</g>
      	<g className={"bar"+(this.state.bar===3?" active":"")}
           onClick={() => this.ChangeBar(3)}>
      		<rect stroke="#181818" fill={this.state.bar===3?"#181818":"#791FC6"}
            x="72.4" y="2.6" rx="1" ry="1" width="15" height="15"/>
      		<g fill={this.state.bar===3?"#791FC6":"#181818"}>
      			<path d="M85.6,14.4H74.3v-0.9h1.1V6.5h-1.1V5.6h11.3v0.9h-9v6.9h9V14.4z"/>
      			<path d="M85.3,5.6l-3.2,8.7h-1.5l-3.2-8.7h1.2l2.7,7.7l2.7-7.7H85.3z"/>
      		</g>
      	</g>
      </g>
    );
  }

  RenderGrid() {
    var pattern = this.props.pattern.pattern;
    return pattern[this.state.bar].map((b, i) => {
      return (
        <line key={i} x1={(i+1)*11.11} y1={21} x2={(i+1)*11.11} y2={100}
          stroke="rgba(24, 24, 24, 0.5)"/>
      );
    });
  }

  RenderLines() {
    var pattern = this.props.pattern.pattern;
    return pattern[this.state.bar].map((b, i) => {
      if(i<7 && b!=='-' && pattern[this.state.bar][i+1]!=='-') {
        var j = pattern[this.state.bar][i+1];
        return (
          <line key={i} x1={(i+1)*11.11} y1={20+(b+1)*7.27} x2={(i+2)*11.11} y2={20+(j+1)*7.27}
            stroke="#181818"/>
        );
      }
    });
  }

  RenderPads() {
    var pattern = this.props.pattern.pattern;
    return pattern[this.state.bar].map((b, i) => {
      var h = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      return h.map((j) => {
        var active = (b===j);
        return (
          <circle key={i+":"+j} className={"pad"+(active?" active":"")} stroke={active?"#181818":"#791FC6"} fill={active?"#181818":"#791FC6"}
            onClick={() => this.ToggleBeat(i,j)}
            cx={(i+1)*11.11} cy={20+(j+1)*7.27} r="1.5"/>
        );
      });
    });
  }

  RenderSelector() {

  }

  ChangeBar(b) {
    this.setState({
      bar: b
    });
  }

  ToggleBeat(i,j) {
    var solo = this.props.pattern;
    solo.pattern[this.state.bar][i] = (solo.pattern[this.state.bar][i]===j?'-':j);
    this.props.update(solo);
  }
}

Solo.propTypes = {
  beat: PropTypes.number.isRequired,
  pattern: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired
}

export default Solo;
