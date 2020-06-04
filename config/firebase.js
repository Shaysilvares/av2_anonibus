import firebase from 'firebase';
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2RsoXQvHrp_TKIZGLnuo68KXTol9ZYFQ",
  authDomain: "anonibus-531aa.firebaseapp.com",
  databaseURL: "https://anonibus-531aa.firebaseio.com",
  projectId: "anonibus-531aa",
  storageBucket: "anonibus-531aa.appspot.com",
  messagingSenderId: "650442114727",
  appId: "1:650442114727:web:174917d207a1ea6403fd82"
};

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();