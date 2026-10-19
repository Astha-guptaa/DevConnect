const express = require('express')
const connectDB = require('./config/database')
const { userAuth } = require('./middlewares/auth')
const { validateSignUpData } = require('./utils/validate')
const User = require('./models/user')
const app = express()
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid Credentials')
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid Credentials')
    } else {
      const token = await user.getJWT();
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      })
      res.send('Login Successful!!!')
    }
  } catch (err) {
    res.status(400).send('Error : ' + err.message)
  }
})

app.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user
    res.send(user)
  } catch (err) {
    res.status(500).send('Something went wrong')
  }
})

app.post('/sendConnectionRequest', userAuth, (req, res) => {
  const user = req.user
  console.log('Sending connection Request')
  res.send(user.firstName + ' Send connection request')
})

connectDB()
  .then(() => {
    console.log('Database connection estabhlished....')
    app.listen(7777, () => {
      console.log('Server is successfully listening on port 7777.....')
    })
  })
  .catch((err) => {
    console.err('Database can not be connected!!')
  })
