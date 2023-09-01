const mongoose = require('mongoose')

const productSchema = new mongoose.Schema ({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    mrp:{
        type:String,
        required:true
    },
    regularPrice:{
        type:String,
        required:true
    },
    stock:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }
})

const Product = mongoose.model('Product',productSchema);
module.exports = Product;