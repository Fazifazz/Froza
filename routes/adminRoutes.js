const router = require('express').Router()
const middleware = require('../middlewares/middleware')
const { isAdminLoggedIn,isAdminLoggedOut  } = require('../middlewares/auth')
const bannerCtrl = require('../controllers/bannerController')
const upload = require('../middlewares/middleware');
const { 
    dashboard, 
    loadLogin, 
    verifyAdminLogin, 
    getCategories, 
    editCategory, 
    destroyCategory, 
    updateCategory, 
    showCreateCategory, 
    createCategory, 
    showProductCreate,
    createProduct,
    showProductsIndex,
    showProductEdit,
    updateProduct,
    destroyProductImage,
    updateProductImages,
    softDeleteProduct,
    showUserIndex,
    blockUser,
    adminLogout,
} = require('../controllers/adminController')
const orderController = require('../controllers/orderController')

router.get('/login',isAdminLoggedOut, loadLogin)
router.post('/login',isAdminLoggedOut, verifyAdminLogin)



//dashboard
router.get('/dashboard', isAdminLoggedIn,dashboard)

// Categories Routes
router.get('/Category', isAdminLoggedIn, getCategories)
router.get('/categories/create', isAdminLoggedIn, showCreateCategory)
router.post('/categories',  isAdminLoggedIn,middleware.uploadCategoryImage, middleware.resizeCategoryImage, createCategory)
router.get('/categories/:id/edit', isAdminLoggedIn, editCategory)
router.delete('/categories/:id', isAdminLoggedIn, destroyCategory)
router.patch('/categories/:id', isAdminLoggedIn, middleware.uploadCategoryImage, middleware.resizeCategoryImage, updateCategory)

// Products Routes

router.get('/products', isAdminLoggedIn, showProductsIndex)
router.get('/products/create', isAdminLoggedIn, showProductCreate)
router.post('/products' , isAdminLoggedIn,middleware.uploadProductImages,middleware.resizeProductImages,createProduct)
router.get('/products/:id/edit', isAdminLoggedIn, showProductEdit)
// router.patch('/products/:id', isAdminLoggedIn,middleware.uploadProductImages,middleware.resizeProductImages, updateProduct)
router.post('/products/destroy', isAdminLoggedIn,softDeleteProduct)
router.patch('/products/:id', isAdminLoggedIn, updateProduct)
router.delete('/products/:id/img/delete', isAdminLoggedIn, destroyProductImage)
router.patch('/products/:id/img/add', isAdminLoggedIn, middleware.uploadProductImages, middleware.resizeProductImages, updateProductImages)


//user routes
router.get('/users', isAdminLoggedIn,showUserIndex)
router.post('/users/destroy',  isAdminLoggedIn,blockUser)

//banner
router.get('/banners', isAdminLoggedIn, bannerCtrl.showBannerIndex)
router.get('/banners/create', isAdminLoggedIn, bannerCtrl.showBannerCreate)
router.post('/banners' , isAdminLoggedIn,middleware.uploadBannerImages,middleware.resizeBannerImages,bannerCtrl.createBanner)
router.get('/banners/:id/edit', isAdminLoggedIn, bannerCtrl.showEditBanners)
router.post('/banners/destroy', isAdminLoggedIn,bannerCtrl.deleteBanner)
router.patch('/banners/:id', isAdminLoggedIn, bannerCtrl.updateBanner)
router.delete('/banners/:id/img/delete', isAdminLoggedIn, bannerCtrl.destroyBannerImage)
router.patch('/banners/:id/img/add', isAdminLoggedIn,middleware.uploadBannerImages,middleware.resizeBannerImages, bannerCtrl.updateBannerImages)

//orders
router.get('/orders',isAdminLoggedIn,orderController.getOrderList)
router.get('/orders/:id',isAdminLoggedIn,orderController.orderDetails)
router.patch('/orders',isAdminLoggedIn,orderController.updateOrderStatus)

router.get('/logout',  isAdminLoggedIn,adminLogout)

module.exports = router