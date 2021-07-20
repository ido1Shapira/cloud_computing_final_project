const axios = require('axios')
var bigml = require('bigml');
var connection = new bigml.BigML('ido1shapira','7e9d42f146576bc3b117ac10bce1799658c35cef')
var source = new bigml.Source(connection);

var model_id = null;
var cars_predict_seg = new Map(); // car_id -> seg predict

var ML = {
    trainModel: function() {
        source.create('./simulatorData.csv', function(error, sourceInfo) {
            if (!error && sourceInfo) {
                var dataset = new bigml.Dataset();
                dataset.create(sourceInfo, function(error, datasetInfo) {
                    if (!error && datasetInfo) {
                        var model = new bigml.Model();
                        model.create(datasetInfo, function(error, modelInfo) {
                            if (!error && modelInfo) {
                                model_id = modelInfo.resource;
                                console.log("bigML: model had trained!");
                            }
                        });
                    }
                });
            }
        });
    },

    // on event we predict in which part the car would get out
    onEvent: function(carEvent) {
        // console.log("bigML: event: "+ event);
        if(model_id != undefined){
            if(carEvent.Event_type == "road entry") {
                // new car insert to road
                // need to save car_id and predict
                var car_id = carEvent.id;
                console.log("bigML: model id: "+ model_id);
                var localModel = new bigml.LocalModel(model_id);
                localModel.predict(carEvent, function(error, prediction_json) {
                    // console.log(prediction_json);
                    // console.log(prediction_json.prediction);
                    seg_predict = Math.round(prediction_json.prediction);
                    console.log("bigML: road entry: seg_predict: "+ seg_predict);
                    cars_predict_seg.set(car_id, seg_predict);
                    axios.post('http://localhost:3000/update_car_list', {
                        car_id: car_id,
                        predict: seg_predict
                    });
                });
            }
            else if(carEvent.Event_type == "road exit") {
                var car_id = carEvent.id;
                var seg_prdict = cars_predict_seg.get(car_id);
                if (seg_prdict != undefined) {
                    // we dont have predict to this car because the model not train yet
                    var seg_actual = carEvent.Segment;
                    console.log('bigML: road exit: seg_predict: '+ seg_prdict);
                    console.log('bigML: road exit: seg_actual: '+ seg_actual);
                    cars_predict_seg.delete(car_id);
                    axios.post('http://localhost:3000/update_confusionMatrix', {
                        predict: seg_prdict,
                        actual: seg_actual,
                        car_id: car_id
                    });
                }
            }            
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