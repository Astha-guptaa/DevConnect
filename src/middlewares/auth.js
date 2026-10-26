const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies
    if (!token) {
      return res.status(401).json({ message: 'Please Login' })
    }
    const decodeObj = await jwt.verify(token, 'Dev@Connect$6954')
    const { _id } = decodeObj
    const user = await User.findById(_id)
    if (!user) {
      throw new Error('User not found')
    }
    req.user = user
  } catch (err) {
    res.status(400).send('Error: ' + err)
  }
  return next()
}

module.exports = {
  userAuth,
}
