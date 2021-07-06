// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const uuid = require("uuid");
const Kafka = require("node-rdkafka");
const kafkaConf = {
  "group.id": "cloudkarafka-example", //check what to put here
  "metadata.broker.list": ["dory-01.srvs.cloudkafka.com:9094", "dory-02.srvs.cloudkafka.com:9094", "dory-03.srvs.cloudkafka.com:9094"],
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "19n8xi16",
  "sasl.password": "KptXPXeLsncyhA6zZH6m0cYgjSp8Us4O",
  "debug": "generic,broker,security"
};

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
  console.log(`Consumer ${arg.name} ready`);
  consumer.subscribe(topics);
  consumer.consume();
});

const mongodb = require('./mongoDB')
consumer.on("data", function(m) {
  // console.log(m.value.toString());
  var carParams = JSON.parse(m.value);
  //send here the data to mongo
  mongodb.saveSimulatorTopic(carParams,
    (message)=>{
        console.log(message)
    });
});
consumer.on("disconnected", function(arg) {
  process.exit();
});
consumer.on('event.error', function(err) {
  console.error(err);
  process.exit(1);
});
consumer.on('event.log', function(log) {
  console.log(log);
});
consumer.connect();