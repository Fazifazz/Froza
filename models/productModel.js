const mongoose = require('mongoose')

const productSchema = new mongoose.Schema ({
    title:{
        type:String,
        required:true,
    },
    brand: {
        type: String,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    size: {
        type: Array,
    },
    stock:{
        type:Number,
        required:true   
    },
    images:{
        type:[String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers'
    },
    offerPrice: { 
        type: Number,
        default:0
    },
    categoryOfferPrice: {
        type:Number,
        default:0
    }
    
})

const Product = mongoose.model('Product',productSchema);
module.exports = Product;