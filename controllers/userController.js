const User = require('../models/userModel');
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')
const email = require('../utils/email')
const randomString = require('randomstring');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/categoryModel');
const path = require('path')
const Address = require('../models/addressModel')
const Banner = require('../models/bannerModel');
const { log } = require('console');
require('dotenv').config()

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  }
  catch (error) {
    console.log(error.message)
  }

}

const ITEMS_per_PAGE = 4;
exports.index = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * ITEMS_per_PAGE;
  const products = await Product.find().skip(skip).limit(ITEMS_per_PAGE);
  const banners = await Banner.find()
  res.render('users/index', { products,banners,})
})

exports.showLogin = (req, res) => {
  res.render('users/login')
}

exports.showSignup = (req, res) => {
  res.render('users/signup')
}

exports.insertUser = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.render('users/signup', {
        message: null,
        error: "Password and confirm password do not match."
      });
    }
    const userExists = await User.findOne({ email: req.body.email })
    if (userExists) return res.render('users/signup', { message: null, error: "User already exists." })
    const secPassword = await securePassword(req.body.password)
    const otp = randomString.generate({
      length: 4,
      charset: 'numeric',
    })
    const user = new User({
      name: req.body.name,
      mobile: req.body.mobile,
      email: req.body.email,
      password: secPassword,
      otp: otp,
    })

    const userData = await user.save()
    if (userData) {
      const options = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Froza shoe hub verification OTP',
        html: `<center> <h2>Varify Your Email </h2> <br> <h5>OTP :${otp}</h5><br><p>This otp is only valid for 2 minutes only</p></center>`
      }
      //set cookie to get userid where no session available
      res.cookie('userId',String(user._id),{
        maxAge: 60000 * 60 * 24 * 7,
        httpOnly:true
      })
      req.session.user=user._id
      await email.sendMail(options);
      return res.redirect('/verifyOtp')

    } else {
      res.render('users/signup', { error: "Your registration has been failed", message: null })
    }
  } catch (error) {
    console.log(error.message);
  }
}



exports.validLogin = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.render('users/login', { message: null, error: "User not found." })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.render('users/login', { error: "Wrong password.", message: null })
    } else {
      req.session.user = user._id;
      if (!user.isBlocked) {
        res.redirect('/');
      } else {
        req.session.user = null
        return res.render('users/login', { error: "Sorry, you are blocked by the admin!", message: null })
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

exports.showVerifyOtp = (req, res) => {
  if(req.params.id){
    return res.render('users/validateOtp',{ userId:req.params.id,error:req.flash('error') })
  }
    res.render('users/validateOtp',{userId:null,error:req.flash('error')})
}

exports.varifyOtp = catchAsync(async (req, res) => {
  const  otp  = req.body.otp;
  const user = await User.findOne({ otp })
  if (!user) {
    req.flash('error', 'invalid otp')
    res.redirect('/verifyOtp')
  } else {
    const isVarified = await User.findOneAndUpdate({ _id: user._id }, { $set: { verified: true } }, { new: true });
    console.log(isVarified.verified);
    if (isVarified.verified) {

      res.redirect('/')
    } else {

      res.redirect('/verifyOtp')
    }
  }
})

exports.forgetVerifyOtp=async (req,res)=>{
  const otp =req.body.otp
  try {
      const user = await User.findOne({otp})
      
      if(!user){
          const userId=req.cookies.userId
          req.flash('error','invalid Otp');
          res.redirect(`/verifyOtp/${userId}`)
      }
      else{
          const isVerified=await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true})
          if(isVerified.verified){
              res.redirect('/editPassword')
          }
          else{
              const userId=user._id
              req.flash('error', 'not verified');
              res.redirect(`/verifyOtp/${userId}`)
          }
      }
  } catch (error) {
      console.log(error.message)
  }
}

exports.showEditPassword = catchAsync( async (req,res) =>{
  res.render('users/editPassword',{error:req.flash('error')})
})

exports.updatePassword = catchAsync( async (req,res) => {
  const {password,Cpassword } = req.body
  if(password!==Cpassword){
    req.flash('error','password and confirm password are not match!')
    res.redirect('/editPassword')
  }else{
    const userId = req.cookies.userId
    const user = await User.findById(userId)
    const secPassword = await securePassword(password)
    user.password=secPassword;
    await user.save();
    //reset password
    if(req.session.user){
      req.flash('success','password updated successfully')
      res.redirect('/profile')
  }
  //forgot password
  else{
      res.redirect('/login')
  } 
  }
})

exports.showVerifyEmail = catchAsync( async (req,res) => {
  res.render('users/verifyEmail',{error:req.flash('error')})
})

exports.verifyEmail = catchAsync(async (req,res) => {
const user = await User.findOne({email:req.body.email})
if(!user){
  return res.render('users/login',{error:'Email not found'})
}
  const newOtp = randomString.generate({
    length: 4,
    charset: 'numeric',
  })
  const options = {
    from:process.env.EMAIL,
    to:req.body.email,
    subject:'Froza shoe hub verification otp',
    html:`<center> <h2>Verify Your Email </h2> <br> <h5>OTP :${newOtp}</h5><br><p>This otp is only valid for 2 minutes only</p></center>`
  }
  res.cookie('userId',String(user._id),{
    maxAge: 60000 * 60 * 24 * 7,
    httpOnly:true
  })
  user.otp = newOtp
  await user.save();
  await email.sendMail(options);

  let userId = user._id
  return res.redirect(`/verifyOtp/${userId}`)

})




