const User =require('../models/userModel')
const Address=require('../models/addressModel')
const catchAsync = require('../utils/catchAsync')
const crypto = require('crypto')
const Razorpay = require('razorpay')


var razorpay = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


//profile
exports.showProfile=async (req,res)=>{
    try {
      const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
        res.render('users/account/profile',{userExist,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showAddress=async (req,res)=>{
    try {
      const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
        const addresses=await Address.find({userId:req.session.user})
        res.render('users/account/address',{addresses,user,userExist})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showAddaddress=async (req,res)=>{
    try {
      const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
        res.render('users/account/addAddress',{userExist,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.addAddress=async (req,res)=>{
    try {
        const address =await Address.create({
            userId:req.session.user,
            name:req.body.name,
            pincode: req.body.pincode,
            district:req.body.district,
            locality:req.body.locality,
            address:req.body.address,
            phone:req.body.phone,
            alternativePhoneNumber:req.body.altNo,
            landMark:req.body.landMark,
            state:req.body.state
    })
    const user = await User.findById({_id:address.userId})
    user.address.push(address._id);
    user.save();
    res.redirect("/profile/address")
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.showEditaddress=async (req,res)=>{
    try {
      const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
        const address=await Address.findById(req.params.id)
        res.render('users/account/editAddress',{address,userExist,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.editAddress=async (req,res)=>{
    try {
        const updatedAddress = {
            name:req.body.name,
            pincode: req.body.pincode,
            district:req.body.district,
            locality:req.body.locality,
            address:req.body.address,
            phone:req.body.phone,
            alternativePhoneNumber:req.body.altNo,
            landMark:req.body.landMark,
            state:req.body.state
        }
        await Address.updateOne({_id:req.params.id},updatedAddress);
        res.redirect('/profile/address');
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

exports.setDefaultAddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const userAddresses=await Address.find({userId:user._id})
        let newDefault
        const oldDefault=await Address.findOne({defaultAddress:true})
        if(!oldDefault){
            newDefault=await Address.findByIdAndUpdate({_id:req.body.id},{defaultAddress:true},{new:true})
        }else{
            await Address.updateOne({defaultAddress:true},{defaultAddress:false})
            newDefault=await Address.findByIdAndUpdate({_id:req.body.id},{defaultAddress:true},{new:true})
        }
        user.defaultAddress=newDefault._id
        await user.save()
        res.redirect('/profile/address')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.deleteAddress=async (req,res)=>{
    try {
        await Address.findOneAndUpdate({_id:req.params.id},{is_deleted:true})
        res.redirect('/profile/address')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showWalletIndex  = catchAsync(async (req,res) => {
    const userId = req.session.user
    const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:userId})  
      }
    const walletHistory = user.walletHistory
    res.render('users/account/myWallet',{userExist,user,walletHistory,error:req.flash('error'),success:req.flash('success'), key_id : process.env.KEY_ID})
  })


  exports.addMoneyToWallet = async (req, res, next) => {
    try {
      console.log("adding money to wallet");
      const { amount } = req.body;
      console.log(amount);
      const id = crypto.randomBytes(8).toString("hex");
  
      var options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "hello" + id,
      };
  
      razorpay.orders.create(options, (err, order) => {
        if (err) {
          res.json({ status: false });
        } else {
          res.json({ status: true, payment: order ,key_id:process.env.KEY_ID});
        }
      });
    } catch (error) {
      next(error);
    }
  };


  exports.verifyWalletPayment = async (req, res, next) => {
    try {
      const userId = req.session.user;
      const details = req.body;
      const amount = parseInt(details["order[amount]"]) / 100;
      let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
  
      hmac.update(
        details["response[razorpay_order_id]"] +
          "|" +
          details["response[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac === details["response[razorpay_signature]"]) {
        console.log("order verified updating wallet");
  
        const walletHistory = {
          date: new Date(),
          amount,
          message: "Deposited via Razorpay",
        };
  
        await User.findByIdAndUpdate(
          { _id: userId },
          {
            $inc: {
              wallet: amount,
            },
            $push: {
              walletHistory,
            },
          }
        );
  
        res.json({ status: true });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      next(next);
    }
  };