
import firebase from 'firebase'

var config = {
    apiKey: "AIzaSyAurYk2yDza7rvZ57VKFm6GGNoWgq39Q4w",
    authDomain: "cessions-e83a9.firebaseapp.com",
    databaseURL: "https://cessions-e83a9.firebaseio.com",
    projectId: "cessions-e83a9",
    storageBucket: "cessions-e83a9.appspot.com",
    messagingSenderId: "259478921601"
  };

  const fire = firebase.initializeApp(config);
  export default fire
