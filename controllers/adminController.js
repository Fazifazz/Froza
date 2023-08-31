const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/catchAsync')
const Category = require('../models/categoryModel')
const fs = require('fs')
const path = require('path')

exports.dashboard = (req, res) => {
    res.render('admin/dashboard')
}

// exports.adminLogin = (req,res) => {
//     res.render('admin/adminLogin')
// }

exports.loadLogin = (req, res) => {
    res.render('admin/adminLogin')
}


exports.verifyAdminLogin = async(req,res, next) => {
    try {
        const {email, password} = req.body;
        const adminData = await Admin.findOne({email})
        
        if(adminData){
            const passwordMatch = await bcrypt.compare(password, adminData.password)
            if(passwordMatch){
                req.session.adminId = adminData._id;
                res.redirect('/admin/dashboard')
            }else{
                res.render('admin/adminLogin',{error:'password is invalid'})
            }
        }else{
            res.render('admin/adminLogin',{error:'email is invalid'})
        }

    } catch (error) {
        next(error)
    }
}


//category

exports.getCategories = catchAsync(async (req, res) => {
    const categories = await Category.find({})
    res.render('admin/categories/index', { categories });
})

exports.showCreateCategory = (req, res) => {
    res.render('admin/categories/new')
}


exports.createCategory = catchAsync(async(req,res)=>{
    const { name, photo } = req.body;
    if (name.length === 0 || photo.length === 0) return res.render('admin/categories/new', { error: 'Name and Photo are required fields.' })
    await Category.create({
        name,
        image: '/category/' + photo
    })
    req.flash('success','Category Added successfully')
    res.redirect("/admin/Category");
})

exports.editCategory = catchAsync(async (req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    res.render('admin/categories/edit', { category })
})

exports.destroyCategory = catchAsync(async (req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    fs.unlink(path.join(__dirname, '../public', category.image), async (err) => {
        if (err) console.log(err);
        await category.deleteOne();
        res.redirect('/admin/Category')
    })
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

// exports.updateCategory = catchAsync(async(req,res)=>{
//     const {name,photo} = req.body;
//     await Category.updateOne({_id:req.params.id},{name,image:photo});
//     req.flash('success','Category Added successfully')
//     res.redirect("/admin/category");
// })
