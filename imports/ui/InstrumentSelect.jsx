import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Snap from '../snapsvg/dist/snap.svg-min.js';

import './css/InstrumentSelectStyle.css';

class InstrumentSelect extends Component {
  constructor(props) {
    super(props);
    this.StartApp = this.StartApp.bind(this);
    this.inputRef = React.createRef();
    this.state = {
      instrument: ''
    }
  }
  render() {
    if (this.props.loader) {
      return (<div id='InstrSelect' className='page'>
        <h1 className='label'>Loading instruments...</h1>
        <div className='instruments'>
          <svg id='svgCanvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
            <g>
              <rect className='loaderRect' x='10%' y='10%' rx='3%' ry='3%' width='20%' height='20%' fill='#1C1C1C'/>
              <rect className='loaderRect' x='40%' y='10%' rx='3%' ry='3%' width='20%' height='20%' fill='#1C1C1C'/>
              <rect className='loaderRect' x='70%' y='10%' rx='3%' ry='3%' width='20%' height='20%' fill='#1C1C1C'/>
            </g>
          </svg>
        </div>
      </div>);
    } else if (this.state.instrument === '') {
      return (<div id='InstrSelect' className='page'>
        <h1 className='label'>Select your instrument</h1>
        <div className='instruments'>
          {this.RenderInstruments()}
          <svg id='svgCanvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'></svg>
        </div>
      </div>);
    } else {
      return (<div id='InstrSelect' className='page'>
        <h1 className='label'>You will play
          <b>{' '+this.state.instrument+' '}</b>
          in the band
          <b>{' '+this.props.song.band+' '}</b>
        </h1>
        <div className='instruments'>
          <div className='nameInput'>
            <h1>What's your name?</h1>
            <input className='inputBox' type='text' placeholder="Name" ref={(input) => {
                this.inputRef = input;
              }}/>
            <button onClick={() => this.setState({instrument: ''})}>
              <h2>Choose different Instrument</h2>
            </button>
            <button className='alt' onClick={() => this.StartApp()}>
              <h2>Start making music</h2>
            </button>
          </div>
          <svg id='svgCanvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'></svg>
        </div>
      </div>);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.instrument === '' && !this.props.loader) {
      var snap = Snap('#svgCanvas');
      snap.clear();
      var instruments = ['drums', 'bass', 'melody'];
      instruments.map((instr, i) => {
        var dist = 10 + (i * 30);
        var color = i == 0? '#DF2230': (i == 1? '#11882A': '#791FC6');  
        var r = snap.rect(dist + '%', '10%', '20%', '20%', '3%', '3%');
        r.attr({fill: '#1C1C1C', stroke: '#1C1C1C'});
        if (this.props.song[instr].user !== '') {
          r.attr({fill: 'none'});
          r.animate({
            stroke: ''+color
          }, 1500, mina.easeinout);
        } else {
          if (prevState.instrument === instr) {
            r.attr({fill: ''+color, stroke: ''+color, x: '10%', width: '80%', height: '40%'});
            r.animate({
              x: dist + '%',
              width: '20%',
              height: '20%'
            }, 500, mina.backout);
          } else {
            r.animate({'fill': ''+color, 'stroke': ''+color}, 500, mina.easeinout);
          }
        }
      });
    } else if (!this.props.loader) {
      this.inputRef.focus();
      var snap = Snap('#svgCanvas');
      snap.clear();
      var r = snap.rect('10%', '10%', '20%', '20%', '3%', '3%');
      r.attr({fill: '#DF2230'});
      switch (this.state.instrument) {
        case 'bass':
          r.attr({fill: '#11882A', x: '40%'});
          break;
        case 'melody':
          r.attr({fill: '#791FC6', x: '70%'});
          break;
      }
      r.animate({
        x: '10%',
        width: '80%',
        height: '40%'
      }, 500, mina.backout);
    }
  }

  RenderInstruments() {
    var instruments = ['drums', 'bass', 'melody'];
    return instruments.map((instr, i) => {
      if (this.props.song[instr].user === '') {
        return (<div key={i} className={'instr ' + instr} onClick={() => this.setState({instrument: instr})}>
          <h2>{instr}</h2>
        </div>);
      } else {
        return (<div key={i} className={'instr ' + instr + ' taken'}>
          <span>
            <h2>{instr}</h2>
            <h1>Played by {this.props.song[instr].user}</h1>
          </span>
        </div>);
      }
    });
  }

  StartApp() {
    var name = this.inputRef.value;
    if (name === '') {
      name = 'someone';
    }
    var instr = this.state.instrument;
    this.props.select(instr, name);
  }
}

InstrumentSelect.propTypes = {
  loader: PropTypes.bool.isRequired,
  song: PropTypes.object.isRequired,
  select: PropTypes.func.isRequired
}

export default InstrumentSelect;
