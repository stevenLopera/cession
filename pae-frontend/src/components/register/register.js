import React, { Component } from 'react';
import {fire, database} from '../../config/fire';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react';
import { browserHistory } from "react-router";
//import { BrowserRouter, Switch, Route } from 'react-router-dom';
//import { connect } from 'react-redux';
//import { signUp } from './trash/authActions';
//import { Redirect } from 'react-router-dom';

class Register extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.signup = this.signup.bind(this);
        this.routeChange = this.routeChange.bind(this);
        //this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            email: '',
            password: '',
            confirmPassword: ''
        };
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    
    /*handleSubmit = (e) => {
        //const { password, confirmPassword } = this.state;
        // perform all neccassary validations
        //if (this.state.password !== this.state.confirmPassword) {
        //    window.alert('Passwords does not match!');
       // } else {
            e.preventDefault();
            this.props.signUp(this.state);
       // }
    }*/
    routeChange(){
        browserHistory.push("/login");
    }

    async signup(e) {
        if (this.state.password !== this.state.confirmPassword) {
            window.alert('Passwords does not match!');
        } else {
            /*e.preventDefault();
            fire.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((u) => {
            }).then((u) => { console.log(u) })
                .catch((error) => {
                    console.log(error);
                })
            fire.auth().onAuthStateChanged(function(user) {
                if (user) {
                    browserHistory.push("/home-single");
                }
            });
        }*/
            e.preventDefault();
            await this.emailSignUp();
            this.afterSignIn();
        }
    }

    emailSignUp() {
    
        return fire.auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then(credential => {
            //window.alert('Welcome new user!', 'success');
            return this.updateUserData(credential.user); // if using firestore
          })
          .catch(error => window.alert(error.message));
    }

    afterSignIn() {
        console.log(this.user);
        // Do after login stuff here, such router redirects, toast messages, etc.
        fire.auth().onAuthStateChanged(function(user) {
            if (user) {
                browserHistory.push("/assignee");
            }
        });
    }
    updateUserData(user) {
        // Sets user data to firestore on login
    
        //const userRef = new AngularFirestoreDocument();// 
        
        var userRef = database.ref('users/' +user.uid);
        console.log(userRef);
        

        const data = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          roles: {
              debtor: false,
              creditor: false,
              assignee: true,
              acme: false
          }
        }
    
        return userRef.set(data)
    
      }

    render() {
        //const{authError, auth} = this.props;
        //if (auth.uid) return <Redirect to ='/'/>
        return (
            <div className='Register'>
                {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */          }
                <style>{`
                    body > div,
                    body > div > div,
                    body > div > div > div.login-form {
                    height: 100%;
                    }
                `}</style>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as='h2' color='teal' textAlign='center'>
                            Register into Cessions
                        </Header>
                        <Form size='large'>
                            <Segment stacked>
                                <Form.Input fluid
                                    icon='user'
                                    iconPosition='left'
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                    type="email" name="email"
                                    class="form-control"
                                    id="exampleInputEmail1"
                                    aria-describedby="emailHelp"
                                    placeholder="Enter email" />
                                <Form.Input
                                    fluid
                                    icon='lock'
                                    iconPosition='left'
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    type="password"
                                    name="password"
                                    class="form-control"
                                    id="exampleInputPassword1"
                                    placeholder="Password"
                                />
                                <Form.Input
                                    fluid
                                    icon='lock'
                                    iconPosition='left'
                                    value={this.state.confirmPassword} //verificar como igualar las passwords
                                    onChange={this.handleChange}
                                    type="password"
                                    name="confirmPassword"
                                    class="form-control"
                                    id="exampleInputPassword2"
                                    placeholder="Repeat Password"
                                />

                                <Button color='teal' fluid size='large' type="submit" onClick={this.signup} class="btn btn-primary">
                                    Register
                                </Button>
                            </Segment>
                        </Form>
                        <Message>
                            We will not share any private information
                            <Button onClick={this.routeChange} class="btn btn-primary" color='teal' fluid size='large'>Go back to Login</Button>
                        </Message>
                    </Grid.Column>
                </Grid>
            </div>

        );
    }
}


export default Register;