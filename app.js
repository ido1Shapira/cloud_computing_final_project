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

var ready = false;

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
let car_details_list = [];

const cars_per_seg = new Map();
cars_per_seg.set('1', []);
cars_per_seg.set('2', []);
cars_per_seg.set('3', []);
cars_per_seg.set('4', []);
cars_per_seg.set('5', []);


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

const redis = require('./redis');

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
    // console.log("server: new user on "+ socket.id + " socket");
    if(ready) {
        io.sockets.emit('ready', {});
    }
});
  

// ----------------------------------------------

app.post('/update_car_list', (req, res) => {
    var car_id = parseInt(req.body.car_id);
    var predict_class = parseInt(req.body.predict);
    var car_details = req.body.car_details;

    cars_list.push(car_id);
    predicts_list.push(predict_class);
    car_details_list.push(car_details);

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
        car_details_list.splice(index, 1);
    }

    res.redirect('/confusionMatrix');
    io.sockets.emit('reload', {});
})

app.post('/update_redisView', (req, res) => {
    var seg_name = parseInt(req.body.segment);
    var car = req.body.car;
    var car_id = parseInt(car.id);
    for (let [key, value] of cars_per_seg) {
        for(let car_temp of value) {
            if(car_id ==  parseInt(car_temp.id)) {
                const index = value.indexOf(car_temp);
                if (index > -1) {
                    value.splice(index, 1);
                    break;
                }
            }
        }
    }
    var flag = req.body.ifNotExit;
    if(flag) {
        cars_per_seg.get(""+seg_name).push(car);
    }
    
    res.redirect('/redisView');
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
        kafkaConsume.addObserver(redis);
    }
    else if(service == "producer") {
        producer_flag = true;
    }
    else if(service == "simulator") { simulator_flag = true;}
    
    else if(service == "redis") { redis_flag = true;}

    else {
        console.error("error!");
    }

    if(producer_flag && mongo_flag && redis_flag && !simulator_flag) {
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
    predicts: predicts_list,
    cars_details: car_details_list
}));

app.get('/redisView', (req, res) => res.render('redisView', {
    cars_in_seg1: cars_per_seg.get(""+1),
    cars_in_seg2: cars_per_seg.get(""+2),
    cars_in_seg3: cars_per_seg.get(""+3),
    cars_in_seg4: cars_per_seg.get(""+4),
    cars_in_seg5: cars_per_seg.get(""+5),
}));

//------------------------------------
server.listen(port, () => console.log(`Our app listening at http://localhost:${port}`));

function exitHandler(options, exitCode) {
    if (options.cleanup) {
        redis.onClose();
        mongodb.onClose();
    }
    if (options.exit) {
        console.log("server: shutdown");
        process.exit();
    }
}

//clean and close all servies
process.on('exit', exitHandler.bind(null, {cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));