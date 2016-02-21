var mongoose = require('mongoose');
var order = mongoose.model("Order");
var user = mongoose.model("User");
var car = mongoose.model("Car");

var objectId = mongoose.Types.ObjectId;
var kmPerMinutes = 1;
var constantLoadingToCarTimePerOrderInMinutes = 10;

var calculateDistance = function (lat1, lat2 , long1, long2) {

    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = long1 - long2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344
    
    return dist;
};

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
                
                var carsWithDistances = [];

                _cars.forEach(function (c) {
                
                    //var radlat1 = Math.PI * c.latitude / 180
                    //var radlat2 = Math.PI * foundUser.address.latitude / 180
                    //var theta = c.longitude - foundUser.address.longitude
                    //var radtheta = Math.PI * theta / 180
                    //var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    //dist = Math.acos(dist)
                    //dist = dist * 180 / Math.PI
                    //dist = dist * 60 * 1.1515
                    //dist = dist * 1.609344;
                    //c.distance = dist;

                    //Arabaların adrese uzaklıgını bul
                    var dist = calculateDistance(c.latitude, foundUser.address.latitude, c.longitude, foundUser.address.longitude);
                    carsWithDistances.push({ car: c, distance: dist  });
                });
                
                carsWithDistances = carsWithDistances.sort(function (a, b) { return a.distance - b.distance; });
                
                var closestCarWithDistance = carsWithDistances[0];
                var closestCar = closestCarWithDistance.car;
                

                if (closestCar == null) {
                    //Uygun araba yok,en yakın yarına sipariş verilebilir
                    res.json({ data: { afterMinutes: 1 * 24 * 60 }, error: { code: 604, message: "no_delivery" } });
                }
                
                //delivery date e bak, adamın yolu kaç dk da gidebileceğine bak, suanın uzerıne ekle, eger delivery dateden buyukse gonderılemez de
                var estimatedDeliveryMinutes = (closestCarWithDistance.distance * kmPerMinutes) + constantLoadingToCarTimePerOrderInMinutes;
                var estimatedDeliveryDate = new Date((new Date()).getTime() + estimatedDeliveryMinutes * 60000);
                
                console.log(estimatedDeliveryDate);
                
                console.log(deliveryDate);
                
                if (deliveryDate < (new Date())) {
                    res.json({ data: { afterMinutes: estimatedDeliveryMinutes }, error: { code: 604, message: "no_delivery" } });
                }

                if (deliveryDate < estimatedDeliveryDate) {
                    res.json({ data: { afterMinutes: estimatedDeliveryMinutes }, error: { code: 604, message: "no_delivery" } });
                }

                //sepetteki ürünler arabaya sıgıyor mu?
                var cartVolume = 0;
                products.forEach(function (p) { cartVolume += (p.quantity * p.valume); });
                
                var carId = closestCar._id.toString();
                var carOrderProducts;

                //arabada yuklu olan teslim edilmemiş dıger urunlerın hacmını hesapla
                order.find().where("carId").equals(carId).where("status").equals(0).exec().then(function (_orders) {
                    var carOrderValume = 0;
                    
                    //Aracın teslim edeceği noktalara göre, tahmini sipariş teslimat süresi hesaplanır
                    var carOrderDeliveryMinutes = 0;

                    if (_orders != null) {
                        _orders.forEach(function (_order) {
                            _order.products.forEach(function (p) { carOrderValume += (p.quantity * p.valume); });
                        });
                        
                        //Teslim ettiği son siparişten merkeze olan uzaklığı bul
                        var lastOrder = _orders[_orders.length - 1];
                        
                        carOrderDeliveryMinutes += (kmPerMinutes * calculateDistance(lastOrder.user.address.latitude, closestCar.latitude , lastOrder.user.address.longitude, closestCar.longitude));
                        
                        //Merkezden yeni siparişe olan uzaklığı bul
                        carOrderDeliveryMinutes += (kmPerMinutes * calculateDistance( closestCar.latitude , foundUser.address.latitude, closestCar.longitude, foundUser.address.longitude));
                       
                        //Üzerine malı yukleme suresını ekle
                        carOrderDeliveryMinutes += constantLoadingToCarTimePerOrderInMinutes;
                    }
                    
                    //Eğer yeni sipariş için arabada yer yoksa
                    if ((closestCar.volume - carOrderValume) < cartVolume) {
                        //Şuanlık 3 saat sonrası ıcın sıprası alabılsın, aslında olması gereken, arabanın bu sıparıslerı kac dk da goturup getırdıgı sureyı bulmak lazım
                        res.json({ data: { afterMinutes: carOrderDeliveryMinutes }, error: { code: 604, message: "no_delivery" } });
                        return;
                    } else { 
                    
                        orderObject.carId = closestCar._id.toString();
                        
                        //araba orderı deliver edebiliyor, orderı kaydedebilirsin
                        orderObject.save().then(function (_savedOrder) {
                            
                            if (_savedOrder != null) {
                                
                                var orderId = _savedOrder._id.toString();

                                //Siparişleri hesaplanan zamanda teslim et.
                                setTimeout(function () {
                                    
                                    order.findByIdAndUpdate(new objectId(orderId), { status: 1 }).then(function (_s) { 
                                        console.log(_s);
                                    });

                                }, 5 * 1000);
                                
                                res.json({ data: _savedOrder, error: null });
                            } else {
                                res.json({ data: null, error: { code: 601, message: "db_failed" } });
                            }
                        });
                    }
                });
            });
        }
    });
}