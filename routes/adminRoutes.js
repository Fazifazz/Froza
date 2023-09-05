const router = require('express').Router()
const middleware = require('../middlewares/middleware')
const { isAdminLoggedIn,isAdminLoggedOut  } = require('../middlewares/auth')
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

router.get('/logout',  isAdminLoggedIn,adminLogout)

module.exports = router