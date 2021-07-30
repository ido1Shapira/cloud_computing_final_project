const axios = require('axios')
const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('connect', function() {
    console.log('I am connected');
});

// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

// server.listen(6063, function() {
//     console.log('Running on port 6063');
// });

var redisOp = {
    // save to db

    // read from db

    // view data

    onEvent: function(carEvent) {
        // what to do on event of car from kafka ...
        console.log("redis: msg: "+ carEvent);
    }
}

module.exports = redisOp;


// const getData = {
//     getSegments: function (segmentNum, sendToViewTheList) {
//         redisClient.hgetall(segmentNum, function(err, result){
//             if(err) console.log(err);
//             sendToViewTheList(result);
//         });
//     },
//     getNumberOfCars: function (sendToViewTheNumbers) {
//         redisClient.get('segmentsNum', (err, reply) => {
//             if(err) console.log(err);
//             sendToViewTheNumbers(reply);
//         });
//     }
// }

// module.exports.getData = getData;

axios.post('http://localhost:3000/services', {
        service: "redis",
        msg: "redis is ready"
});
