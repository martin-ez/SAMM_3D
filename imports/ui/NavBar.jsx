import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './css/NavBarStyle.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    return (
      <div id="NavBar" className={(this.state.open?"open":"close")}>
        <div className="icon" onClick={() => this.Toggle()}>
          <img src="icons/logo.svg" alt=""/>
          <img src={"icons/"+(this.state.open?"exit":"next")+".svg"} alt=""/>
        </div>
      </div>
    );
  }

  Toggle() {
    var open = !this.state.open;
    this.setState({
      open: open
    });
  }
}

NavBar.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func.isRequired
}

export default NavBar;
