const express = require('express');
const path = require('path');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server)
const port = 3000

//------------------- mongoDB -----------

const mongodb = require('./mongodb')

//------------------- Redis & Docker -----------

// eden and anna

//------------ kafka------------

// const kafkaPublisher = require('./kafkaProduce');
const kafkaConsume = require('./kafkaConsume');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//------------ Socket.io ----------------
// io.on("connection", (socket) => {
//     console.log("new user connected");
//     socket.on("totalWaitingCalls", (msg) => { console.log(msg.totalWaiting) });
//     socket.on("callDetails", (msg) => { console.log(msg);kafkaPublisher.publish(msg) });
// });

//------------------- bigML -----------

const bigml = require('./bigML');
app.post('/trainModel', (req, res) => {
    mongodb.dataToCSV();
    bigml.trainModel();
    res.end(`the model has trained`);
})

//------------

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname)+'/index.html');
});
app.get('/confusionMatrix', (req, res) => res.render('confusionMatrix'));
// 
// app.get('/edenandanna', (req, res) => res.render('edenandanna'));

//------------------------------------
server.listen(port, () => console.log(`Our app listening at http://localhost:${port}`));