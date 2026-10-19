# API List

## authRouter

POST - /signup
POST - /login
POST - /logout

## profileRouter

GET - /profile/view
PATCH - /profile/edit
PATCH - /profile/password

## connectionRequestRouter

POST - /request/send/interested/:userID
POST - /request/send/ignored/:userID
POST - /request/review/rejected/:requestID
POST - /request/review/accepted/:requestID

## userRouter

GET - /user/connections
GET - /user/requests
GET - /user/feed

