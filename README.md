otuz-nodejs-rest-api
=====================

This is a nodejs rest api for otuz clients!

Used npm modules
#mongoose for MONGODB Driver
#restify for REST API Server

=======================================================================================================================

#USER ENDPOINTS

#Url: /users
Desc: Save a new user
Parameters: @facebookUserId
Method: POST
Error: db_failed

#Url: /users/products
Desc: Save a user product
Parameters: @facebookUserId, @productId
Method: POST
Error: not_found, db_failed

#Url: /users/products/:productId
Desc: Update user product quantity
Parameters: @facebookUserId, uri_param:@productId, @quantity
Method: POST
Error: not_found

#Url: /users/address
Desc: Update user address
Parameters: @address, @facebookUserId
Method: POST
Error: not_found

#Url: /users/:facebookUserId
Desc: Get user by facebookUserId
Parameters: uri_param:@facebookUserId
Method: GET /users/:facebookUserId
Error: not_found

======================================================================================================

#PRODUCT ENDPOINTS

#Url: /products
Desc: Save a new product
Parameters: @name, @photoUrl, @barcodeNumber, @price, @quantity
Method: POST
Error: db_failed

#Url: /products
Desc: Get product by barcode number
Parameters: uri_param:@barcodeNumber
Method: GET
Error: not_found

======================================================================================================

#ORDER ENDPOINTS

#Url: /orders
Desc: Save a new order
Parameters: @deliveryDate, @facebookUserId
Method: POST
Error: db_failed, not_found, no_products