const mongoose = require('mongoose')

const bannerSchema =new  mongoose.Schema({
    heading:{
        type: String,
        required: true
        // unique: true
    },
    images:{
        type: [String],
        required: true
    },
    is_deleted:{
        type:Boolean,
        default:true,
    },
    url:{
        type: String,
        default: "/shop ",
        required : true
    }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
