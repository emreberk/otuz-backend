﻿otuz-nodejs-rest-api
=====================

This is a nodejs rest api for otuz ios and android apps!

Used npm modules
mongoose for MONGODB Driver
restify for REST API Server
socketio for Web Socket

=======================================================================================================================

#USER ENDPOINTS

Url: /users <br />
Desc: Save a new user <br />
Parameters: @facebookUserId <br />
Method: POST <br />
Error: db_failed <br />
<br /><br />
#Url: /users/products <br />
Desc: Save a user product <br />
Parameters: @facebookUserId, @productId <br />
Method: POST <br /> 
Error: not_found, db_failed<br />
<br /><br />
#Url: /users/products/:productId <br />
Desc: Update user product quantity <br />
Parameters: @facebookUserId, uri_param:@productId, @quantity <br />
Method: POST <br />
Error: not_found <br />
<br />
Url: /users/address <br />
Desc: Update user address <br />
Parameters: @address, @facebookUserId <br />
Method: POST <br />
Error: not_found <br />

Url: /users/:facebookUserId <br />
Desc: Get user by facebookUserId <br />
Parameters: uri_param:@facebookUserId <br />
Method: GET /users/:facebookUserId <br />
Error: not_found <br />
<br />
======================================================================================================
<br />
#PRODUCT ENDPOINTS
<br />
Url: /products <br />
Desc: Save a new product <br />
Parameters: @name, @photoUrl, @barcodeNumber, @price, @quantity <br />
Method: POST <br />
Error: db_failed <br />

Url: /products <br />
Desc: Get product by barcode number <br />
Parameters: uri_param:@barcodeNumber <br />
Method: GET <br />
Error: not_found <br />
<br />
======================================================================================================
<br />
#ORDER ENDPOINTS
<br />
Url: /orders <br />
Desc: Save a new order <br />
Parameters: @deliveryDate, @facebookUserId <br />
Method: POST <br />
Error: db_failed, not_found, no_products <br />