const express = require('express');
const path = require('path');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server)
const port = 3000

var mongo_flag = false;
var bigML_flag = false;
var consumer_flag = false;
var producer_flag = false;
var simulator_flag = false;

var redis_flag = false;

let confusionMatrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];

// let cars_list = ['Car Id: ', 'Segment exit predict:'];

let cars_list = [];
let predicts_list = [];


//------------------- mongoDB -----------

const mongodb = require('./mongoDB');

//------------------- bigML -----------

const bigml = require('./bigML');

app.post('/trainModel', (req, res) => {
    if(mongo_flag && bigML_flag) {
        mongodb.dataToCSV();
        bigml.trainModel();
    }
    else {
        res.end(`model can not been trained right now`);
    }
    // res.end(`the model has trained`);
})

//------------------- Redis & Docker -----------

// eden and anna

//------------ kafka------------

const kafkaConsume = require('./kafkaConsume');
const bodyParser = require('body-parser');

// const kafkaPublisher = require('./kafkaProduce');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//------------------- simulator -----------

const simulator = require('./simulator');

//------------ Socket.io ----------------

io.on("connection", (socket) => {
    console.log('a user connected');
});
  

// ----------------------------------------------

app.post('/update_car_list', (req, res) => {
    var car_id = parseInt(req.body.car_id);
    var predict_class = parseInt(req.body.predict);
    cars_list.push(car_id);
    predicts_list.push(predict_class);
    res.redirect('/confusionMatrix');
    io.sockets.emit('reload', {});
})

app.post('/update_confusionMatrix', (req, res) => {
    var predict_class=parseInt(req.body.predict);
    var actual_class=parseInt(req.body.actual);
    var car_id = parseInt(req.body.car_id);

    if(predict_class < 1 || predict_class > 5 ||
        actual_class < 1 || actual_class > 5) {
            console.error("value classes not right: \npredict_class: "+ predict_class + "\nactual_class: "+ actual_class);
    }
    confusionMatrix[predict_class-1][actual_class-1] += 1;

    const index = cars_list.indexOf(car_id);
    if (index > -1) {
        cars_list.splice(index, 1);
        predicts_list.splice(index, 1);
    }

    res.redirect('/confusionMatrix');
    io.sockets.emit('reload', {});
})

app.post('/services', (req, res) => {
    var service= req.body.service;
    var msg= req.body.msg;
    
    if(service == "mongoDB") { mongo_flag = true; }
    else if(service == "bigML") { bigML_flag = true;}
    else if(service == "consumer") { 
        consumer_flag = true;
        kafkaConsume.addObserver(mongodb);
        kafkaConsume.addObserver(bigml);
    }
    else if(service == "producer") {
        producer_flag = true;
    }
    else if(service == "simulator") { simulator_flag = true;}
    
    else if(service == "redis") { redis_flag = true;}

    else {
        console.error("error!");
    }

    if(producer_flag && mongo_flag && !simulator_flag) {
        simulator.run();
    }
    console.log("server msg: "+ msg);

    ready = mongo_flag && bigML_flag && consumer_flag && producer_flag && simulator_flag && redis_flag;
    if(ready) {
        io.sockets.emit('ready', {});
    }
})

//------------

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname)+'/index.html');
});
app.get('/confusionMatrix', (req, res) => res.render('confusionMatrix', {
    confusionMatrix: confusionMatrix,
    cars: cars_list,
    predicts: predicts_list
}));
// 
// app.get('/edenandanna', (req, res) => res.render('edenandanna'));

//------------------------------------
server.listen(port, () => console.log(`Our app listening at http://localhost:${port}`));