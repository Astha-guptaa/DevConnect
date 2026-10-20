const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxLength: 20,
    },
    lastName: {
      type: String,
      minLenght: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email addess is not valid ' + value)
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error('Enter Strong Password: ' + value)
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 45,
    },
    gender: {
      type: String,
      enum: {
        values : ["male", "female", "other"],
        message: `{VALUE} gender type is not supported`
      }
      // validate(value) {
      //   if (!['male', 'female'].includes(value)) {
      //     throw new Error('Gender data is not valid!')
      //   }
      // },
    },
    about: {
      type: String,
      default: 'This is default about you, Change it later',
      maxLength: 200,
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error('Skills can not be more than 10')
        }
      },
    },
    photoUrl: {
      type: String,
      default: 'https://www.magnific.com/free-photos-vectors/dummy-person',
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Photo should be in URL format')
        }
      },
    },
  },
  {
    timestamps: true,
  },
)

// always use function instead of arrow fn, bcz arrow fn dont have their own this.
userSchema.methods.getJWT = async function () {
  const user = this
  const token = await jwt.sign({ _id: user._id }, 'Dev@Connect$6954', {
    expiresIn: '7d',
  })
  return token
}

userSchema.methods.validatePassword = async function (passwordEnteredByUser) {
  const user = this
  const passwordHash = user.password
  // first argument should be password entered by user, second one will be hash one;
  const isPasswordValid = await bcrypt.compare(
    passwordEnteredByUser,
    passwordHash,
  )
  return isPasswordValid
}

module.exports = mongoose.model('User', userSchema)
