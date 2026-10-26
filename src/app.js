const express = require('express')
const connectDB = require('./config/database')
const app = express()
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const cookieParser = require('cookie-parser')
const cors = require('cors')

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)

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
