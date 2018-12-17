import React, { Component } from 'react';
import './App.css';
import Assignee from './components/assignee/assignee'
import Debtor from './components/debtor/debtor';
import Creditor from './components/creditor/creditor'
import {fire,database} from './config/fire';
import Login from './components/login/login';
//import Home from './home';
import Register from './components/register/register';
import {Router, Route, browserHistory, IndexRoute} from "react-router";
import Acme from './components/acme/acme';

class App extends Component {
  constructor() {
    super();
    this.state = ({
        user: {},
    });
    this.authListener = this.authListener.bind(this);
}

componentDidMount() {
    this.authListener();
}

authListener() {
    fire.auth().onAuthStateChanged((user) => {
        if (user) {
            this.setState({ user });
            var localStorage: Storage
            localStorage.setItem('user', user.uid);
        } else {
            this.setState({ user: null });
            localStorage.removeItem('user');
        }
    });
}
  render() {
    return (
      <Router history = {browserHistory}>
                <Route path = {"/"}> {this.state.user ? (<Assignee />) :(<Acme />)/*(<Login />)*/}
                    <IndexRoute component={Login} />
                    <Route path = {"login"} component = {Login} />
                    <Route path = {"register"} component = {Register}/>
                    <Route path = {"assignee"} component = {Assignee}/>
                    <Route path = {"creditor"} component = {Creditor}/>
                    <Route path = {"debtor"} component = {Debtor}/>
                    <Route path = {"acme"} component = {Acme}/>
                </Route>
      </Router>
      
    );
  }
}

export default App;
