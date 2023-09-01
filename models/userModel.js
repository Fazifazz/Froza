const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required : true
    },
    lname:{
        type:String,
        required : true
    },
    mobile:{
        type:Number,
        required : true
    },
    email:{
        type:String,
        required : true
    },
    dob:{
        type:Date,
        default: new Date('1990-01-01')
    },
    cart:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity:{
            type : Number,
            default: 1
        },
        productPrice:{
            type: Number,
            required : true
        },
        discountPrice:{
            type : Number,
            required : true
        }
    }],
    password:{
        type:String,
        required : true
    },
    isBlocked:{
        type:Boolean,
        default : false
    },
    wallet:{
        type : Number,
        default : 0
    },
    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }
    }],
    wishlist:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    verified: {
        type: Boolean,
        default: false,
    },
    otp:{
        type:Number,
        createdAt:{type:Date,expires:'5m',default:Date.now}
    },
},
{
    timestamps:true,
})

module.exports = mongoose.model('User',userSchema);
