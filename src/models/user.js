const mongoose = require('mongoose')
const validator = require("validator")

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
        if(!validator.isEmail(value)) {
            throw new Error("Email addess is not valid " + value)
        }
      }
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if(!validator.isStrongPassword(value)) {
            throw new Error("Enter Strong Password: " + value)
        }
      }
    },
    age: {
      type: Number,
      min: 18,
      max: 45,
    },
    gender: {
      type: String,
      validate(value) {
        if (!['male', 'female'].includes(value)) {
          throw new Error('Gender data is not valid!')
        }
      },
    },
    about: {
      type: String,
      default: 'This is default about you, Change it later',
      maxLength: 200
    },
    skills: {
      type: [String],
    },
    photoUrl: {
      type: String,
      default: 'https://www.magnific.com/free-photos-vectors/dummy-person',
      validate(value) {
        if(!validator.isURL(value)) {
            throw new Error("Photo should be in URL format")
        }
      }
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('User', userSchema)
