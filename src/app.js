const express = require('express')
const { adminAuth, userAuth } = require('./middlewares/auth')

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

app.get('/getUserData', (req, res) => {
  try {
    throw new Error('I do not like you')
    res.send('User data sent')
  } catch (err) {
    res.status(500).send('Something went wrong, Contact support team')
  }
})

app.use('/', (err, req, res, next) => {
  if (err) {
    res.status(500).send('Something went wrong')
  }
})

app.listen(7777, () => {
  console.log('Server is successfully listening on port 7777.....')
})
