var mongoose = require('mongoose');
var user = mongoose.model("User");
var product = mongoose.model("Product");
var objectId = mongoose.Types.ObjectId;

//Desc: Save a new user
//Parameters: @facebookUserId
//Url: /users
//Method: POST
//Error: db_failed
exports.saveUser = function (req, res, next) {
    var userObject = new user({
        facebookUserId: req.body.facebookUserId,
        address: null,
        registeredAt: new Date(),
        products : []
    });
    
    userObject.save(function (err, _user) {
        if (err) {
            res.json({ data: null, error: { code: 601, message: "db_failed" } });
        } else {
            res.json({ data: _user, error: null });
        }
    })
}


//Desc: Save a user product
//Parameters: @facebookUserId, @productId
//Url: /users/products
//Method: POST
//Error: not_found, db_failed
exports.saveUserProduct = function (req, res, next) {
    
    var productId = req.body.productId;
    var facebookUserId = req.body.facebookUserId;
    var foundProduct;

    product.findById(new objectId(productId)).exec().then(function (_product) {
        if (_product != null) {
            foundProduct = _product;
            next();
        }
    }).then(function () {
        
        if (foundProduct == undefined) {
            res.json({ data: null, error: { code: 602, message: "not_found" } });
        } else { 
        
            user.findOne({ facebookUserId: facebookUserId }).exec().then(function (doc) {
                if (doc != null) {
                    
                    var existingProduct = doc.products.filter(function (p) { return objectId(p._id.toString()).id == objectId(foundProduct.id.toString()).id })[0];
                    if (existingProduct == undefined) {
                        foundProduct.quantity = 1;
                        doc.products.push(foundProduct);
                    } else {
                        existingProduct.quantity++;
                    }
                    
                    user.findOneAndUpdate({ facebookUserId: facebookUserId }, { products: doc.products }).exec().then(function (_savedDoc) { 
                        if (_savedDoc != null) {
                            res.json({ data: doc, error: null });
                        } else {
                            res.json({ data: null, error: { code: 601, message: "db_failed" } });
                        }
                    });

                } else {
                    res.json({ data: null, error: { code: 602, message: "not_found" } });
                }
            });
        }
    });
}

//Desc: Update user product quantity
//Parameters: @facebookUserId, uri_param:@productId, @quantity
//Url: /users/products/:productId
//Method: POST
//Error: not_found
exports.updateUserProduct = function (req, res, next) {
    var productId = req.params.productId;
    var quantity  = req.body.quantity;
    var facebookUserId = req.body.facebookUserId;

    user.findOne({ facebookUserId: facebookUserId }).exec().then(function (doc) {
        if (doc) {
            var productFound = false;
            if (doc.products != null && doc.products.length > 0) {
                doc.products.forEach(function (item, index) {
                    if (objectId(item._id.toString()).id == objectId(productId).id) {
                        item.quantity = quantity;
                        productFound = true;
                    }
                });
                if (productFound == true) {
                    user.findOneAndUpdate({ facebookUserId: facebookUserId }, { products : doc.products })
                    .exec().then(function (_savedDoc) { 
                    
                         if (_savedDoc) {
                            res.json({ data: doc, error: null });
                            return;
                        } 
                    });
                }
            }
        }
        res.json({ data: null, error: { code: 602, message: "not_found" } });
    });
}

//Desc: Update user address
//Parameters: @address, @facebookUserId
//Url: /users/address
//Method: POST
//Error: not_found
exports.updateUserAddress = function (req, res, next) {
    var addressModel = req.body.address;
    var facebookUserId = req.body.facebookUserId;
    
    user.findOneAndUpdate({ facebookUserId: facebookUserId }, { address : addressModel }).exec().then(function (_savedDoc) {
        if (_savedDoc) {
            _savedDoc.address = addressModel;
            res.json({ data: _savedDoc, error: null })
        } else {
            res.json({ data: null, error: { code: 602, message: "not_found" } });
        }
    });
}

//Desc: Get user by facebookUserId
//Parameters: uri_param:@facebookUserId
//Url: /users/address
//Method: GET /users/:facebookUserId
//Error: not_found
exports.getUserByFacebookUserId = function (req, res) {
    var facebookUserId = req.params.facebookUserId;
    user.findOne({ facebookUserId: facebookUserId }).exec().then(function (_user) {
        if (_user) {
            res.json({data:_user, error:null});
        } else {
            res.json({ data: null, error: { code: 602, message: "not_found" } });
        }
    });
}


//Product öneri endpointi yapıalcak