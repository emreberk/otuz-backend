var mongoose = require('mongoose');
var product = mongoose.model("Product");
var objectId = mongoose.Types.ObjectId;

//Desc: Save a new product
//Parameters: @name, @photoUrl, @barcodeNumber, @price, @quantity
//Url: /products
//Method: POST
//Error: db_failed
exports.saveProduct = function (req, res, next) {
    
    var pObject = new product({
        name: req.body.name,
        photoUrl: req.body.photoUrl,
        barcodeNumber: req.body.barcodeNumber,
        price: req.body.price,
        quantity: req.body.quantity
    });

    pObject.save(function (err, _product) {
        if (err) {
            res.status(500);
            res.json({ data: null, error: "db_failed" });
        } else {
            res.json({ data: _product, error: null });
        }
    })
}

//Desc: Get product by barcode number
//Parameters: uri_param:@barcodeNumber
//Url: /products
//Method: GET
//Error: not_found
exports.getProductByBarcodeNumber = function (req, res) {
    var barcodeNumber = req.params.barcodeNumber;
    product.findOne({ barcodeNumber: barcodeNumber }).exec().then(function (_product) {
        if (product) {
            res.json({ data: _product, error: null });
        } else {
            res.status(404);
            res.json({ data: null, error: "not_found" });
        }
    });
}