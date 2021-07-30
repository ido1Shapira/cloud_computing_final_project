const express = require('express');
const app = require('express')();
const redis = require('redis');
const redisClient = redis.createClient();
const server = require('http').createServer(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


redisClient.on('connect', function() {
    console.log('Receiver connected to Redis');
    redisClient.subscribe('message');
});


server.listen(6061, function() {
    console.log('receiver is running on port 6061');
});

module.exports.redisC = redisClient;
