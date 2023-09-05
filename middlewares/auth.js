const User = require('../models/userModel')
const admin =require('../models/adminModel')


exports.isUserLoggedIn = (req, res, next) => {
    try {

        if(!req.session.user){
            return res.redirect('/login')
        }
        next();

    } catch (error) {
        next(error)
    }
}

exports.isUserLoggedOut = async(req, res, next) => {
    try {

        if(req.session.user){
            return res.redirect('/')
        }
        next();

    } catch (error) {
        next(error)
    }
}



exports.isAdminLoggedOut = (req, res, next) => {
    
        if(!req.session.admin){
            next();
        }
        else{
            res.redirect('/admin/dashboard')
        }
        
} 

exports.isAdminLoggedIn = async(req, res, next) => {
  
        if(req.session.admin){
            next();
        }else{
          res.redirect('/admin/login')
        }
   
}