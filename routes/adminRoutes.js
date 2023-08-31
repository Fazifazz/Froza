const router = require('express').Router()
const middleware = require('../middlewares/middleware')
const { 
    dashboard, 
    loadLogin, 
    verifyAdminLogin, 
    getCategories, 
    editCategory, 
    destroyCategory, 
    updateCategory, 
    showCreateCategory, 
    createCategory 
} = require('../controllers/adminController')

router.get('/login', loadLogin)
router.post('/login', verifyAdminLogin)
router.get('/dashboard', dashboard)
router.get('/Category', getCategories)

// Categories Routes

router.get('/categories/create', showCreateCategory)
router.post('/categories', middleware.uploadCategoryImage, middleware.resizeCategoryImage, createCategory)
router.get('/categories/:id/edit', editCategory)
router.delete('/categories/:id', destroyCategory)
router.patch('/categories/:id', middleware.uploadCategoryImage, middleware.resizeCategoryImage, updateCategory)

// Products Routes

// router.get('/products', showProductsIndex)
// router.get('/products/create', showProductCreate)
// router.post('/products', createProduct)
// router.get('/products/:id/edit', showProductEdit)
// router.put('/products/:id', updateProduct)
// router.delete('/products/:id', destroyProduct)


module.exports = router