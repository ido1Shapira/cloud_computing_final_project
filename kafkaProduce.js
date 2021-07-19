// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const uuid = require("uuid");
const Kafka = require("node-rdkafka");
const axios = require('axios');

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
const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);

producer.on("ready", function(arg) {
  axios.post('http://localhost:3000/services', {
        service: "producer",
        msg: "producer Simulator is ready"
    });
});
producer.connect();

module.exports.publish= function(msg)
{   
  m=JSON.stringify(msg);
  producer.produce(topic, -1, genMessage(m), uuid.v4());  
  //producer.disconnect();   
}