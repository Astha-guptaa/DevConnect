const express = require('express')
const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequests')
const User = require('../models/user')

const requestRouter = express.Router()
requestRouter.use(express.json())

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id
      const toUserId = req.params.toUserId
      const status = req.params.status

      const allowedStatus = ['interested', 'ignored']
      if (!allowedStatus.includes(status)) {
        throw new Error(status + ' status type is not allowed')
      }

      const toUser = await User.findById(toUserId)
      if (!toUser) {
        throw new Error('User does not exist')
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      })
      if (existingConnectionRequest) {
        throw new Error('Connection Request Already Exists')
      }

      const connectionRequestData = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      })
      await connectionRequestData.save()
      res.json({
        message: req.user.firstName + ' is/has ' + status + " (in) " + toUser.firstName,
        connectionRequestData,
      })
    } catch (err) {
      res.status(400).json({ message: 'ERROR : ' + err.message })
    }
  },
)

module.exports = requestRouter
