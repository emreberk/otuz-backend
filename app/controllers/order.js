var mongoose = require('mongoose');
var order = mongoose.model("Order");
var user = mongoose.model("User");
var car = mongoose.model("Car");

var objectId = mongoose.Types.ObjectId;

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}

//Desc: Save a new order
//Parameters: @deliveryDate, @facebookUserId
//Url: /orders
//Method: POST
//Error: db_failed, not_found, no_products
exports.saveOrder = function (req, res, next) {

    var deliveryDate = new Date(req.body.deliveryDate);

    var orderObject = new order({
        deliveryDate: deliveryDate,
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
            res.json({ data: null, error: { code: 602, message: "not_found" } });
        } else {
            
            var products = foundUser.products.filter(function (p) { return p.quantity > 0 });
            
            if (products.length <= 0) { 
                res.json({ data: null, error: { code: 603, message: "no_products" } });
                return;
            }

            orderObject.products = products;
            orderObject.user     = foundUser;
            
            //Bu order arabanın yakınında mı?
            car.find({}).exec().then(function (_cars) { 

                _cars.foreach(function (c) {
                    var distance = distance(c.latitude, c.longitude, foundUser.address.latitude, foundUser.address.longitude, "K");
                    c.distance = distance;
                });
                
                _cars = _cars.sort(function (a, b) { return a - b; });

                var closestCar = _cars[0];

                if (closestCar == null) {
                    //There is no car, so we can deliver it a day later
                    res.json({ data: { afterMinutes: 1 * 24 * 60 }, error: { code: 604, message: "no_delivery" } });
                }

                //Arabanın teslim etmesi gereken kac siparişi var?
                //sepetteki ürünler arabaya sıgıyor mu?

                //delivery date e bak, adamın yolu kaç dk da gidebileceğine bak, suanın uzerıne ekl, eger deliverydateden buyukse gonderılemez de
                var estimatedDeliveryMinutes = closestCar.distance * 1;
                var estimatedDeliveryDate = new Date((new Date()).getTime() + estimatedDeliveryMinutes * 60000);          
                

                if (deliveryDate < estimatedDeliveryDate) { 
                    res.json({ data: { afterMinutes: estimatedDeliveryMinutes }, error: { code: 604, message: "no_delivery" } });
                }
              
                //ayrıca 

            });
            

            //deliver edilebiliyor mu?
            orderObject.save().then(function (_savedOrder) {
            
                if (_savedOrder != null) {
                    res.json({ data: _savedOrder, error: null });
                } else { 
                    res.json({ data: null, error: { code: 601, message: "db_failed" } });
                }
            });
        }
    });
}