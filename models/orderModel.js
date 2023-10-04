const mongoose = require('mongoose');

// Define the schema for the Order
const orderSchema = new mongoose.Schema({
    orderId :{
        type:String,
        unique:true,
    },
    transactionId:{
        type:String,
        unique:true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            totalAmount:Number
        },
    ],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveredOn: {
        type:Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing','Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
        required:true
    },
    isRefunded: {
        type:Boolean,
        default:false
    },
    deliveryAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    cancelledOn: {
        type: Date
    },
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
