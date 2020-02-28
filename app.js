//Add different dependencies and modules
const express    = require('express');
const path       = require('path');
const app        = express();
const bodyParser = require('body-parser');
const firebase   = require('firebase');
const jwt        = require('jsonwebtoken');
const ejsLint = require('ejs-lint');
var secret = "G43xDkbyqGymYbkyCrtt3Y3qEQmaMb4fJ2VeYjJEBkMKXYSK3b"

//Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBTtgKgzsEg8QxAsguxRyeGRZ0E7JvxxPM",
    authDomain: "cloudtemplate-8e82a.firebaseapp.com",
    databaseURL: "https://cloudtemplate-8e82a.firebaseio.com",
    projectId: "cloudtemplate-8e82a",
    storageBucket: "cloudtemplate-8e82a.appspot.com",
    messagingSenderId: "1045333148388",
    appId: "1:1045333148388:web:c427c7f478d125bf2862f1",
    measurementId: "G-JSEMSM1C1S"
};
firebase.initializeApp(firebaseConfig);

//Setup ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Write data to Firebase
function writeFirebase(jsonData) {
  var database = firebase.database();
  var ref = database.ref("people/" + jsonData.firstname);
  ref.set(jsonData);
}

app.post('/save', function (req, res) {
  let formData = {
      firstname: req.body.first_name,
      lastname: req.body.last_name,
      email: req.body.email
  }
  writeFirebase(formData);

  res.status(200).send("success");
});

//Read data from Firebase
function readFirebase() {
  return firebase.database().ref('tickets').once('value').then(function (snapshot) {
    var jsonData = [];
    snapshot.forEach(function (child) {

      var info = {
        "first": child.child("first").val(),
        "middle": child.child("middle").val(),
        "last": child.child("last").val(),
        "sID": child.child("sID").val(),
        "ticket": child.key,
        "grade": child.child("grade").val(),
        "guestBool": child.child("guestBool").val(),
        "guest": child.child("guest").val()
      }
      jsonData.push(info);

    });
    return jsonData;
  });
}

function verifyJWT(req) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    res.status(200).send(decoded);
  });
}

//Render main page
app.get('/', function (req, res) {
  res.render('login');
})

app.post('/login', function(req, res ) {
  let username = req.body.username; 
  let password = req.body.password;

  const userRef = firebase.database().ref('users');
  userRef.orderByChild("username").equalTo(username).once('value').then( function(result) {
    console.log(result);
    try {
      if (!(result.exists())) {
        console.log("User Not Found");
        res.status(401).send({ error: "Invalid Username or Password" });
        res.end()
      }
      result.forEach(function (child) {
        var uname = child.child('username').val();
        var pwd = child.child('password').val();
        if (pwd == password){
          console.log("Login Successful");
          var token = jwt.sign({ id: username }, secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          res.status(200).send({ auth: true, token: token });
        } else {
          console.log("Login Failed");
          res.status(401).send({ error: "Invalid Username or Password" });
        }
     });
    } catch (error) {
      console.log(error)
    }
  })
  


})

//Render index page
app.get('/index', function (req, res) {
  res.render('index');
})

app.get('/write', function (req, res) {
    res.render('write');
})

//Render display page
app.get('/display', function(req, res) {
  res.render('display');
})

//Render the settings page
app.get('/settings', function (req, res) {
  res.render('settings');
})

//Render the help page
app.get('/help', function (req, res) {
  res.render('help');
})

//Listen for web application on Localhost:3000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});