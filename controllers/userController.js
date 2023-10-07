const User = require('../models/userModel');
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')
const email = require('../utils/email')
const randomString = require('randomstring');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/categoryModel');
const path = require('path')
const Address = require('../models/addressModel')
const Offer = require('../models/offerModel')
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


const generateReferralCode = async() => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      referralCode += charset[randomIndex];
  }
  return referralCode;
}

const getReferralCode = async() => {

  const referralCode = await generateReferralCode()
  const isreferralExist = await User.findOne({ referralCode})
  if(isreferralExist) getReferralCode()
  return referralCode

}



const ITEMS_per_PAGE = 4;
exports.index = catchAsync(async (req, res) => {
  const userExist = Boolean(req.session.user)
  if(userExist){
    var user = await User.findById({_id:req.session.user})
  }
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * ITEMS_per_PAGE;
  const products = await Product.find().skip(skip).limit(ITEMS_per_PAGE);
  const banners = await Banner.find()
  res.render('users/index', {success:req.flash('success'),products,banners,userExist,user})
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
    const referralCode = await getReferralCode();
    const referral = req.body.referral.trim();
    console.log(referral);
    if(referral){
      const isReferrerExist = await User.findOne({ referralCode: referral });
      if(isReferrerExist){
        const walletHistoryA = {
          date: new Date(),
          amount:100,
          message: `referal reward via referalcode:'${referral}'`,
         };
        let referrerId = isReferrerExist._id;
        var user = new User({
          name: req.body.name,
          mobile: req.body.mobile,
          email: req.body.email,
          password: secPassword,
          referralCode:referralCode,
          referredBy:referral,
          wallet:100,
          walletHistory:walletHistoryA,
          otp: otp,
        })
        const walletHistory = {
          date: new Date(),
          amount:100,
          message: `Referal reward from ${user.name}`,
         };
         await User.findByIdAndUpdate(referrerId, {
          $inc: { wallet: 100 },
          $push: { walletHistory: walletHistory }, // Assuming walletHistory is an array
          // $set: { is_credited: true }
        });
              }else{
        req.flash('error','invalid referral code')
        return res.render('users/signup',{error:req.flash('error')})
      }
    }else{
        user = new User({
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        password: secPassword,
        referralCode:referralCode,
        otp: otp,
      })
    }

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
  res.render('users/verifyEmail')
})

exports.verifyEmail = catchAsync(async (req,res) => {
const user = await User.findOne({email:req.body.email})
if(!user){
  req.flash('error','Email not found')
  res.render('users/verifyEmail',{error:req.flash('error')})
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
  const userExist = Boolean(req.session.user)
  if(userExist){
    var user = await User.findById({_id:req.session.user})
  }
  const product = await Product.findOne({ _id: req.params.id }).populate('offer')
  const category = await Category.findOne({ _id: product.category }).populate('offer')
  res.render('users/productDetails', {user, product, category,success:req.flash('success'),userExist,error:req.flash('error')})
})


exports.showshopIndex = async (req, res) => {
  try {
    const userExist = Boolean(req.session.user);
    if (userExist) {
      var user = await User.findById({ _id: req.session.user });
    }
    const categories = await Category.find({ is_deleted: false }).populate('offer');
    const brands = await Product.distinct('brand');
    const pageNumber = parseInt(req.query.pageNumber) || 1; // Parse the pageNumber query parameter
    const productsPerPage = 8;
    let neededFilter;
    let filterName;

    // Your existing filter logic remains unchanged
    if (req.query.category) {
      console.log(req.query.category);
      neededFilter = { is_deleted: false, 'category.is_deleted': false, 'category.name': req.query.category };
      filterName = req.query.category;
  } else if (req.body.min && req.body.max) {
      let min = parseInt(req.body.min) || 0;
      let max = parseInt(req.body.max) || Number.MAX_SAFE_INTEGER;
      neededFilter = { is_deleted: false, 'category.is_deleted': false, regularPrice: { $gte: min, $lte: max } };
      filterName = `price: less than ${req.body.max}, greater than ${req.body.min}`;
    } else if (req.body.searchItem) {
      const searchTerms = req.body.searchItem.split(' '); // Split search terms
      const result = await Product.find({
          is_deleted: false,
          $and: searchTerms.map((term) => ({ title: { $regex: '.*' + term + '.*', $options: 'i' } }))
      })
          .populate('category')
          .exec();
      if (result.length === 0) {
          req.flash('error', 'Matching product not found, search another..');
          return res.redirect('/shop');
      } else {
          // Construct an array of category names from the result
          const categoryNames = result.map((product) => product.category.name);
          neededFilter = { is_deleted: false, 'category.is_deleted': false, 'category.name': { $in: categoryNames } };
          filterName = `Products matching "${searchTerms}"`;
      }
  } else if (req.query.brand) {
      neededFilter = { is_deleted: false, 'category.is_deleted': false, 'brand': req.query.brand };
      filterName = req.query.brand;
  } else {
      neededFilter = { is_deleted: false, 'category.is_deleted': false };
      filterName = '';
  }


    // Adjust your aggregation pipeline to include $skip and $limit stages based on pageNumber
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'offers',
          localField: 'offer',
          foreignField: '_id',
          as: 'offer'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $lookup: {
          from: 'offers',
          localField: 'category.offer',
          foreignField: '_id',
          as: 'category.offer'
        }
      },
      {
        $match: neededFilter
      },
      {
        $facet: {
          products: [
            {
              $skip: (pageNumber - 1) * productsPerPage // Calculate the skip value
            },
            {
              $limit: productsPerPage
            }
          ],
          totalPages: [
            {
              $count: 'total'
            }
          ]
        }
      }
    ];

    const prdt = await Product.aggregate(aggregationPipeline);
    const totalItems = prdt[0].totalPages[0].total;
    const totalPages = Math.ceil(totalItems / productsPerPage);
    const products = prdt[0].products;

    res.render('users/shop', {
      userExist,
      user,
      success: req.flash('success'),
      error: req.flash('error'),
      products,
      totalPages,
      categories,
      brands,
      totalItems,
      filterName,
      currentPage: pageNumber, // Pass the calculated currentPage
    });
  } catch (error) {
    console.log(error.message);
  }
};



