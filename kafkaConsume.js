// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const Kafka = require("node-rdkafka");
const kafkaConf = {
  "group.id": "Data from the simulator",
  "metadata.broker.list": ["dory-01.srvs.cloudkafka.com:9094", "dory-02.srvs.cloudkafka.com:9094", "dory-03.srvs.cloudkafka.com:9094"],
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "19n8xi16",
  "sasl.password": "KptXPXeLsncyhA6zZH6m0cYgjSp8Us4O",
  "debug": "generic,broker,security"
};
const axios = require('axios');

let observers = [];

module.exports.addObserver = function(o) {
  observers.push(o);
}

const prefix = "19n8xi16-";
const topic = `${prefix}simulator`;

const topics = [topic];
const consumer = new Kafka.KafkaConsumer(kafkaConf, {
  "auto.offset.reset": "beginning"
});

consumer.on("error", function(err) {
  console.error(err);
});
consumer.on("ready", function(arg) {
  axios.post('http://localhost:3000/services', {
                    service: "consumer",
                    msg: `Consumer ${arg.name} for mongoDB and BigML is ready`
                });
  consumer.subscribe(topics);
  consumer.consume();
});

consumer.on("data", function(m) {
  console.log("consumer: " + m.value.toString());
  var carParams = JSON.parse(m.value);
  for(var i=0; i<observers.length; i++) {
    // console.log(observers[i]);
    observers[i].onEvent(carParams);
  }
  });
consumer.on("disconnected", function(arg) {
  process.exit();
});
consumer.on('event.error', function(err) {
  console.error(err);
  process.exit(1);
});
// consumer.on('event.log', function(log) {
//   console.log(log);
// });
consumer.connect();