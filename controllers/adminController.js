const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const User = require('../models/userModel')
const fs = require('fs')
const path = require('path')

exports.dashboard = (req, res) => {
    res.render('admin/dashboard')
}

exports.loadLogin = (req, res) => {
    res.render('admin/adminLogin')
}


exports.verifyAdminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const adminData = await Admin.findOne({ email })
        
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password)
            if (passwordMatch) {
                req.session.admin = adminData._id;
                res.redirect('/admin/dashboard')
            } else {
                res.render('admin/adminLogin', { error: 'password is invalid' })
            }
        } else {
            res.render('admin/adminLogin', { error: 'email is invalid' })
        }

    } catch (error) {
        next(error)
    }
}


//category

exports.getCategories = catchAsync(async (req, res) => {
    const categories = await Category.find({})
    res.render('admin/categories/index', { categories,success:req.flash('success') });
})

exports.showCreateCategory = (req, res) => {
    res.render('admin/categories/new',{error:req.flash('error')})
}


exports.createCategory = catchAsync(async (req, res) => {
    const { name, photo } = req.body;
    
    if (name.length === 0 || photo.length === 0) {
        return res.render('admin/categories/new', { error: 'Name and Photo are required fields.' });
    }
    
    const oldCategoryName = await Category.find({ name: new RegExp(name, 'i') });
    
    if (oldCategoryName.length === 0) { // Check the length of the array
        await Category.create({
            name,
            image: '/category/' + photo
        });
        req.flash('success', 'Category Added successfully');
        return res.redirect("/admin/Category");
    } else {
        req.flash('error', 'Category name already exists');
        return res.redirect('/admin/categories/create');
    }
});


exports.editCategory = catchAsync(async (req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    res.render('admin/categories/edit', { category })
})

exports.destroyCategory = catchAsync(async (req, res) => {
    const  id  = req.body.id
    const state = Boolean(req.body.state)
    const category = await Category.findByIdAndUpdate(id,{$set:{ is_deleted:state} },{new:true})
        res.redirect('/admin/Category')
})

exports.updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params
    const { name, photo } = req.body
    const category = await Category.findById(id)

    let updatedObj = {
        name,
    }

    if (typeof photo !== "undefined") {
        fs.unlink(path.join(__dirname, '../public', category.image), (err) => {
            if (err) console.log(err);
        })
        updatedObj.image = "/category/" + photo;
    }

    await category.updateOne(updatedObj)

    res.redirect('/admin/Category')
})



//products

exports.showProductsIndex = catchAsync(async (req, res) => {
    const products = await Product.find({}).populate('category');
    res.render('admin/products/index', { products });
});


exports.createProduct = async (req, res) => {
    const { title, brand, description, mrp, regular, check1, check2, check3, check4, check5, check6,check7,check8,check9,check10,check11,check12, images, stock, category } = req.body;
    const imagesWithPath = images.map(img => '/products/' + img);

    try {
        let size = []
        if(check1) size.push(check1)
        if(check2) size.push(check2)
        if(check3) size.push(check3)
        if(check4) size.push(check4)
        if(check5) size.push(check5)
        if(check6) size.push(check6)
        if(check7) size.push(check7)
        if(check8) size.push(check8)
        if(check9) size.push(check9)
        if(check10) size.push(check10)
        if(check11) size.push(check11)
        if(check12) size.push(check12)

        const product = await Product.create({
            title,
            brand,
            images: imagesWithPath,
            description,
            mrp,
            regularPrice: regular,
            size, // Assign the 'size' array directly
            stock,
            category
        });

        res.redirect('/admin/products');
    } catch (error) {
        console.error(error.message);
    }
};


exports.showProductCreate= async (req,res)=>{
    const categories = await Category.find({})
    res.render('admin/products/new',{categories})
}

exports.showProductEdit = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Product.findById(id);
      const category = await Category.find({});
      // Determine the selected category ID based on the product's category field
      const selectedCategory = product.category; // Assuming 'category' is a field in the product object
      res.render('admin/products/edit', { product, category, selectedCategory });
    } catch (error) {
      console.log(error.message);
    }
  }
  

exports.updateProduct = async (req, res) => {
    const { id } = req.params
    const { title, brand, description, mrp,regular,check1, check2, check3, check4, check5, check6,check7, check8, check9, check10, check11, check12, stock, category } = req.body
    try {
        let size = []
        if(check1) size.push(check1)
        if(check2) size.push(check2)
        if(check3) size.push(check3)
        if(check4) size.push(check4)
        if(check5) size.push(check5)
        if(check6) size.push(check6)
        if(check7) size.push(check7)
        if(check8) size.push(check8)
        if(check9) size.push(check9)
        if(check10) size.push(check10)
        if(check11) size.push(check11)
        if(check12) size.push(check12)
      const product = await Product.findByIdAndUpdate(id, {$set: {
        title,
        brand,
        description,
        mrp,
        size,
        stock,
        regularPrice: regular,
        category,
      }}, { new: true })
  
      res.redirect('/admin/products')
    } catch (error) {
      console.log(error);
    }
  }
  
  exports.destroyProductImage = async (req, res) => {
    const { id } = req.params
    const { image } = req.body
    try {
      const product = await Product.findByIdAndUpdate(id, {$pull: { images: image }}, { new: true })
      
      fs.unlink(path.join(__dirname, '../public', image), (err) => {
        if (err) console.log(err)
      })
  
      res.redirect(`/admin/products/${id}/edit`)
    } catch (error) {
      console.log(error);
    }
  }
  
  exports.updateProductImages = async (req, res) => {
    const { id } = req.params
    const { images } = req.body
    let imagesWithPath
    if (images.length) {
      imagesWithPath = images.map(image => '/products/' + image)
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, {$push: { images: imagesWithPath }}, { new: true })
      res.redirect(`/admin/products/${id}/edit`)
    } catch (error) {
      
    }
  }

exports.softDeleteProduct = async (req, res) => {
    const id  = req.body.id;
    const state = Boolean(req.body.state)
    try {
      const product = await Product.findByIdAndUpdate(id, {$set:{ is_deleted: state} }, { new: true });

        res.redirect('/admin/products')
    }catch(err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }

//USER

exports.showUserIndex = catchAsync(async(req,res)=>{
    const users = await User.find();
    res.render('admin/user/index', { users });
})

exports.blockUser = catchAsync(async(req,res)=> {
    const id =req.body.id
    const state = Boolean(req.body.state)
    console.log(state,id)
    const user =await User.findByIdAndUpdate(id,{$set:{isBlocked:state}},{new:true});
    req.session.user = null
    res.redirect('/admin/users')
})

exports.adminLogout = (req, res) => {
    req.session.admin=null
    res.redirect('/admin/login');
}

