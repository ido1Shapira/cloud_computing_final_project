const MongoClient = require('mongodb').MongoClient;
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");

const dataBase = "simulatorDb";
const uri = "mongodb+srv://ido:ido123123@cluster0.zmnlq.mongodb.net/"+ dataBase+"?retryWrites=true&w=majority";
const collection = "carsDetails";

module.exports.saveSimulatorTopic = function (newCar, sendMessage) {
  MongoClient.connect(uri, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dataBase);
      dbo.collection(collection).insertOne(newCar, function(err, res) {
        if (err) throw err;
        console.log("1 car inserted");
        db.close();
      });
    });
  //---------------------------------------
  sendMessage(JSON.stringify(newCar));
}

module.exports.dataToCSV = function () {
  mongodb.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, 
    (err, client) => {
      if (err) throw err;
      client.db(dataBase).collection(collection).find({}).toArray((err, data) => {
        if (err) throw err;
        // console.log(data);
        const json2csvParser = new Json2csvParser({ header: true });
        const csvData = json2csvParser.parse(data);
        fs.writeFile("simulatorData.csv", csvData, function(error) {
          if (error) throw error;
          console.log("Write to simulatorData.csv successfully!");
        });
        client.close();
      });
    });
}