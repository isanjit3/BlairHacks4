//Add different dependencies and modules
const express  = require('express');
const app      = express();
const firebase = require('firebase')

//Initilize Firebase
var firebaseConfig = {

};
firebase.initializeApp(firebaseConfig);

app.get('/index', function(req, res) {
    res.render('index');
})

//Listen for web application on localhost:8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));