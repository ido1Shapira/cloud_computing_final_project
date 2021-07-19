const { MongoClient } = require('mongodb');
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const axios = require('axios');

const dataBase = "simulatorDb";
const uri = "mongodb+srv://ido:ido123123@cluster0.zmnlq.mongodb.net/"+ dataBase+"?retryWrites=true&w=majority";
const collection = "carsDetails";

var db = null; // global variable to hold the connection

// Initialize connection once
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  db = client.db(dataBase).collection(collection);
  // Database connection is ready
  axios.post('http://localhost:3000/services', {
                    service: "mongoDB",
                    msg: "MongoDB is ready"
                });
});

var mongo = {
  close: function() {
    client.close();
    console.log("MongoDB connection closed");
  },
  onEvent: function(event) {
    carEvent = JSON.parse(event);
    if(carEvent.Event_type == "road exit") {
      db.insertOne(newCar, function(err, res) {
        if (err) throw err;
        console.log("1 car inserted");
      });
    }
    //---------------------------------------
    // sendMessage(JSON.stringify(newCar));
  },

  dataToCSV: function () {
    db.find({}).toArray((err, data) => {
      if (err) throw err;
      // console.log(data);
      const json2csvParser = new Json2csvParser({ header: true });
      const csvData = json2csvParser.parse(data);
      fs.writeFile("simulatorData.csv", csvData, function(error) {
        if (error) throw error;
        console.log("mongoDB: Write to simulatorData.csv successfully!");
      });
    });
  }
}

module.exports = mongo;
