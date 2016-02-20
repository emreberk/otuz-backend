var mongoose = require('mongoose');
var order = mongoose.model("Order");
var user = mongoose.model("User");

var objectId = mongoose.Types.ObjectId;

//Desc: Save a new order
//Parameters: @deliveryDate, @facebookUserId
//Url: /orders
//Method: POST
//Error: db_failed, not_found, no_products
exports.saveOrder = function (req, res, next) {

    var orderObject = new order({
        deliveryDate: new Date(req.body.deliveryDate),
        orderedAt: new Date(),
        user: null,
        products: [],
        status : 0
    });

    var facebookUserId = req.body.facebookUserId;
    var foundUser;
    
    user.findOne({facebookUserId: facebookUserId}).exec().then(function (_user) {
        if (_user != null) {
            foundUser = _user;
            next();
        }
    }).then(function () {
        
        if (foundUser == undefined) {
            res.status(404);
            res.json({ data: null, error: "not_found" });
        } else {
            
            var products = foundUser.products.filter(function (p) { return p.quantity > 0 });
            
            if (products.length <= 0) { 
                res.status(404);
                res.json({ data: null, error: "no_products" });
                return;
            }

            orderObject.products = products;
            orderObject.user = foundUser;
            
            //deliver edilebiliyor mu?
            orderObject.save().then(function (_savedOrder) {
            
                if (_savedOrder != null) {
                    res.json({ data: _savedOrder, error: null });
                } else { 
                    res.status(500);
                    res.json({ data: null, error: "db_failed" });
                }
            });
        }
    });
}