exports.resendOtp = catchAsync(async (req,res) => {
  const userid = req.session.user || req.cookies.userId;
  const newOtp =randomString.generate({
    length:4,
    charset:'numeric'
})
const user = await User.findByIdAndUpdate(userid,{otp:newOtp});
const options = {
  from: process.env.EMAIL,
  to: user.email, // Use the user's email stored in the database
  subject: 'Froza shoe hub verification otp',
  html: `<center> <h2>Verify Your Email</h2> <br> <h5>OTP :${newOtp} </h5><br><p>This OTP is only valid for 2 minute</p></center>`
}
await email.sendMail(options)
if(req.session.user){
  res.redirect('/verifyOtp')
}
else{
  const userId=user._id
  res.redirect(`/verifyOtp/${userId}`)
}

})

exports.getProductDetails = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id })
  const category = await Category.findOne({ _id: product.category })
  res.render('users/productDetails', { product, category,success:req.flash('success') })
})


const ITEMS_PER_PAGE = 8;

exports.showshopIndex = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const filters = {}; // Initialize an empty filter object
  
  // Check for category filter
  if (req.query.category) {
    filters.category = req.query.category;
  }

  // Check for brand filter
  if (req.query.brand) {
    filters.brand = req.query.brand;
  }
console.log(req.query.brand);
  // Check for color filter
  if (req.query.color) {
    filters.color = req.query.color;
  }
  

  // Check for price range filter
  if (req.query.minPrice && req.query.maxPrice) {
    filters.mrp = {
      $gte: parseFloat(req.query.minPrice),
      $lte: parseFloat(req.query.maxPrice),
    };
  }
  const selectedCategory = req.query.category || 'All Categories';
  try {
    const totalProducts = await Product.countDocuments(filters);
    const products = await Product.find(filters).skip(skip).limit(ITEMS_PER_PAGE)
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const categories = await Category.distinct('name')
    const brands = await Product.distinct('brand')

    res.render('users/shop', {
      products,
      success: req.flash('success'),
      currentPage: page,
      totalPages,
      categories,
      brands,
      selectedBrand: req.query.brand,
      selectedCategory: req.query.category,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
};




exports.showAddToCart=async (req,res)=>{
  try {
      const user=await User.findById(req.session.user).populate('cart.product')  
      const cart=user.cart
      const totalCartAmount=user.totalCartAmount   
      res.render('users/cart',{ cart,totalCartAmount,success:req.flash('success')})       
  } catch (error) {
      console.log(error.message)
      res.status(500).send('Internal Server Error');
    }
}

exports.addTocart=async (req,res)=>{
    
  try {
      const user=await User.findById(req.session.user)
      const quantity=1
      const product=await Product.findById(req.body.productId)
      const total=quantity*product.regularPrice
      let totalCartAmount = 0;
      user.cart.forEach(item => {
         totalCartAmount +=  item.total;
      })
      const existingCartItemIndex=await user.cart.find(item=> item.product.equals(product._id))
      if(existingCartItemIndex){
          existingCartItemIndex.quantity+=quantity
          existingCartItemIndex.total+=total
          user.totalCartAmount= (totalCartAmount + total)
      }
      
      else{
          user.cart.push({product:product._id,quantity,total})
          user.totalCartAmount = (totalCartAmount + total);
      }
     await user.save()
     req.flash('success','product added to cart successfully')
     const referer = req.headers.referer;
     const originalPage = referer || '/';
     res.redirect(originalPage)
  }catch (error) {
      console.log(error.message)
      res.status(500).send('Internal Server Error');
    }
}


exports.updateCartQauntity = catchAsync ( async (req,res) => {
  const user = await User.findById(req.session.user);
        const cartItemId = req.body.cartItemId;
        const newQuantity = req.body.quantity;
        // Find the cart item by its ID
        const cartItem = user.cart.find(item => item._id.equals(cartItemId));     
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        // Calculate the new total based on the product's price and new quantity
        const product = await Product.findById(cartItem.product);
        if(newQuantity>product.stock){
          req.flash('error','stock limit exceeded!')
          return res.json({stock:product.stock,error:req.flash('error')})
        }
        const newTotal = newQuantity * product.regularPrice;
        // Update cart item properties
        cartItem.quantity = newQuantity;
        cartItem.total = newTotal;
        // Update totalCartAmount by calculating the sum of all cart item totals
        let totalCartAmount = 0;
        user.cart.forEach(item => {
            totalCartAmount += item.total;
        });
        user.totalCartAmount = totalCartAmount;
        await user.save();
        
        res.json({ message: 'Cart item quantity updated successfully',totalCartAmount, total: newTotal });
})

exports.destroyCartItem = catchAsync(async (req, res) => {
  const userId = req.session.user;
  const user = await User.findById(userId);
  const cartItemId = req.params.id;
  const cartIndex = user.cart.findIndex((item) => item._id.equals(cartItemId));
  
  if (cartIndex !== -1) {
    user.totalCartAmount = user.totalCartAmount - user.cart[cartIndex].total;
    user.cart.splice(cartIndex, 1);
    await user.save();
    req.flash('success', 'Item removed from the cart.'); 
    res.redirect('/cart')// Flash a success message
  } else {
    req.flash('error', 'Item not found in the cart.'); // Flash an error message
  }
  
  res.redirect('/cart');
});



exports.userLogout = (req, res) => {
  req.session.user = null
  res.redirect('/login')
}







