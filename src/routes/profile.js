const express = require('express')
const { userAuth } = require('../middlewares/auth')
const { validateProfileEditData } = require('../utils/validate')
const bcrypt = require('bcrypt')
const profileRouter = express.Router()

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user
    res.send(user)
  } catch (err) {
    res.status(500).send('Something went wrong')
  }
})

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error('Invalid Edit Request !!!')
    }
    const loggedInUser = req.user
    Object.keys(req.body).every((key) => (loggedInUser[key] = req.body[key]))
    await loggedInUser.save()

    res.json({
      message: `${loggedInUser.firstName} your profile is updated successfully`,
      data: loggedInUser,
    })
  } catch (err) {
    res.status(400).send('ERROR: ' + err.message)
  }
})

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
  try {
    const existingPassword = req.user.password
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword

    const isCurrentPassValid = await bcrypt.compare(
      currentPassword,
      existingPassword,
    )
    if (!isCurrentPassValid) {
      throw new Error('Current Password is Not valid')
    }
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save()
    res.send({message: "Password is updated Successfully."})
  } catch (err) {
    res.status(400).send('Error: ' + err.message)
  }
})

/**
 * take existing pass
 * take new pass
 * check if user is logged in
 * check if existing pass is correct
 * check if new pass if strong enough
 *
 */

module.exports = profileRouter
