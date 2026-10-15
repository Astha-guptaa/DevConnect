const express = require('express')
const connectDB = require('./config/database')
const { adminAuth, userAuth } = require('./middlewares/auth')
const { validateSignUpData } = require('./utils/validate')
const User = require('./models/user')
const app = express()
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

// app.use(
//   '/user',
//   [(req, res, next) => {
//     console.log('Hello user')
//     next()
//   },
//   (req, res, next) => {
//     console.log('Hello User 2')
//     next()
//   },
// ],
//   (req, res, next) => {
//     console.log('Hello User 3')
//     next()
//   },
//   (req, res, next) => {
//     console.log('Hello User 4')
//     next()
//   },
//   (req, res, next) => {
//     console.log('Hello User 5')
//     res.send('5th response')
//   }
// )

// app.get(/^\/use+r$/, (req, res) => {
//   res.send({ firstName: 'Astha', lastName: 'Gupta' })
// })

// app.get(/^\/us.*er$/, (req, res) => {
//   res.send({ firstName: 'Astha', lastName: 'Gupta' })
// })

// app.get(/^\/u(se)?r$/, (req, res) => {
//   res.send({ firstName: 'Astha', lastName: 'Gupta' })
// })

// app.get('/user/:userId/:name/:password', (req, res) => {
//   console.log(req.params);
//   res.send({ firstName: 'Astha', lastName: 'Gupta' })
// })

// app.post('/user', (req, res) => {
//   res.send('Successfully updated user in the database')
// })

// app.delete('/user', (req, res) => {
//   res.send('Successfully deleted')
// })
//
// app.use('/test', (req, res) => {
//   res.send('Hello from the server!')
// })

// app.use('/admin', adminAuth)

// app.post('/user/login', (req, res) => {
//   res.send('User Logged In successfully')
// })

// app.get('/user/data',userAuth, (req, res) => {
//   res.send('User Data sent');
// })

// app.get('/admin/getAllUser', (req, res) => {
//   res.send('All Data sent')
// })

// app.delete('/admin/deleteUser', (req, res) => {
//   res.send('User deleted successfully')
// })

// app.get('/getUserData', (req, res) => {
//   try {
//     throw new Error('I do not like you')
//     res.send('User data sent')
//   } catch (err) {
//     res.status(500).send('Something went wrong, Contact support team')
//   }
// })

// app.use('/', (err, req, res, next) => {
//   if (err) {
//     res.status(500).send('Something went wrong')
//   }
// })

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
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid Credentials')
    } else {
      const token = jwt.sign({ _id: user._id }, 'Dev@Connect$6954')
      res.cookie('token', token)
      res.send('Login Successful!!!')
    }
  } catch (err) {
    res.status(400).send('Error : ' + err.message)
  }
})

app.get('/profile', async (req, res) => {
  try {
    const cookies = req.cookies
    const { token } = cookies
    if (!token) {
      throw new Error('Invalid token')
    }
    const decodedMessage = jwt.verify(token, 'Dev@Connect$6954')
    const { _id } = decodedMessage

    const user = await User.findById(_id)
    if (!user) {
      throw new Error('User does not exist')
    }
    res.send(user)
  } catch (err) {
    res.status(500).send('Something went wrong')
  }
})

app.get('/user', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      res.status(404).send('User not found!')
    } else {
      res.send(user)
    }
  } catch (err) {
    res.status(500).send('Something went wrong')
  }
})

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({})
    if (!users.length) {
      res.status(404).send('User not found!')
    } else {
      res.send(users)
    }
  } catch (err) {
    res.status(500).send('Something went wrong')
  }
})

app.delete('/user', async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.body.id)
    res.send('User Successfully deleted')
  } catch (err) {
    res.status(500).send('')
  }
})

app.patch('/user/:userId', async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      'skills',
      'gender',
      'age',
      'photoUrl',
      'about',
      'password',
    ]
    if (Object.keys(data).every((k) => !ALLOWED_FIELDS.includes(k))) {
      throw new Error('These fields can not be changed')
    }
    await User.findByIdAndUpdate(req.params.userId, req.body, {
      returnDocument: 'after',
      runValidators: true,
    })
    res.send('User updated successfully')
  } catch (err) {
    res.status(500).send('Something went wrong ' + err.message)
  }
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
