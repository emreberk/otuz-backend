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
        if (err != null) {
            res.json({ data: null, error: { code: 601, message: "db_failed" } });
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
        if (_product != null) {
            res.json({ data: _product, error: null });
        } else {
            res.json({ data: null, error: { code: 602, message: "not_found" } });
        }
    });
}