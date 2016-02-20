var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userModel = require("./user");
var productModel = require("./product");

var orderSchema = new schema({
    deliveryDate: Date,
    orderedAt: Date,
    status:Number,
    user: userModel,
    products : [productModel],
    carId : String
});

mongoose.model('Order', orderSchema);