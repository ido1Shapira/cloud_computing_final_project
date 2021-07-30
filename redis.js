const express = require('express');
const app = require('express')();
const redis = require('redis');
const redisClient = redis.createClient();
const server = require('http').createServer(app);

redisClient.on('connect', function() {
    console.log('I am connected');
});

// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(6063, function() {
    console.log('Running on port 6063');
});

const getData = {
    getSegments: function (segmentNum, sendToViewTheList) {
        redisClient.hgetall(segmentNum, function(err, result){
            if(err) console.log(err);
            sendToViewTheList(result);
        });
    },
    getNumberOfCars: function (sendToViewTheNumbers) {
        redisClient.get('segmentsNum', (err, reply) => {
            if(err) console.log(err);
            sendToViewTheNumbers(reply);
        });
    }
}

module.exports.getData = getData;
