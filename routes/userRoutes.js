const router = require('express').Router()
const { isUserLoggedIn,isUserLoggedOut,isUserBlocked } = require('../middlewares/auth')
const
    {   
        index,
        showLogin,
        showSignup,
        insertUser,
        validLogin,
        showVerifyOtp,
        varifyOtp,
        getProductDetails,
        userLogout
    } = require('../controllers/userController')

// router.use('/',isUserBlocked)

router.get('/', index)
router.get('/login',isUserLoggedOut, showLogin)
router.post('/login',isUserLoggedOut, validLogin)
router.get('/logout',userLogout)

router.get('/signup', showSignup)
router.post('/signup', insertUser)

router.get('/verifyOtp', showVerifyOtp)
router.post('/verifyOtp', varifyOtp)

router.get('/productDetails/:id',getProductDetails)

// router.use('/',isUserLoggedIn)




// router.post('/signup',saveAndLogin)

// router.post('/validateOTP',validateOTP)
// router.post('/resendOIP',resendOTP)
module.exports = router