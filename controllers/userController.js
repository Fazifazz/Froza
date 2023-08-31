const User = require('../models/userModel');
const bcrypt = require('bcrypt')
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
      const user=new User({
        fname: req.body.fname,
        lname: req.body.lname,
        mobile: req.body.mobile,
        email: req.body.email,
        password: secPassword,
      })
      const userData=await user.save()
      if(userData){
        res.redirect('/login')
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

// exports.saveAndLogin = async(req,res, next) => {
//     try {
//         const { fname, lname, email, mobile, password, confirmPassword, referral } = req.body;
//         if(password === confirmPassword){

//             const userData = await User.findOne({email})
//             if(userData){
//                 return res.render('signup',{message : 'User Already Exists'})
//             }

//             // const OTP = req.session.OTP = getOTP()
            
//             // sendVerifyMail(email, OTP); 

//             // setTimeout(() => {
//             //     req.session.OTP = null; // Or delete req.session.otp;
//             // }, 600000); 

//             res.render('otpValidation',{ fname, lname, email, mobile, password, referral, message : 'Check Spam mails' })

//         }else{
//             res.render('signup',{message : 'Password not matching'})
//         }


//     } catch (error) {
//         next(error);
//     }
// }

// exports.validateOTP = async(req,res, next) => { 
//     try {
//         const { fname, lname, email, mobile, password } = req.body

//         const userOTP = req.body.OTP
//         const referral = req.body.referral.trim()

//         if(userOTP == req.session.OTP){
//             const sPassword = await securePassword(password)
//             const referralCode = await getReferralCode()


//             let newUserData;
//             if(referral){

//                 const isReferrerExist = await User.findOne({referralCode: referral})
//                 if(isReferrerExist){
//                     let referrerId = isReferrerExist._id;

//                     const walletHistory = {
//                         date: new Date(),
//                         amount: 100,
//                         message: 'Joining Bonus'
//                     }

//                     newUserData = await new User({
//                         fname, lname, email, mobile,
//                         password:sPassword, referralCode,
//                         referredBy: referral, wallet: 100,
//                         walletHistory
//                     }).save();
    
//                     updateWallet(referrerId, 100, 'Refferal Reward')
//                 }

//             }else{

//                 newUserData = await new User({
//                     fname, lname, email, mobile,
//                     password:sPassword, referralCode
//                 }).save();

//             }

//             req.session.userId = newUserData._id;

//             res.redirect('/');
//         }else{
//             console.log('Incorrect OTP');
//             res.render('otpValidation',{ fname, lname, email, mobile, password, referral, message : 'Incorrect OTP' })
//         }
//     } catch (error) {
//         next(error);
//     }
// }

// exports.resendOTP = async(req, res, next) => {
//     try {
//         console.log('in resend otp controller');
//         const { email } = req.body
//         const OTP = req.session.OTP = getOTP()
//         console.log('resending otp '+OTP+' to '+email);
//         setTimeout(() => {
//             req.session.OTP = null; // Or delete req.session.otp;
//             console.log('otp time out');
//         }, 600000); 
//         sendVerifyMail(email, OTP); 

//         res.json({isResend: true})

//     } catch (error) {
//         next(error);
//     }
// }



