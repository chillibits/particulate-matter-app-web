import firebase from '@firebase/app'
import '@firebase/database';

var config = {
  apiKey: "AIzaSyBcaCFA3uJQ7WrjRflWoIdQFhuFmqBEmcI",
  authDomain: "feinstaub-app-web.firebaseapp.com",
  databaseURL: "https://feinstaub-app-web.firebaseio.com",
  projectId: "feinstaub-app-web",
  storageBucket: "feinstaub-app-web.appspot.com",
  messagingSenderId: "985064412726"
};

var fire = firebase.initializeApp(config);

export default fire;
