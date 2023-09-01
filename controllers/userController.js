const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const email = require('../utils/email')
const randomString = require('randomstring');
const catchAsync = require('../utils/catchAsync');
require('dotenv').config()
// const { getOTP, getReferralCode, securePassword } = require('../helpers/generator')
const securePassword=async (password)=>{
    try{
        const passwordHash=await bcrypt.hash(password, 10)
        return passwordHash 
    }
    catch(error){
        console.log(error.message)
    }
 
}


exports.index = (req, res) => {
    res.render('users/index')
}

exports.showLogin = (req, res) => {
    res.render('users/login')
}

exports.showSignup = (req, res) => {
    res.render('users/signup')
}

exports.insertUser=async (req,res)=>{
   try {
    const userExists = await User.findOne({ email: req.body.email })
      if (userExists) return res.render('users/signup', { message: null, error: "User already exists." })
      const secPassword=await securePassword(req.body.password)  
      const otp = randomString.generate({
        length:4,
        charset:'numeric',
      })
      const user=new User({
        fname: req.body.fname,
        lname: req.body.lname,
        mobile: req.body.mobile,
        email: req.body.email,
        password: secPassword,
        otp:otp,
      })

      const userData=await user.save()
      if(userData){
        const options = {
          from:process.env.EMAIL,
          to:req.body.email,
          subject: 'Froza varification OTP',
          html:`<center> <h2>Varify Your Email </h2> <br> <h5>OTP :${otp}</h5><br><p>This otp is only valid for 5 minutes only</p></center>`
      }
        await email.sendMail(options);
        return res.redirect('/verifyOtp')
        
      }else{
        res.render('users/signup',{ error:"Your registration has been failed", message: null })
      }
   } catch (error) {
    console.log(error.message);    
   }
}



exports.validLogin = async (req, res)=>{
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email })
      if (!user) return res.render('users/login', { message: null, error: "User not found." })
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch){
        return res.render('users/login', { error: "Wrong password.", message: null })
      }else{
        req.session.user = user._id;
        res.redirect('/');
      }   
    } catch (error) {
      console.log(error.message);    
    }
  }

exports.showVerifyOtp = (req,res) => {
    res.render('users/validateOtp')
}

exports.varifyOtp = catchAsync(async (req,res) => {
  const { otp } = req.body;
  const user = await User.findOne({ otp })
  if(!user){
    req.flash('error','invalid')
    res.redirect('/verifyOtp')
  }else{
    const isVarified = await User.findOneAndUpdate({_id:user._id},{$set:{verified:true}},{new:true});
    console.log(isVarified.verified);
    if(isVarified.verified){
      // res.flash('success','You are Verified!')
      res.redirect('/')
    }else{
      // req.flash('error','invalid')
      res.redirect('/varifyOtp')
    }
  }
})







