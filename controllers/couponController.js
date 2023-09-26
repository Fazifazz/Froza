const mongoose = require('mongoose')
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const  Address = require('../models/addressModel')
const  Coupon = require('../models/couponModel')
const crypto = require('crypto')
const catchAsync = require('../utils/catchAsync')


exports.showCoupons  = catchAsync (async (req,res) =>{
    const coupons = await Coupon.find({})
    res.render('admin/coupons/index',{coupons,success:req.flash('success')})
})

exports.showAddCoupon = catchAsync (async (req,res) =>{
    res.render('admin/coupons/new')
})

//coupon code generator
function generateCouponCode() {
    
    const codeRegex = /^[A-Z0-9]{5,15}$/;
    let code = '';
    while (!codeRegex.test(code)) {
      code = Math.random().toString(36).substring(7);
    }
    return Coupon.findOne({ code })
      .then(existingCoupon => {
        if (existingCoupon) {
            return generateCouponCode();// If the code is not unique, generate a new one recursively
          }
          return code; // Return the unique code
        });
  }

exports.addCoupon = catchAsync(async (req,res) =>{
    const { codePrefix,description,discountType,discountAmount,minPurchase,usageLimit,expiryDate } = req.body;
    let couponCode =await generateCouponCode()
    couponCode=codePrefix + couponCode

    const coupon = await Coupon.create({
        code:couponCode,
        codePrefix,
        description,
        discountType,
        discountAmount,
        minPurchase,
        usageLimit,
        expiryDate 
    })
    await coupon.save()
    req.flash('success','Coupen added successfully')
    res.redirect('/admin/coupons')
})

exports.showEditCoupon = catchAsync (async (req,res) => {
    const { id } = req.params
    const coupon = await Coupon.findById({_id:id})
    res.render('admin/coupons/edit',{ coupon })
})

exports.editCoupon = catchAsync (async (req,res) => {
    const { id } = req.params
    const { codePrefix,description,discountType,discountAmount,minPurchase,usageLimit,expiryDate } = req.body;   
    const coupon = await Coupon.findByIdAndUpdate(id,{$set:{
        codePrefix,
        description,
        discountType,
        discountAmount,
        minPurchase,
        usageLimit,
        expiryDate
    }},{new:true})

    res.redirect('/admin/coupons')
})


exports.applyCoupon = catchAsync(async (req, res) => {
    const { couponCode } = req.body;
    const userId = req.session.user;
    // Fetch the user and the coupon
    const user = await User.findById(userId);
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!user || !coupon) {
        return res.json({ success: false, message: 'Invalid coupon code' });
    }

    let orderTotal = req.body.orderTotal // Initialize orderTotal with the user's total cart amount

    if (orderTotal < coupon.minPurchase || user.cart.length < 3) {
        req.flash('error', 'You do not meet the coupon criteria');
        return res.json({ criteriaFailure: true, error: req.flash('error') });
    }


    const usedUser = coupon.usedUsers.find((item) => item.usedUser.toString() === userId.toString());
    if (usedUser) {
        if (usedUser.usedCount >= coupon.usageLimit) {
            req.flash('error', 'Usage limit exceeded');
            return res.json({ usageLimit: true, error: req.flash('error') });
        }
    }

    req.session.couponCode = couponCode;
    const discount = coupon.discountAmount;
    await user.save();

    return res.json({ validCoupon: true, discount, orderTotal });
});



exports.destroyCoupon = catchAsync (async (req,res) => {
    const id = req.body.id
    const state = Boolean(req.body.state);
    await Coupon.findByIdAndUpdate(id,{$set:{isCancelled:state}},{new:true})
    res.redirect('/admin/coupons')
})

