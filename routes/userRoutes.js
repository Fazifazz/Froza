const router = require('express').Router();
const { isUserLoggedIn, isUserLoggedOut } = require('../middlewares/auth');

// Import controllers
const {
    index,
    showLogin,
    showSignup,
    insertUser,
    validLogin,
    showVerifyOtp,
    varifyOtp,
    forgetVerifyOtp,
    showVerifyEmail,
    verifyEmail,
    showEditPassword,
    updatePassword,
    getProductDetails,
    showshopIndex,
    addTocart,
    userLogout,
    showAddToCart,
    destroyCartItem,
    updateCartQauntity,
    showWishlist,
    resendOtp,
    addToWishlist,
    removeWishlist,
} = require('../controllers/userController');

const accountController = require('../controllers/accountController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController')
const profileImages = require('../middlewares/uploadImages')

// Public routes
router
    .get('/', index)
    .get('/login', isUserLoggedOut, showLogin)
    .post('/login', isUserLoggedOut, validLogin)
    .get('/signup', showSignup)
    .post('/signup', insertUser)
    .get('/verifyOtp', showVerifyOtp)
    .get('/verifyOtp/:id', showVerifyOtp)
    .post('/verifyOtp', varifyOtp)
    .get('/forgetPassword',showVerifyEmail)
    .post('/verifyEmail',verifyEmail)
    .get('/editPassword',showEditPassword)
    .post('/forgetVerifyOtp',forgetVerifyOtp)
    .post('/reset-password',updatePassword)
    .patch('/resendOtp', resendOtp)
    .get('/productDetails/:id', getProductDetails)
    .get('/shop', showshopIndex)
    .post('/shop',showshopIndex)
    .get('/shop/:id', getProductDetails);

// Protected routes

router
    .get('/logout',isUserLoggedIn, userLogout)
    .get('/cart', isUserLoggedIn,showAddToCart)
    .post('/cart/:id',isUserLoggedIn, addTocart)
    .get('/cart/:id',isUserLoggedIn, destroyCartItem)
    .post('/update-cart-item-quantity',isUserLoggedIn, updateCartQauntity)
    .get('/checkout',isUserLoggedIn, orderController.showCheckout)
    .post('/applyCoupon',isUserLoggedIn,couponController.applyCoupon)
    .post('/checkout',isUserLoggedIn, orderController.placeOrder)
    .get('/orderSuccess',isUserLoggedIn,orderController.showOrderSuccess)
    
    .get('/showOrders',isUserLoggedIn, orderController.showOrdersIndex)
    .post('/showOrders/invoice',isUserLoggedIn,orderController.loadInvoice)
    .get('/razorpay/CreateOrder',isUserLoggedIn,orderController.createOrder)
    .post('/showOrders/orderDetails',isUserLoggedIn, orderController.orderDetails)
    .post('/showOrders/cancelOrder',isUserLoggedIn, orderController.destroyOrder)
    .post('/showOrders/refundOrder',isUserLoggedIn,orderController.refundOrder)
    //address
    .get('/profile',isUserLoggedIn,accountController.showProfile)
    .get('/profile/edit',isUserLoggedIn,accountController.showEditProfile)
    .patch('/profile/edit',isUserLoggedIn,profileImages.uploadProfileImage,profileImages.resizeProfileImage,accountController.updateProfile)
    .get('/profile/address',isUserLoggedIn, accountController.showAddress)
    .get('/profile/addAddress',isUserLoggedIn, accountController.showAddaddress)
    .post('/profile/addAddress',isUserLoggedIn, accountController.addAddress)
    .get('/profile/editAddress/:id',isUserLoggedIn, accountController.showEditaddress)
    .put('/profile/editAddress/:id', isUserLoggedIn,accountController.editAddress)
    .get('/profile/deleteAddress/:id',isUserLoggedIn, accountController.deleteAddress)
    .post('/profile/setDefaultAddress',isUserLoggedIn, accountController.setDefaultAddress)

    .get('/wishlist',isUserLoggedIn,showWishlist)
    .post('/add-to-wishlist',isUserLoggedIn,addToWishlist)
    .post('/remove-from-wishlist',isUserLoggedIn,removeWishlist)

    .get('/profile/wallet',isUserLoggedIn,accountController.showWalletIndex)
    .post('/profile/addMoneyToWallet/',isUserLoggedIn,accountController.addMoneyToWallet)
    .post('/verifyWalletPayment',isUserLoggedIn,accountController.verifyWalletPayment)
   
module.exports = router;
