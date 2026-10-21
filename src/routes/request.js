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
      const { status, toUserId } = req.params

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

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      })
      const data = await connectionRequest.save()
      res.json({
        message:
          req.user.firstName +
          ' is/has ' +
          status +
          ' (in) ' +
          toUser.firstName,
        data,
      })
    } catch (err) {
      res.status(400).json({ message: 'ERROR : ' + err.message })
    }
  },
)

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user
      const { status, requestId } = req.params

      const allowedStatus = ['accepted', 'rejected']
      if (!allowedStatus.includes(status)) {
        throw new Error(status + ' status type is not supported')
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: 'interested',
      })
      if (!connectionRequest) {
        throw new Error('No Connection Found')
      }

      connectionRequest.status = status

      const data = await connectionRequest.save()
      res.json({ message: 'Connection ' + status, data })
    } catch (err) {
      res.status(400).json({ message: 'Error : ' + err.message })
    }
  },
)

module.exports = requestRouter
