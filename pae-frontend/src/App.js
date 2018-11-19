import React, { Component } from 'react';
import './App.css';
import Assignee from './components/assignee'
import HomepageLayout from './components/assignee';
import CreditorLayout from './components/creditor';
import DebtorLayout from './components/debtor';

class App extends Component {
  render() {
    return (
      <DebtorLayout></DebtorLayout>
    );
  }
}

export default App;
