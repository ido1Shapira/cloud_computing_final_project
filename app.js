const express = require('express');
const path = require('path');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server)
const port = 3000

let confusionMatrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

//------------------- mongoDB -----------

const mongodb = require('./mongoDB');

//------------------- bigML -----------

const bigml = require('./bigML');

app.post('/trainModel', (req, res) => {
    mongodb.dataToCSV();
    bigml.trainModel();
    // res.end(`the model has trained`);
})

//------------------- Redis & Docker -----------

// eden and anna

//------------ kafka------------

const kafkaConsume = require('./kafkaConsume');
const bodyParser = require('body-parser');

kafkaConsume.addObserver(mongodb);
kafkaConsume.addObserver(bigml);

const kafkaPublisher = require('./kafkaProduce');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//------------------- simulator -----------

const simulator = require('./simulator');
simulator.run();

//------------ Socket.io ----------------

io.on("connection", (socket) => {
    console.log('a user connected');
    // socket.on("simulator", (msg) => {
    //     simulator.run();
    // });
});
  

// ----------------------------------------------




app.post('/updateconfusionMatrix', (req, res) => {
    var predict_class=parseInt(req.body.predict);
    var actual_class=parseInt(req.body.actual);
    
    if(predict_class < 1 || predict_class > 5 ||
        actual_class < 1 || actual_class > 5) {
            console.error("value classes not right: \npredict_class: "+ predict_class + "\nactual_class: "+ actual_class);
    }
    confusionMatrix[predict_class-1][actual_class-1] += 1;
    res.redirect('/confusionMatrix');
    io.sockets.emit('reload', {});
})

//------------

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname)+'/index.html');
});
app.get('/confusionMatrix', (req, res) => res.render('confusionMatrix', {
    confusionMatrix: confusionMatrix
}));
// 
// app.get('/edenandanna', (req, res) => res.render('edenandanna'));

//------------------------------------
server.listen(port, () => console.log(`Our app listening at http://localhost:${port}`));