const socket = require('socket.io')
const crypto = require('crypto')
const Chat = require('../models/chat')

const getSecretRoomId = (userId1, userId2) => {
  return crypto
    .createHash('sha256')
    .update([userId1, userId2].sort().join('$'))
    .digest('hex')
}

const isUserInRoom = (io, roomId, userId, excludedSocketId) => {
  const socketIds = io.sockets.adapter.rooms.get(roomId)
  if (!socketIds) return false

  for (const socketId of socketIds) {
    if (socketId === excludedSocketId) continue
    const roomSocket = io.sockets.sockets.get(socketId)
    if (String(roomSocket?.data.userId) === String(userId)) return true
  }

  return false
}

const initializeSocket = (server) => {
  const io = socket(server, {
    path:
      process.env.SOCKET_IO_PATH ||
      (process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io'),
    cors: {
      origin: 'http://localhost:5173',
    },
  })

  io.on('connection', (socket) => {
    socket.data.chatPresenceRooms = new Set()

    socket.on('joinChat', ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId)
      const targetIsOnline = isUserInRoom(io, roomId, targetUserId)

      socket.data.userId = String(userId)
      socket.data.chatPresenceRooms.add(roomId)
      socket.join(roomId)
      socket.emit('presenceUpdate', {
        userId: String(targetUserId),
        isOnline: targetIsOnline,
      })
      socket.to(roomId).emit('presenceUpdate', {
        userId: String(userId),
        isOnline: true,
      })
    })

    socket.on(
      'sendMessage',
      async ({ firstName,lastName, text, userId, targetUserId }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId)
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          })

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            })
          }

          chat.messages.push({
            sender: userId,
            text,
            timestamp: new Date(),
          })

          await chat.save()

          io.to(roomId).emit('receiveMessage', {
            firstName,
            lastName,
            text,
            timestamp: new Date(),
          })
        } catch (err) {
          console.log(err)
        }
      },
    )

    socket.on('disconnecting', () => {
      const userId = socket.data.userId
      if (!userId) return

      for (const roomId of socket.data.chatPresenceRooms) {
        if (!isUserInRoom(io, roomId, userId, socket.id)) {
          socket.to(roomId).emit('presenceUpdate', {
            userId,
            isOnline: false,
          })
        }
      }
    })
  })
}

module.exports = initializeSocket