exports.showAddToCart=async (req,res)=>{
  try {
      const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({ _id: req.session.user }).populate({
        path: 'cart.product',
        populate: { path: 'offer' }, // Populate the 'offer' field inside 'product'
      });
      }
      const cart=user.cart
      const totalCartAmount=user.totalCartAmount 
      
      res.render('users/cart',{userExist,user, cart,totalCartAmount,success:req.flash('success')})       
  } catch (error) {
      console.log(error.message)
      res.status(500).send('Internal Server Error');
   }
}

exports.addTocart=async (req,res)=>{
    
  try {
      const user=await User.findById(req.session.user)
      const product = await Product.findById(req.body.productId).populate(['offer','category'])

    //  return console.log(product);
      if(req.body.quantity){
        var quantity= parseInt(req.body.quantity);
        if(quantity>product.stock){
          req.flash('error','stock limit exceeded!')
          return res.redirect(`/productDetails/${req.body.productId}`)
        }
      }else{
        quantity=1
      }
    //  console.log(product)
let price ;


const categoryOffer = await Offer.findById(product.category.offer)
if(product.categoryOfferPrice!==0 && categoryOffer.status === 'Available' && categoryOffer.is_deleted === false){
  console.log(categoryOffer);
  price = product.categoryOfferPrice
}
else if(product.offerPrice !==0 && product.offer.status === 'Available') {
  price = product.offerPrice;
  console.log(price);
 }else{
  price = product.regularPrice
 }
  console.log(price);
      const total=quantity*price
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
        const product = await Product.findById(cartItem.product).populate(['offer','category']);
        if(newQuantity>product.stock){
          req.flash('error','stock limit exceeded!')
          return res.json({stock:product.stock,error:req.flash('error')})
        }
        let price ;


        const categoryOffer = await Offer.findById(product.category.offer)
        if(product.categoryOfferPrice!==0 && categoryOffer.status === 'Available' && categoryOffer.is_deleted === false){
          console.log(categoryOffer);
          price = product.categoryOfferPrice
        }
        else if(product.offerPrice !==0 && product.offer.status === 'Available') {
          price = product.offerPrice;
          console.log(price);
         }else{
          price = product.regularPrice
         }
        const newTotal = newQuantity * price;
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
        
        res.json({ message: 'Cart item quantity updated successfully',totalCartAmount, total: newTotal});
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


exports.showWishlist = catchAsync(async (req, res) => {
  const userExist = Boolean(req.session.user);
  if (userExist) {
    var user = await User.findById({ _id: req.session.user });
  }

  if (user.wishlist.length === 0) {
    return res.render('users/wishlist', {user, userExist, noWishlist: true });
  }

  const wishlistDetails = await User.aggregate([
    {
      $match: {
        _id: user._id,
      },
    },
    {
      $unwind: '$wishlist',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'wishlist',
        foreignField: '_id',
        as: 'wishlist',
      },
    },
  ]);
  res.render('users/wishlist',{user,userExist, wishlistDetails, noWishlist: false });
});


exports.addToWishlist = catchAsync (async (req,res) => {
  const productid=req.body.productId
  const product = await Product.findById(productid)
  const user = await User.findById(req.session.user)
  const existingItemIndex= await user.wishlist.find(item=> item.equals(product._id))
  if(existingItemIndex === undefined){
      user.wishlist.push(product._id)
  }
  await user.save()
  const wishlength = user.wishlist.length
  //to redirect to origin page
  const referer = req.headers.referer;
  const originalPage = referer || '/';
  req.flash('success',`${product.title} is added to your Wish list`)
  res.json({success:req.flash('success'),wishlength})
   res.redirect(originalPage)
})


exports.removeWishlist = catchAsync(async  (req,res) =>{
  const userId = req.session.user;
  const user = await User.findById(userId)
  const wishlistId = req.body.wishlistId
  console.log(wishlistId);
  const wishIntex = user.wishlist.findIndex((item)=>item.equals(wishlistId))
  if(wishIntex!==-1){
    user.wishlist.splice(wishIntex,1)
    await user.save()
  }
  //to redirect to origin page
  const referer = req.headers.referer;
  const originalPage = referer || '/';
  req.flash('success','item removed')
  res.json({success:req.flash('success')})
  res.redirect(originalPage)
})



exports.userLogout = (req, res) => {
  req.session.user = null
  res.redirect('/login')
}