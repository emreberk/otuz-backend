/*Mongodb connection layer*/

var mongoose = require('mongoose');
var fs = require('fs');
var models_path = process.cwd() + '/app/models';

var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

mongoose.connect(packageJson.mongodbUrl, { server: { auto_reconnect: true } });

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('MongoDB connection error:', err);
});

db.once('open', function callback() {
    console.info('MongoDB connection is established');
});

db.on('disconnected', function () {
    console.error('MongoDB disconnected!');
    mongoose.connect(pjson.mongodbUrl, { server: { auto_reconnect: true } });
});

db.on('reconnected', function () {
    console.info('MongoDB reconnected!');
});

fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js'))
        require(models_path + '/' + file)
});