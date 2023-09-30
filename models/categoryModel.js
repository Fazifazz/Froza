const mongoose = require ('mongoose')

const categorySchema = new  mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image: {
        type: String,
    },
    is_deleted: {
        type:Boolean,
        default:false
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers'
    },
}) 


const Category = mongoose.model('Category',categorySchema);
module.exports = Category;