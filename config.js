import * as firebase from 'firebase'
require('@firebase/firestore')


var firebaseConfig = {
    apiKey: "AIzaSyCotoHBJAMwO5RD_fG1c3Fe5qPHLs8hhLE",
    authDomain: "wily-app-a29ef.firebaseapp.com",
    projectId: "wily-app-a29ef",
    storageBucket: "wily-app-a29ef.appspot.com",
    messagingSenderId: "504977660487",
    appId: "1:504977660487:web:6f887ec3fe77fd0d2cef62"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();