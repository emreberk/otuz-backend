var mongoose = require("mongoose");
var schema = mongoose.Schema;

var productModel = require("./product");

var userSchema = new schema({
    facebookUserId : Number,
    address: { latitude: Number, longitude: Number, address: String, doorNumber: String, buildingNumber: String, landmark: String },
    registeredAt : Date,
    products : [productModel]
});

mongoose.model('User', userSchema);