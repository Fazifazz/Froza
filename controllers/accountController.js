const User =require('../models/userModel')
const Address=require('../models/addressModel')

//profile
exports.showProfile=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        res.render('users/account/profile',{user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}



exports.showAddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user)
        const addresses=await Address.find({userId:req.session.user})
        res.render('users/account/address',{addresses,user})
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


exports.showAddaddress=async (req,res)=>{
    try {
        const user=await User.findById(req.session.user) 
        res.render('users/account/addAddress',{user})
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
        const user=await User.findById(req.session.user)
        const address=await Address.findById(req.params.id)
        res.render('users/account/editAddress',{address,user})
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


exports.deleteAddress=async (req,res)=>{
    try {
        await Address.deleteOne({_id:req.params.id});
        res.redirect('/profile/address')
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}


