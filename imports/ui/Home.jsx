import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/HomeStyle.css';

class Home extends Component {

  render() {
    return (
      <div id="Home" className="page">
        {this.RenderLogo()}
        {this.RenderText()}
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
              <h2>Make Music</h2>
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
    this.props.startSession("FakeName");
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
              Click the "Make Music" button to start creating. Choose your
              favorite instrument and create a pattern in your sequencer.
            </p>
          </span>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  startSession: PropTypes.func.isRequired
}

export default Home;
