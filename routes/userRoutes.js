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
    } = require('../controllers/userController')



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
// router.patch('/cart/:id',updateCartQuantity)
router.get('/cart/:id', destroyCartItem);

router.post('/update-cart-item-quantity',updateCartQauntity)


module.exports = router