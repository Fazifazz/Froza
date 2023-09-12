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
    const orderController = require('../controllers/orderController')


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

router.get('/cart',isUserLoggedIn,showAddToCart)
router.post('/cart/:id',isUserLoggedIn, addTocart);

router.get('/cart/:id',isUserLoggedIn, destroyCartItem);

router.post('/update-cart-item-quantity',isUserLoggedIn,updateCartQauntity)

router.get('/checkout',isUserLoggedIn,orderController.showCheckout)
// router.get('/forgotPassword',)

router.get('/profile',isUserLoggedIn,accountController.showProfile)
router.get('/profile/address',isUserLoggedIn,accountController.showAddress)
router.get('/profile/addAddress',isUserLoggedIn,accountController.showAddaddress)
router.post('/profile/addAddress',isUserLoggedIn,accountController.addAddress)
router.get('/profile/editAddress/:id',isUserLoggedIn,accountController.showEditaddress)
router.put('/profile/editAddress/:id',isUserLoggedIn,accountController.editAddress)
router.get('/profile/deleteAddress/:id',isUserLoggedIn,accountController.deleteAddress)
router.post('/profile/setDefaultAddress',isUserLoggedIn,accountController.setDefaultAddress)


//orders

router.get('/showOrders',isUserLoggedIn,orderController.showOrdersIndex)
router.post('/showOrders',isUserLoggedIn,orderController.verifyCheckOut)
router.post('/showOrders/orderDetails',isUserLoggedIn,orderController.orderDetails)
router.post('/showOrders/cancelOrder',isUserLoggedIn,orderController.destroyOrder)

module.exports = router