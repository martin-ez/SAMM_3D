import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Snap from 'snapsvg';

import './css/InstrumentSelectStyle.css';

class InstrumentSelect extends Component {
  constructor(props) {
    super(props);
    //this.GetName = this.GetName.bind(this);
    this.state = {
      instrument: '',
    }
  }
  render() {
    if(this.props.loader) {
      return (
        <div id='InstrSelect' className='page'>
          <h1 className='label'>Loading instruments...</h1>
          <div className='instruments'>
            <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
              <g>
                <rect className='loaderRect' x='10%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill='#1C1C1C'/>
                <rect className='loaderRect' x='40%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill='#1C1C1C'/>
                <rect className='loaderRect' x='70%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill='#1C1C1C'/>
              </g>
            </svg>
          </div>
        </div>
      );
    }
    else if(this.state.instrument === ''){
      return (
        <div id='InstrSelect' className='page'>
          <h1 className='label'>Select your instrument</h1>
          <div className='instruments'>
            {this.RenderInstruments()}
            <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
              <g>
                <rect className={'instrRect drums '+(this.props.song.drums.user!==''?'taken':'')} x='10%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill={this.props.song.drums.user===''?'#DF2230':'none'} stroke='#DF2230'/>
                <rect className={'instrRect bass '+(this.props.song.bass.user!==''?'taken':'')} x='40%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill={this.props.song.bass.user===''?'#11882A':'none'} stroke='#11882A'/>
                <rect className={'instrRect melody '+(this.props.song.melody.user!==''?'taken':'')} x='70%' y='10%' rx='3%' ry='3%' width='20%' height='20%'
                  fill={this.props.song.melody.user===''?'#791FC6':'none'} stroke='#791FC6'/>
              </g>
            </svg>
          </div>
        </div>
      );
    }
    else {
      return (
        <div id='InstrSelect' className='page'>
          <h1 className='label'>Select your instrument</h1>
          <div className='instruments'>
            <svg id='svgCanvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
            </svg>
          </div>
        </div>
      );
    }
  }

  componentDidUpdate() {
    if(this.state.instrument!=='') {
      var s = Snap('#svgCanvas');
      var r = s.rect('10%', '10%', '20%', '20%', '3%', '3%');
      r.attr({
        fill: '#DF2230'
      });
      switch (this.state.instrument) {
        case 'bass':
          r.attr({
            fill: '#11882A',
            x: '40%'
          });
          break;
        case 'melody':
          r.attr({
            fill: '#791FC6',
            x: '70%'
          });
          break;
      }
      r.animate({
        x: '10%',
        width: '80%',
        height: '60%'
      }, 500, mina.backout);
    }
  }

  RenderInstruments() {
    var instruments = ['drums', 'bass', 'melody'];
    return instruments.map((instr, i) => {
      if(this.props.song[instr].user==='') {
        return (
          <div key={i} className={'instr '+instr}
            onClick={() => this.setState({instrument: instr})}>
            <h2>{instr}</h2>
          </div>
        );
      } else {
        return (
          <div key={i} className={'instr '+instr+' taken'}>
            <span>
              <h2>{instr}</h2>
              <h1>Played by {this.props.song[instr].user}</h1>
            </span>
          </div>
        );
      }
    });
  }
}

InstrumentSelect.propTypes = {
  loader: PropTypes.bool.isRequired,
  song: PropTypes.object.isRequired,
  select: PropTypes.func.isRequired
}

export default InstrumentSelect;
