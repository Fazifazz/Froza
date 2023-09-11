const router = require('express').Router()
const { isUserLoggedIn,isUserLoggedOut } = require('../middlewares/auth')
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
        showshopIndex,
        addTocart,
        userLogout,
        showAddToCart,
        destroyCartItem,
        updateCartQauntity,
        showCheckout,
    } = require('../controllers/userController')

    const accountController = require('../controllers/accountController')


router.get('/', index)
router.get('/login',isUserLoggedOut, showLogin)
router.post('/login',isUserLoggedOut, validLogin)
router.get('/logout',userLogout)

router.get('/signup', showSignup)
router.post('/signup', insertUser)

router.get('/verifyOtp', showVerifyOtp)
router.post('/verifyOtp', varifyOtp)

router.get('/productDetails/:id',getProductDetails)

router.get('/shop',showshopIndex)
router.get('/shop/:id',getProductDetails)

router.get('/cart',showAddToCart)
router.post('/cart/:id', addTocart);

router.get('/cart/:id', destroyCartItem);

router.post('/update-cart-item-quantity',updateCartQauntity)

router.get('/checkout',showCheckout)
// router.get('/forgotPassword',)

router.get('/profile',accountController.showProfile)
router.get('/profile/address',accountController.showAddress)
router.get('/profile/addAddress',accountController.showAddaddress)
router.post('/profile/addAddress',accountController.addAddress)
router.get('/profile/editAddress/:id',accountController.showEditaddress)
router.put('/profile/editAddress/:id',accountController.editAddress)
router.get('/profile/deleteAddress/:id',accountController.deleteAddress)


module.exports = router