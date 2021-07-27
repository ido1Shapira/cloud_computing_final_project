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
  onEvent: function(carEvent) {
    if(carEvent.Event_type == "road exit") {
      car = {
        vehicle_type: carEvent.vehicle_type,
        Day_of_the_week: carEvent.Day_of_the_week,
        Special_day: carEvent.Special_day,
        Segment: carEvent.Segment
      };
      db.insertOne(car, function(err, res) {
        if (err) throw err;
        console.log("mongoDB: 1 car inserted");
      });
    }
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
