const express = require('express')
const { userAuth } = require('../middlewares/auth')

const requestRouter = express.Router()
requestRouter.use(express.json())

requestRouter.post('/sendConnectionRequest', userAuth, (req, res) => {
  const user = req.user
  console.log('Sending connection Request')
  res.send(user.firstName + ' Send connection request')
})

module.exports = requestRouter
