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
server.use(restify.bodyParser())

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
server.listen(port, function (err) {
    if (err)
        console.error(err);
    else
        console.log('App is ready at : ' + port);
});


if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    });