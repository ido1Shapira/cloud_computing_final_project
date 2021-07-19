const axios = require('axios')
var bigml = require('bigml');
var connection = new bigml.BigML('ido1shapira','7e9d42f146576bc3b117ac10bce1799658c35cef')
var source = new bigml.Source(connection);

var model_id = null;
var cars_predict_seg = new Map(); // car_id -> seg predict

var ML = {
    trainModel: function() {
        source.create('./iris.csv', function(error, sourceInfo) {
            if (!error && sourceInfo) {
                var dataset = new bigml.Dataset();
                dataset.create(sourceInfo, function(error, datasetInfo) {
                    if (!error && datasetInfo) {
                        var model = new bigml.Model();
                        model.create(datasetInfo, function(error, modelInfo) {
                            if (!error && modelInfo) {
                                console.log("model has trained!");
                                model_id = modelInfo.resource;
                            }
                        });
                    }
                });
            }
        });
    },

    // on event we predict in which part the car would get out
    onEvent: function(event) {
        console.log("BigML: event: "+ event);
        if(model_id != undefined){
            carEvent = JSON.parse(event);
            if(carEvent.Event_type == "road entry") {
                // new car insert to road
                // need to save car_id and predict
                var car_id = carEvent.id;
                console.log("bigML: model id: "+ model_id);
                var localModel = new bigml.LocalModel(model_id);
                localModel.predict(car, function(error, prediction_json) {
                    // console.log(prediction_json);
                    // console.log(prediction_json.prediction);
                    cars_predict_seg.set(car_id, seg_predict);
                });
            }
            else if(carEvent.Event_type == "road exit") {
                var car_id = carEvent.id;
                var seg_prdict = cars_predict_seg.get(car_id);
                var seg_actual = carEvent.Segment;
                axios.post('http://localhost:3000/updateconfusionMatrix', {
                    predict: seg_prdict,
                    actual: seg_actual
                })
                .then(res => {
                    console.log(`statusCode: ${res.statusCode}`)
                    console.log(res)
                })
                .catch(error => {
                    console.error(error)
                })
                cars_predict_seg.delete(car_id);
            }
            console.log("bigML: "+ carEvent.Event_type);
            
        }
        else {
            // console.error("model has not trained yet!");
        }
    }
}

module.exports = ML;

axios.post('http://localhost:3000/services', {
        service: "bigML",
        msg: "bigML is ready"
});