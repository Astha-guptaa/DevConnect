const express = require('express')
const connectDB = require('./config/database')
const app = express()
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const http = require('http')
const initializeSocket = require('./utils/socket')
require('dotenv').config()

const server = http.createServer(app)
initializeSocket(server)

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.use('/api', chatRouter)

app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)
app.use('/', chatRouter)

connectDB()
  .then(() => {
    console.log('Database connection established....')
    server.listen(process.env.PORT, () => {
      console.log(
        'Server is successfully listening on port ' +
          process.env.PORT +
          '.....',
      )
    })
  })
  .catch((err) => {
    console.log('Database can not be connected!!')
  })
