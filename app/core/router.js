/*Router layer*/

var restify = require('restify');
var fs = require('fs');

var controllers = {};
var controllers_path = process.cwd() + '/app/controllers';

fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file)
    }
});

var server = restify.createServer();
server.use(restify.fullResponse());
server.use(restify.bodyParser());


var io = require("socket.io").listen(server);
io.sockets.on('connection', function (socket) {
    socket.emit('welcome', { orderCount: Math.round(Math.random() * (5 - 0) + 0) });
    io.sockets.on("saveOrder", function (deliveryDate, facebookUserId) { 
        console.log(deliveryDate + " " + facebookUserId);
    });
});

setInterval(function () {
    io.emit('online_user', { userCount: Math.round(Math.random() * (3 - 0) + 0) });
}, 3000);


//Get product detail by barcodeNumber
server.get({ path: "/products/:barcodeNumber" }, controllers.product.getProductByBarcodeNumber)
//Save product
server.post("/products", controllers.product.saveProduct)

//Save user product
server.post("/users/products", controllers.user.saveUserProduct)
//Get user by userId
server.get({ path: "/users/:facebookUserId" }, controllers.user.getUserByFacebookUserId)
//save User
server.post("/users", controllers.user.saveUser)
//save User address
server.post("/users/address", controllers.user.updateUserAddress)
//save User address
server.post("/users/products/:productId", controllers.user.updateUserProduct)

//Save new order
server.post("/orders", controllers.order.saveOrder)


var port = process.env.PORT || 1850;
var app = server.listen(port, function (err) {
    if (err)
        console.error(err);
    else
        console.log('App is ready at : ' + port);
});


if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    });