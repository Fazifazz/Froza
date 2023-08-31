const User = require("../models/userModel")

module.exports = async (req, res, next) => {
    const user = await User.findById(req.user)
    if (user.isVerified) {
        next()
    } else {
        res.redirect('/verifyotp')
    }
}