import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/HomeStyle.css';

const homeLayoutLarge = {
  display: 'grid',
  gridTemplateColumns: '55vw 45vw'
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameInput: false,
    }
  }

  render() {
    var MediaQuery = require('react-responsive');
    return (
      <div id="Home" className="page" style={homeLayoutLarge}>
        {this.RenderLogo()}
        {this.RenderText()}
        {this.state.nameInput?this.RenderNameInput():() =>{return;}}
      </div>
    );
  }

  RenderLogo() {
    return (
      <div className="logoBox">
        <div className="content">
          <div className="logo">
            <img src="icons/logo.svg" alt="SAMM's Logo"/>
          </div>
          <div className="ctaContainer">
            <button className="ctaButton"
              onClick={() => this.DisplayInput()}>
              <h1 className="text fwThin">Make Music</h1>
            </button>
          </div>
        </div>
      </div>
    );
  }

  DisplayInput() {
    this.setState({
      nameInput: true
    });
  }

  RenderText() {
    return (
      <div className="box inverted">
        <div id="HomeInfo" className="infoPage">
          <span>
            <h1>Social Adaptable Music Maker</h1>
            <br/>
            <h2>What is SAMM?</h2>
            <br/>
            <p>
              It's a place where you can create music with total strangers. You
              don't need to know any music theory, just have fun jamming out.
            </p>
            <br/>
            <h2>How can I use it?</h2>
            <br/>
            <p>
              Click the "Make Music" button to start creating. You can also log in
              to be able to save songs.
            </p>
          </span>
        </div>
      </div>
    );
  }

  RenderNameInput() {

  }
}

Home.propTypes = {
  startSession: PropTypes.func.isRequired
}

export default Home;
