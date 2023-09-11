const User = require('../models/userModel');
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')
const email = require('../utils/email')
const randomString = require('randomstring');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/categoryModel');
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


exports.index = catchAsync(async (req, res) => {
  const products = await Product.find()
  res.render('users/index', { products })
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
        subject: 'Froza verification OTP',
        html: `<center> <h2>Varify Your Email </h2> <br> <h5>OTP :${otp}</h5><br><p>This otp is only valid for 5 minutes only</p></center>`
      }
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
  res.render('users/validateOtp')
}

exports.varifyOtp = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findOne({ otp })
  if (!user) {
    req.flash('error', 'invalid')
    res.redirect('/verifyOtp')
  } else {
    const isVarified = await User.findOneAndUpdate({ _id: user._id }, { $set: { verified: true } }, { new: true });
    console.log(isVarified.verified);
    if (isVarified.verified) {

      res.redirect('/')
    } else {

      res.redirect('/varifyOtp')
    }
  }
})

exports.getProductDetails = catchAsync(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id })
  const category = await Category.findOne({ _id: product.category })
  res.render('users/productDetails', { product, category })
})


exports.showshopIndex = async (req, res) => {
  const products = await Product.find()
  res.render('users/shop', { products })
}


// exports.showForgetPassword = async (req,res) => {
//   const user = req.cookies
// }



exports.showAddToCart=async (req,res)=>{
  try {
      const user=await User.findById(req.session.user).populate('cart.product')  
      const cart=user.cart
      const totalCartAmount=user.totalCartAmount   
      res.render('users/cart',{success:req.flash('success'), error:req.flash('error'), cart,totalCartAmount})       
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
     res.redirect(req.url)
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

exports.destroyCartItem = catchAsync ( async (req,res) => {
  const userId = req.session.user; 
  const user = await User.findById(userId)
  const cartItemId = req.params.id
  const cartIndex = user.cart.findIndex((item) => item._id.equals(cartItemId) )
  if(cartIndex !== -1){
     user.totalCartAmount = user.totalCartAmount - user.cart[cartIndex].total
     user.cart.splice(cartIndex,1);
     await user.save();
  }
  res.redirect('/cart')
})


exports.showCheckout = catchAsync(async (req,res) => {
  const userId = req.session.user;
  const user = await User.findById(userId).populate('cart.product')
  const cart = user.cart;
  const totalCartAmount=user.totalCartAmount
  res.render('users/checkout',{cart,totalCartAmount})
})

exports.showProfileIndex = catchAsync ( async (req,res) => {
  const userid = req.session.user;
  const user = await User.findById(userid)
  res.render('users/profile',{user})
})



exports.userLogout = (req, res) => {
  req.session.user = null
  res.redirect('/login')
}







