const express = require('express')
const connectDB = require('./config/database')
const { adminAuth, userAuth } = require('./middlewares/auth')
const User = require('./models/user')
const app = express()

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

app.post('/signup', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('Error saving user to database: ' + err.message)
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

app.patch('/user', async (req, res) => {
  try {
    await User.findOneAndUpdate({ email: req.body.email }, req.body, {returnDocument: 'after', runValidators: true})
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
