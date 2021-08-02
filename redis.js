const redis = require('redis');
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});
// Disable client's AUTH command.
client['auth'] = null;

const axios = require('axios');


client.on('connect', function() {
    // Redis Database connection is ready
    axios.post('http://localhost:3000/services', {
        service: "redis",
        msg: "redis container is ready"
    });
});

client.on("error", function(err) {
    console.error(err);
  });

  var redisDB = {
    onEvent: function(carEvent) {
        var needToUpdate = false;
        if(carEvent.Event_type == "segment entry") {
            client.sadd(carEvent.Segment.toString(), carEvent.id.toString()); // add cars to segment
            needToUpdate = true;
        }
        else if(carEvent.Event_type == "segment exit") {
            client.srem(carEvent.Segment.toString(), carEvent.id.toString());
            needToUpdate = true;
        }
        else { // carEvent.Event_type == "road exit" or "road entry"

        }
        if(needToUpdate) {
            CarNotExit = (carEvent.Event_type == "segment entry");
            axios.post('http://localhost:3000/update_redisView', {  
                segment: carEvent.Segment.toString(),
                ifNotExit: CarNotExit,
                car: carEvent
            });
        }
    },
    onClose: function() {
        client.flushdb( function (err, succeeded) {
            if (err) throw err;
        });
        console.log("redis: clean redis");
    }
}

module.exports = redisDB;