const adminAuth = (req, res, next) => {
  const token = 'xyz'
  const isAdmin = token === 'xyz'
  if (!isAdmin) {
    res.status(403).send('Unauthorised Access')
  } else {
    next()
  }
}

const userAuth = (req, res, next) => {
  const token = 'xyz'
  const isAdmin = token === 'xyzz'
  if (!isAdmin) {
    res.status(403).send('Unauthorised Access')
  } else {
    next()
  }
}

module.exports = {
  adminAuth,
  userAuth,
}
