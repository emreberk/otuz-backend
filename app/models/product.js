var mongoose = require("mongoose");
var schema = mongoose.Schema;

var productSchema = new schema({
    name: String,
    photoUrl: String,
    barcodeNumber: String,
    price: Number,
    quantity: Number,
    volume:Number
});

mongoose.model('Product', productSchema);