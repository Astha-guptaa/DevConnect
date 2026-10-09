const mongoose = require('mongoose')

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://guptastha12345_db_user:XN1urLjyZIbl98GK@cluster0.2sfxo72.mongodb.net/devConnect',
  )
}

module.exports = connectDB
