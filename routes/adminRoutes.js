const router = require('express').Router();
const uploadImages = require('../middlewares/uploadImages');
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middlewares/auth');
const bannerCtrl = require('../controllers/bannerController');
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
} = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')

// Admin Login Routes
router
    .get('/login', isAdminLoggedOut, loadLogin)
    .post('/login', isAdminLoggedOut, verifyAdminLogin);

// Dashboard
router.get('/dashboard', isAdminLoggedIn, dashboard);

// Categories Routes
router
    .get('/Category', isAdminLoggedIn, getCategories)
    .get('/categories/create', isAdminLoggedIn, showCreateCategory)
    .post('/categories', isAdminLoggedIn, uploadImages.uploadCategoryImage, uploadImages.resizeCategoryImage, createCategory)
    .get('/categories/:id/edit', isAdminLoggedIn, editCategory)
    .post('/categories/destroy', isAdminLoggedIn, destroyCategory)
    .patch('/categories/:id', isAdminLoggedIn, uploadImages.uploadCategoryImage, uploadImages.resizeCategoryImage, updateCategory)
   

// Products Routes
router
    .get('/products', isAdminLoggedIn, showProductsIndex)
    .get('/products/create', isAdminLoggedIn, showProductCreate)
    .post('/products', isAdminLoggedIn, uploadImages.uploadProductImages, uploadImages.resizeProductImages, createProduct)
    .get('/products/:id/edit', isAdminLoggedIn, showProductEdit)
    .post('/products/destroy', isAdminLoggedIn, softDeleteProduct)
    .patch('/products/:id', isAdminLoggedIn, updateProduct)
    .delete('/products/:id/img/delete', isAdminLoggedIn, destroyProductImage)
    .patch('/products/:id/img/add', isAdminLoggedIn, uploadImages.uploadProductImages, uploadImages.resizeProductImages, updateProductImages);

// User Routes
router
    .get('/users', isAdminLoggedIn, showUserIndex)
    .post('/users/destroy', isAdminLoggedIn, blockUser);

// Banner Routes
router
    .get('/banners', isAdminLoggedIn, bannerCtrl.showBannerIndex)
    .get('/banners/create', isAdminLoggedIn, bannerCtrl.showBannerCreate)
    .post('/banners', isAdminLoggedIn, uploadImages.uploadBannerImages, uploadImages.resizeBannerImages, bannerCtrl.createBanner)
    .get('/banners/:id/edit', isAdminLoggedIn, bannerCtrl.showEditBanners)
    .post('/banners/destroy', isAdminLoggedIn, bannerCtrl.deleteBanner)
    .patch('/banners/:id', isAdminLoggedIn, bannerCtrl.updateBanner)
    .delete('/banners/:id/img/delete', isAdminLoggedIn, bannerCtrl.destroyBannerImage)
    .patch('/banners/:id/img/add', isAdminLoggedIn, uploadImages.uploadBannerImages, uploadImages.resizeBannerImages, bannerCtrl.updateBannerImages);

// Order Routes
router
    .get('/orders', isAdminLoggedIn, orderController.getOrderList)
    .get('/orders/:id', isAdminLoggedIn, orderController.orderDetails)
    .patch('/orders', isAdminLoggedIn, orderController.updateOrderStatus);

  
 //coupon routes
 router
       .get('/coupons',isAdminLoggedIn,couponController.showCoupons) 
       .get('/coupon/create',isAdminLoggedIn,couponController.showAddCoupon)   
       .post('/coupon/addCoupon',isAdminLoggedIn,couponController.addCoupon)
       .get('/coupons/edit/:id',isAdminLoggedIn,couponController.showEditCoupon)  
       .post('/coupons/edit/:id',isAdminLoggedIn,couponController.editCoupon)
       .post('/coupons/destroy',isAdminLoggedIn,couponController.destroyCoupon) 

//offers routes
router
      .get('/offers',isAdminLoggedIn,offerController.showOfferIndex) 
      .get('/offers/create',isAdminLoggedIn,offerController.showAddOffer)
      .post('/offers/create',isAdminLoggedIn,offerController.addOffer)
      .get('/offers/edit/:id',isAdminLoggedIn,offerController.showOfferEdit)
      .post('/offers/edit/:id',isAdminLoggedIn,offerController.updateOffer)
      .post('/offers/destroy',isAdminLoggedIn,offerController.destroyOffer) 

// Logout Route
router.get('/logout', isAdminLoggedIn, adminLogout);

module.exports = router;
