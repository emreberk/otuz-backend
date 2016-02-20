var mongoose = require("mongoose");
var schema = mongoose.Schema;

var carSchema = new schema({
    latitude: Number,
    longitude: Number,
    volume:Number
});

mongoose.model('Car', carSchema);