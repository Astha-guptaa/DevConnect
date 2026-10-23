const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { validateSignUpData } = require('../utils/validate')
const authRouter = express.Router()

authRouter.post('/signup', async (req, res) => {
  try {
    // validate the data
    validateSignUpData(req)

    const { firstName, lastName, email, password } = req.body

    // encrypt the password
    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    })
    await user.save()
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('Error : ' + err.message)
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid Credentials')
    }
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      throw new Error('Invalid Credentials')
    } else {
      const token = await user.getJWT()
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      })
      res.send('Login Successful!!!')
    }
  } catch (err) {
    res.status(400).send('Error : ' + err.message)
  }
})

authRouter.post('/logout', async (req, res) => {
  res.cookie('token', null, { expires: new Date(Date.now()) })
  res.send("Logout Successful!!")
})

module.exports = authRouter
