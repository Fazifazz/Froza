const router = require('express').Router()
const { index, showLogin,showSignup,insertUser,validLogin} = require('../controllers/userController')

router.get('/', index)
router.get('/login', showLogin)
router.post('/login', validLogin)

router.get('/signup', showSignup)
router.post('/signup', insertUser)

router.get('/verifyotp', )
// router.post('/signup',saveAndLogin)

// router.post('/validateOTP',validateOTP)
// router.post('/resendOIP',resendOTP)

  





module.exports = router