const express = require('express')
const mongoose = require('mongoose')
const { userAuth } = require('../middlewares/auth')
const Chat = require('../models/chat')
const ConnectionRequest = require('../models/connectionRequests')
const User = require('../models/user')
const chatRouter = express.Router()

const DEFAULT_MESSAGE_PAGE_SIZE = 20
const MAX_MESSAGE_PAGE_SIZE = 50

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
  const { targetUserId } = req.params
  const userId = req.user._id
  const limit = Number(req.query.limit ?? DEFAULT_MESSAGE_PAGE_SIZE)
  const before = req.query.before

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_MESSAGE_PAGE_SIZE) {
    return res
      .status(400)
      .send(`Message limit must be between 1 and ${MAX_MESSAGE_PAGE_SIZE}`)
  }

  if (before && !mongoose.Types.ObjectId.isValid(before)) {
    return res.status(400).send('Invalid message cursor')
  }

  try {
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: 'accepted' },
        { fromUserId: targetUserId, toUserId: userId, status: 'accepted' },
      ],
    })
    if(!existingConnectionRequest || existingConnectionRequest.status !== 'accepted') {
      throw new Error('You are not connected with this user')
    }
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).select('_id participants')

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      })
      await chat.save()
    }

    const cursorId = before ? new mongoose.Types.ObjectId(before) : null
    const [page] = await Chat.aggregate([
      { $match: { _id: chat._id } },
      {
        $project: {
          filteredMessages: {
            $filter: {
              input: '$messages',
              as: 'message',
              cond: cursorId
                ? { $lt: ['$$message._id', cursorId] }
                : { $literal: true },
            },
          },
        },
      },
      {
        $project: {
          totalAvailable: { $size: '$filteredMessages' },
          messages: { $slice: ['$filteredMessages', -limit] },
        },
      },
    ])

    const messages = page?.messages ?? []
    const senders = await User.find({
      _id: { $in: messages.map((message) => message.sender) },
    })
      .select('firstName lastName')
      .lean()
    const sendersById = new Map(
      senders.map((sender) => [String(sender._id), sender]),
    )
    const populatedMessages = messages.map((message) => ({
      ...message,
      sender: sendersById.get(String(message.sender)) ?? null,
    }))

    res.json({
      _id: chat._id,
      participants: chat.participants,
      messages: populatedMessages,
      hasMore: (page?.totalAvailable ?? 0) > messages.length,
      nextCursor: messages.length ? String(messages[0]._id) : null,
    })
  } catch (err) {
    res.status(400).send('Error : ' + err.message)
  }
})

module.exports = chatRouter
