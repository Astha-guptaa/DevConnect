const { mongoose } = require('mongoose')

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: `{VALUE} status is not supported`,
      },
    },
  },
  {
    timeStamps: true,
  },
)

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })

connectionRequestSchema.pre('save', function () {
  const connectionRequest = this
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error('Can not send connection Request to yourself')
  }
})

const ConnectionRequest = new mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
)

module.exports = ConnectionRequest
