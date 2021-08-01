const redisClient = require('redis').createClient();


redisClient.on('connect', function() {
    console.log('I am connected');
});

consumer.on("error", function(err) {
    console.error(err);
  });
  
module.exports.save = function(data) {
    redisClient.sadd(data.Segment.toString(), data.id.toString()); // add cars to segment
    redisClient.srem(data.Segment.toString(), data.id.toString()); // add conditions; 
    redisClient.smembers(data.Segment.toString()); // show all cars
    redisClient.scard(data.Segment.toString()); // show number of cars per this segment
}