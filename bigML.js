var bigml = require('bigml');
var connection = new bigml.BigML('ido1shapira','7e9d42f146576bc3b117ac10bce1799658c35cef')
var source = new bigml.Source(connection);


module.exports.trainModel= function()
{   
    source.create('./iris.csv', function(error, sourceInfo) {
        if (!error && sourceInfo) {
            var dataset = new bigml.Dataset();
            dataset.create(sourceInfo, function(error, datasetInfo) {
                if (!error && datasetInfo) {
                    var model = new bigml.Model();
                    model.create(datasetInfo, function (error, modelInfo) {
                        if (!error && modelInfo) {
                            var prediction = new bigml.Prediction();
                            prediction.create(modelInfo, {'petal length': 1})
                        }
                    });
                }
            });
        }
    });
}