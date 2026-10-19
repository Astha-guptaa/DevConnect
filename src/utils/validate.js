const validator = require('validator')

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body

  if (!firstName || !lastName) {
    throw new Error('Name is Not valid')
  } else if (!validator.isEmail(email)) {
    throw new Error('Email is not Valid')
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('Please enter strong password')
  }
}

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    'firstName',
    'lastName',
    'age',
    'gender',
    'about',
    'skills',
    'photoUrl',
  ]
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field),
  )
  return isEditAllowed
}

module.exports = {
  validateSignUpData,
  validateProfileEditData,
}
