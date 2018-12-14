import React, { Component } from 'react';
import './App.css';
import Assignee from './components/assignee'
import HomepageLayout from './components/assignee';
import Creditor from './components/creditor'

class App extends Component {
  render() {
    return (
      <Creditor></Creditor>
    );
  }
}

export default App;
