const redisClient = require('redis').createClient();
const axios = require('axios');

redisClient.on('connect', function() {
    // Redis Database connection is ready
    axios.post('http://localhost:3000/services', {
        service: "redis",
        msg: "redis container is ready"
    });
});

redisClient.on("error", function(err) {
    console.error(err);
  });

  var redisDB = {
    onEvent: function(carEvent) {
        var needToUpdate = false;
        if(carEvent.Event_type == "segment entry") {
            redisClient.sadd(carEvent.Segment.toString(), carEvent.id.toString()); // add cars to segment
            needToUpdate = true;
        }
        else if(carEvent.Event_type == "segment exit") {
            redisClient.srem(carEvent.Segment.toString(), carEvent.id.toString());
            needToUpdate = true;
        }
        else { // carEvent.Event_type == "road exit" or "road entry"

        }
        
        if(needToUpdate) {
            // view the data on the dashboard

            redisClient.smembers(carEvent.Segment.toString()); // show all cars
            redisClient.scard(carEvent.Segment.toString()); // show number of cars per this segment
        }
    },
    onClose: function() {
        redisClient.flushdb( function (err, succeeded) {
            if (err) throw err;
        });
        console.log("redis: clean redis");
    }
}

module.exports = redisDB;