const axios = require('axios')
var bigml = require('bigml');
var connection = new bigml.BigML('ido1shapira','7e9d42f146576bc3b117ac10bce1799658c35cef')
var source = new bigml.Source(connection);

var model_id;

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
                                // onePrediction({'petal length': 1});
                            }
                        });
                    }
                });
            }
        });
    },

    // on event we predict in which part the car would get out
    onEvent: function(event) { 
        //TODO: need to split 'evnet' between the params and the target
        car = {'petal length': 1};

        if(model_id != undefined){
            console.log("model id: "+ model_id);
            var localModel = new bigml.LocalModel(model_id);
            localModel.predict(car, function(error, prediction_json) {
                console.log(prediction_json);
                console.log(prediction_json.prediction);
                //after prediction update the confusion matrix using post to server
                axios.post('http://localhost:3000/updateconfusionMatrix', {
                    predict: 1,
                    actual: 1
                })
                .then(res => {
                    console.log(`statusCode: ${res.statusCode}`)
                    console.log(res)
                })
                .catch(error => {
                    console.error(error)
                })
            });
        }
        else {
            // console.error("model has not trained yet!");
        }
    }
}

module.exports = ML;