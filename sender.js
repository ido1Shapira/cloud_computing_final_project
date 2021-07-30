const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const redis = require('redis');
const { isObject } = require('util');
const redisClient = redis.createClient();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

function init() {
    redisClient.flushdb( function (err, succeeded) {
        console.log(succeeded); 
    });
    let segments = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0};
    redisClient.set('segmentsNum', JSON.stringify(segments), function (err, reply) {
    });

}

redisClient.on('connect', function () { 
    console.log('Sender connected to Redis');
    init();  
});


var Db = {
    InsertCar: function (c) {
        var car = JSON.parse(c);
        redisClient.publish("message",JSON.stringify(car),function(){
        });
    }
};
redisClient.on('connect', function () {
    console.log('Sender connected to Redis');
});
server.listen(6062, function () {
    console.log('Sender is running on port 6062');
});

module.exports = Db
