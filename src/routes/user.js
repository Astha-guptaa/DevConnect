const express = require('express')
const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequests')
const User = require('../models/user')
const userRouter = express.Router()

const USER_SAFE_DATA = 'firstName lastName age gender about photoUrl'

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
      // }).populate("fromUserId", ["firstName", "lastName"]) both below and this one works same way
    }).populate('fromUserId', USER_SAFE_DATA)
    if (!connectionRequests.length) {
      return res.json({ message: 'You have no requests yet' })
    }

    res.json({
      message: "Here is all the Requests, you've got",
      data: connectionRequests,
    })
  } catch (err) {
    res.status(400).json({ message: 'Error : ' + err.message })
  }
})

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted' },
        { fromUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', USER_SAFE_DATA)
      .populate('toUserId', USER_SAFE_DATA)

    const data = connectionRequests.map((row) => {
      if (loggedInUser._id.toString() === row.fromUserId.toString()) {
        return row.toUserId
      }
      return row.fromUserId
    })

    res.json({ data })
  } catch (err) {
    res.status(400).json({ message: 'Error : ' + err.message })
  }
})

userRouter.get('/user/feed', userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * 10
    const loggedInUser = req.user

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select('fromUserId toUserId')
    //   .populate('fromUserId', 'firstName')
    //   .populate('toUserId', 'firstName')

    const hideUsersFromFeed = new Set()
    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId._id)
      hideUsersFromFeed.add(request.toUserId._id)
    })

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_SAFE_DATA)

    res.json({data : users})
  } catch (err) {
    res.status(400).json({ message: 'ERROR : ' + err.message })
  }
})

module.exports = userRouter
