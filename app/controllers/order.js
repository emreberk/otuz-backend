var mongoose = require('mongoose');
var order = mongoose.model("Order");
var user = mongoose.model("User");
var car = mongoose.model("Car");

var objectId = mongoose.Types.ObjectId;



//Desc: Save a new order
//Parameters: @deliveryDate, @facebookUserId
//Url: /orders
//Method: POST
//Error: db_failed, not_found, no_products
exports.saveOrder = function (req, res, next) {
    
    function distance(lat1, lon1, lat2, lon2, unit) {
       
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }

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
    
    user.findOne({ facebookUserId: facebookUserId }).exec().then(function (_user) {
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
            orderObject.user = foundUser;
            
            //Bu order arabanın yakınında mı?
            car.find({}).exec().then(function (_cars) {
                
                _cars.forEach(function (c) {
                    var radlat1 = Math.PI * c.latitude / 180
                    var radlat2 = Math.PI * foundUser.address.latitude / 180
                    var theta = c.longitude - foundUser.address.longitude
                    var radtheta = Math.PI * theta / 180
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    dist = Math.acos(dist)
                    dist = dist * 180 / Math.PI
                    dist = dist * 60 * 1.1515
                    dist = dist * 1.609344;
                    c.distance = dist;
                });
                
                _cars = _cars.sort(function (a, b) { return a - b; });
                
                var closestCar = _cars[0];
                
                if (closestCar == null) {
                    //There is no car, so we can deliver it a day later
                    res.json({ data: { afterMinutes: 1 * 24 * 60 }, error: { code: 604, message: "no_delivery" } });
                }
                
                //delivery date e bak, adamın yolu kaç dk da gidebileceğine bak, suanın uzerıne ekl, eger deliverydateden buyukse gonderılemez de
                var estimatedDeliveryMinutes = closestCar.distance * 1;
                var estimatedDeliveryDate = new Date((new Date()).getTime() + estimatedDeliveryMinutes * 60000);
                
                if (deliveryDate < estimatedDeliveryDate) {
                    res.json({ data: { afterMinutes: estimatedDeliveryMinutes }, error: { code: 604, message: "no_delivery" } });
                }

                //sepetteki ürünler arabaya sıgıyor mu?
                var cartVolume = 0;
                products.forEach(function (p) { cartVolume += (p.quantity * p.valume); });
                
                var carId = closestCar._id.toString();
                var carOrderProducts;
                //arabada yuklu olan dıger urunlerın hacmını hesapla
                order.find({ carId: carId  }).exec().then(function (_orders) {
                    var carOrderValume = 0;
                    if (_orders != null) {
                        _orders.forEach(function (_order) {
                            _order.products.forEach(function (p) { carOrderValume += (p.quantity * p.valume); });
                        });
                    }
                    
                    //Eğer yeni sipariş için arabada yer yoksa
                    if ((closestCar.volume - carOrderValume) < cartVolume) {
                        //Şuanlık 3 saat sonrası ıcın sıprası alabılsın, aslında olması gereken, arabanın bu sıparıslerı kac dk da goturup getırdıgı sureyı bulmak lazım
                        res.json({ data: { afterMinutes: 60 * 3 }, error: { code: 604, message: "no_delivery" } });
                    }

                    orderObject.carId = closestCar._id.toString();
                    
                    //araba orderı deliver edebiliyor, orderı kaydedebilirsin
                    orderObject.save().then(function (_savedOrder) {
                        
                        if (_savedOrder != null) {
                            res.json({ data: _savedOrder, error: null });
                        } else {
                            res.json({ data: null, error: { code: 601, message: "db_failed" } });
                        }
                    });

                });
            });
            
            
        }
    });
}