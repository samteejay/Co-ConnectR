const functions = require("firebase-functions");
const express = require('express')();

const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const config = {}

const firebase = require('firebase');
firebase.initializeApp(config);

app.get('/screams', (req, res) => {
  db
    .collection("screams")
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post('/scream', (req, res) => {
 
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// sign up route
app.post('/signup', (req, res) => {
 
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };    

  // TODO validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get().then(doc => {
    if (doc.exists) {
      return res.status(400).json({ handle: 'this handle is already taken'});
    } else {
      return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
    }
  }).then(data => {
    userId = data.user.uid;
    return res.data.user.getIdToken();
  }).then((idToken) => {
    token = idToken;
    const userCredentials = {
      userId,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      handle: req.body.handle
    };    
    return db.doc(`/users/${newUser.handle}`).set(userCredentials);
  }).then(() => {
    return res.status.(201).json({ token });
  })
  .catch(err => {
    console.error(err);
    if (err.code === 'auth/email-already-in-use') {
      return res.status(400).json({ email: 'Email is already in use' });
    } else {
      return res.status(500).json({ error: error.code });
    }
       
  });

  
// https://baseurls.com/api/
exports.api = functions.region('europe-west1').https.onRequest(app); 