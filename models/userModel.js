const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
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
    profile:{
        type:String,
        default:'avatar.png'
    },
    cart:[
        {
           product:{
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Product',
           },
           quantity:{
               type : Number,
               default: 1
           },
           total:{
              type:Number,
              default:0
           }
        }
    ],
    totalCartAmount:{
        type:Number,
        default:0
    },
    address: [{
        address:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Address'
        }
    }],
    defaultAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
       
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
        createdAt:{type:Date,expires:'2m',default:Date.now}
    },
    referralCode:{
        type: String,
        required : true,
        unique : true
    },
    referredBy:{
        type: String,
        readOnly: true
    },
},
{
    timestamps:true,
})

module.exports = mongoose.model('User',userSchema);
