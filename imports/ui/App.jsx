import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {withTracker} from 'meteor/react-meteor-data';
import {SessionDB} from '../api/Session.js';

import SongGenerator from '../engines/sound/SongGenerator.js';

import Home from './Home.jsx';
import Room from './Room.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.UserLeaving = this.UserLeaving.bind(this);
    this.state = {
      view: 'home',
      sessionSong: null,
      list: [],
      instrumentPlayed: null
    }
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.UserLeaving);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      sessionSong: nextProps.currentSong,
      list: nextProps.songs
    });
  }

  render() {
    return (
      <div className='app'>
        {this.RenderPage()}
      </div>
    );
  }

  RenderPage() {
    if (this.state.view === 'home') {
      return (
        <Home startSession={(v) => this.StartSession(v)} />
      );
    }
    else if (this.state.view === 'room') {
      return (
        <Room
        song={this.state.sessionSong.song}
        update={(s) => this.UpdateSessionSong(s)}
        instrument={(instr) => this.SetInstrument(instr)}
        leaveSession={() => this.LeaveSession()}/>
      );
    }
  }

  StartSession() {
    if(this.state.sessionSong===null) {
      var end = false;
      if (this.state.list.length !== 0) {
        for (var i = 0; i < this.state.list.length && !end; i++) {
          if (this.state.list[i].noUsers < 3) {
            var id = this.state.list[i]._id;
            Meteor.call('session.addUser',{
              id
            }, (error, response) =>{
              if (error) {
                console.log(error);
              } else {
                console.log('SessionSong updated');
                Session.set('currentSong', id);
                var s = SessionDB.findOne(id);
                this.setState({
                  sessionSong: s,
                  view: 'room'
                });
              }
            });
            end = true;
          }
        }
      }
      if (!end) {
        var songGenerator = new SongGenerator();
        var song = songGenerator.CreateNewSong();
        var noUsers = 1;
        Meteor.call('session.addSong',{
          song,
          noUsers
        }, (error, response) => {
          if (error) {
            console.log(error);
          } else {
            console.log('SessionSong added');
            Session.set('currentSong', response);
            var s = SessionDB.findOne(response);
            this.setState({
              sessionSong: s,
              view: 'room'
            });
          }
        });
      }
    } else {
      this.setState({
        view: 'room'
      });
    }
  }

  LeaveSession() {
    if(this.state.sessionSong !== null) {
      var id = this.state.sessionSong._id;
      var instrument = this.state.instrumentPlayed;
      Meteor.call('session.deleteUser', {
        id,
        instrument
      }, (error, response) => {
        if (error) {
          console.log(error);
        } else {
          console.log('User remove from session');
          this.setState({
            view: 'home'
          });
        }
      });
    }
  }

  SetInstrument(instr) {
    this.setState({
      instrumentPlayed: instr
    });
  }

  UpdateSessionSong(song) {
    var id = this.state.sessionSong._id;
    Meteor.call('session.updateSong', {
      id,
      song
    }, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log('SessionSong updated');
        var s = SessionDB.findOne(id);
        this.setState({
          song: s
        });
      }
    });
  }

  UserLeaving() {
    if(this.state.sessionSong !== null) {
      var id = this.state.sessionSong._id;
      var instrument = this.state.instrumentPlayed;
      Meteor.call('session.deleteUser', {
        id,
        instrument
      }, (error, response) => {
        if (error) {
          console.log(error);
        } else {
          console.log('User remove from session');
        }
      });
    }
  }
}

App.propTypes = {
  currentSong: PropTypes.object,
  songs: PropTypes.array
};

export default withTracker(props => {
  const handle = Meteor.subscribe('session');
  var current = Session.get('currentSong');
  if (current === undefined || current === null) {
    var songsInSession = SessionDB.find({}).fetch();
    return {
      currentSong: null,
      songs: songsInSession
    };
  } else {
    var s = SessionDB.findOne(current);
    return {
      currentSong: s,
      songs: null
    };
  }
})(App);
