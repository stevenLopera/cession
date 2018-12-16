import React, { Component } from 'react';
import {fire, database} from '../../config/fire';
import { Button, Form, Grid, Header, Image, Message, Segment, Dimmer } from 'semantic-ui-react';
import { auth } from 'firebase/app';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { AngularFirestore, AngularFirestoreDocument } from 'firebase/firestore';
import { browserHistory } from "react-router";

//import {AuthService} from './core/auth.service';

class Login extends Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.routeChange = this.routeChange.bind(this);
        //this.Register = this.Register.bind(this);
        this.state = {
            email: '',
            password: ''
        };
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    getUserRoles() {
        var fireRef = database.ref()
        var userid = fire.auth().currentUser.uid
        return fireRef.once("value").then(function(snapshot) {
            //var email = (snapshot.val() && snapshot.val().email) || 'anonymous';
            var roles = snapshot.child(`users/${userid}/roles`);
            return roles.val()
        });
    }

    async login() {
        await this.emailLogin();
        this.afterSignIn();
        /*fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then((u) => {
        }).catch((error) => {
            console.log(error);
        });*/
    }

    async afterSignIn() {
        //console.log(this.user);
        /*var userId = fire.auth().currentUser.uid;
        var userRoles = database.ref('users/' + userId).once('value').then(database.snapshot.val() && database.snapshot.val().roles);//this.getUser();
        console.log(userRoles);*/
        // Do after login stuff here, such router redirects, toast messages, etc.
        var userRole = await this.getUserRoles().then((roles) => fire.auth().onAuthStateChanged(function() {
                                                            if(roles.creditor){
                                                                browserHistory.push("/creditor");
                                                            }else if(roles.debtor){
                                                                browserHistory.push("/debtor");
                                                            }else if (roles.assignee) {
                                                                console.log(fire.auth().currentUser.uid)
                                                                browserHistory.push("/assignee");
                                                            }
                                                        }));
        console.log(userRole);
        
        
    }

    async emailLogin() {
        return fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(credential => {
            //this.notify.update('Welcome back!', 'success');
            console.log("credential");
            
            //return this.updateUserData(credential.user);
          })
          .catch(error => window.alert(error.message));
    }

    
    /*updateUserData(user) {
        // Sets user data to firestore on login
    
        //const userRef = new AngularFirestoreDocument();// 
        
        var userRef = database.ref('users/' +user.uid);
        console.log(userRef);
        

        const data = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }
    
        return userRef.set(data)
    
      }*/

    routeChange(){
        browserHistory.push("/register");
    }
    


    render() {
        return (
            <div className='Login-'>
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
                            Log-in to your account
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

                                <Button type="submit" onClick={this.login} class="btn btn-primary" color='teal' fluid size='large' >
                                    Login
                                </Button>
                            </Segment>
                        </Form>
                        <Message>
                            New to us? 
                            <Button onClick={this.routeChange} class="btn btn-primary" color='teal' fluid size='large'>Register</Button>
                        </Message>
                    </Grid.Column>
                </Grid>
            </div>           
        );
    }
}
export default Login;