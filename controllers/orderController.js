const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Product = require('../models/productModel')
const crypto = require('crypto')
const Razorpay = require('razorpay')


var razorpay = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

exports.placeOrder = async (req,res)=>{
  if(!req.body.paymentOptions){
    req.flash('error','Please choose a payment method');
    return res.redirect('/checkout')
 }
  
 const paymentMethod= req.body.paymentOptions
  if(paymentMethod === 'cod'){
    const user = await User.findById(req.session.user)
     if(!user.defaultAddress){
      req.flash('error','Please add an address');
      return res.redirect('/checkout')
     }
     const orderId = crypto.randomUUID();
     const order = await Order.create({
        orderId,
        customer:user._id,
        products:user.cart,
        totalPrice : user.totalCartAmount,
        deliveryAddress:user.defaultAddress,
        paymentMethod: 'cod'
    });
    await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0,}})

          //stock managment
    const orderDetails = await Order.aggregate([
      {
          $match:{
            orderId:orderId
          }
      },
      {
          $unwind:'$products'
      },
      {
        $lookup: {
          from: "products", 
          localField: "products.product", 
          foreignField: "_id", 
          as: "products.product" 
        }
      },
    ]);

        for(let i=0;i<orderDetails.length;i++){
          const productId = orderDetails[i].products.product[0]._id
          const productStock = orderDetails[i].products.product[0].stock
          const orderQuantity  = orderDetails[i].products.quantity
          const newStock = productStock - orderQuantity
          await Product.updateOne({_id:productId},{$set:{stock:newStock}})
        }

    req.flash('success','order placed Successfully')
    res.redirect('/showOrders')
  }

  if(paymentMethod === 'razorpay'){
    try {
      const user = await User.findById(req.session.user)
      const cart = user.cart
      const totalCartAmount = user.totalCartAmount * 100

      const options = {
        amount: totalCartAmount, // Amount in paise
        currency: 'INR',
        receipt: crypto.randomBytes(4).toString('hex'),
      }
       
      const order = await razorpay.orders.create(options);
      const newOrder = new Order({
        customer:user._id,
        orderId: order.id,
        paymentMethod: 'Razorpay',
        totalPrice:totalCartAmount/100,
        deliveryAddress:user.defaultAddress,
        products:user.cart
      });

      await newOrder.save()
            //stock managment
    const orderDetails = await Order.aggregate([
      {
          $match:{
            orderId:order.id
          }
      },
      {
          $unwind:'$products'
      },
      {
        $lookup: {
          from: "products", 
          localField: "products.product", 
          foreignField: "_id", 
          as: "products.product" 
        }
      },
    ]);

        for(let i=0;i<orderDetails.length;i++){
          const productId = orderDetails[i].products.product[0]._id
          const productStock = orderDetails[i].products.product[0].stock
          const orderQuantity  = orderDetails[i].products.quantity
          const newStock = productStock - orderQuantity
          await Product.updateOne({_id:productId},{$set:{stock:newStock}})
        }
      await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
       
      return res.render('users/razorpay-checkout', { order, key_id: process.env.KEY_ID,user });

    } catch (error) {
      console.error('Razorpay error:', err);
      req.flash('error', 'Razorpay payment failed. Please try again.');
      return res.redirect('/checkout');
    }
  } 
}


exports.showCheckout = catchAsync(async (req,res) => {
    const userId = req.session.user;
    const user = await User.findById(userId).populate('cart.product')
    if(user.cart.length){
        const addresses=await Address.find({userId:req.session.user})
        const cart = user.cart;
        const totalCartAmount=user.totalCartAmount
        res.render('users/checkout',{cart,totalCartAmount,addresses,error:req.flash('error')})
    }else{
        res.redirect('/cart')
    }
  })

  exports.showOrdersIndex = catchAsync(async (req,res) => {
    const user = await User.findById(req.session.user)
    const myOrders = await Order.aggregate([
      {
          $match:{
            customer: user._id
          }
      },
      {
        $sort: { orderDate: -1 }
      },
      {
        $lookup: {
          from: "products", 
          localField: "products.product", 
          foreignField: "_id", 
          as: "products.product" 
        }
      },
      {
        $lookup: {
          from: "addresses", 
          localField: "deliveryAddress", 
          foreignField: "_id", 
          as: "deliveryAddress" 
        }
      }
    ]);
  res.render('users/account/orders',{
      user,orders:myOrders,success:req.flash('success')
  }); 

})
exports.orderDetails=async (req,res)=>{
  try {
      const user=await User.findById(req.session.user)
      let orderid;
      if(req.body.orderId){
        orderid=req.body.orderId
      }else if(req.params.id){
        orderid=req.params.id
      }

      const orderDetails = await Order.aggregate([
          {
              $match:{
                orderId:orderid
              }
          },
          {
            $sort: { orderDate: -1 }
          },
          {
              $unwind:'$products'
          },
          {
            $lookup: {
              from: "products", 
              localField: "products.product", 
              foreignField: "_id", 
              as: "products.product" 
            }
          },
          {
            $lookup: {
              from: "addresses", 
              localField: "deliveryAddress", 
              foreignField: "_id", 
              as: "deliveryAddress" 
            }
          }
        ]);

      if(req.body.orderId){
        res.render('users/account/orderDetails',{user,details:orderDetails})
      }
      else if(req.params.id){
        res.render('Admin/orders/orderDetails',{details:orderDetails})
      }

  } catch (error) {
      console.log(error.message)
      res.status(500).send('Internal Server Error');
  }
}

exports.getOrderList =  catchAsync(async (req,res) => {
  const orders = await Order.aggregate([
    {$sort:{orderDate:-1}},
    {
      $lookup: {
        from: "products", 
        localField: "products.product", 
        foreignField: "_id", 
        as: "products.product" 
      }
    },
    {
      $lookup: {
        from: "addresses", 
        localField: "deliveryAddress", 
        foreignField: "_id", 
        as: "deliveryAddress" 
      }
    },
  ]);

// orders.forEach((order)=>{
//     order.deliveryAddress.userId = undefined
//     order.deliveryAddress._id = undefined,
//     order.deliveryAddress[0]._id = undefined
// })
res.render('admin/orders/index',{orders});
})

exports.destroyOrder=async (req,res)=>{
  try {
    await Order.findOneAndUpdate({orderId:req.body.orderId}, {$set:{status:'Cancelled'}} )

        //stock management
        const orderDetails = await Order.aggregate([
          {
              $match:{
                orderId:req.body.orderId
              }
          },
          {
              $unwind:'$products'
          },
          {
            $lookup: {
              from: "products", 
              localField: "products.product", 
              foreignField: "_id", 
              as: "products.product" 
            }
          },
        ]);
    
            for(let i=0;i<orderDetails.length;i++){
              const productId = orderDetails[i].products.product[0]._id
              const productStock = orderDetails[i].products.product[0].stock
              const orderQuantity  = orderDetails[i].products.quantity
              const newStock = productStock + orderQuantity
              await Product.updateOne({_id:productId},{$set:{stock:newStock}})
            }
            
    req.flash('success','order cancelled sucessfully')
    res.redirect('/showOrders')
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.updateOrderStatus = catchAsync(async(req,res) => {
  const status = req.body.status;
  const orderId = req.body.orderId
  const updated = await Order.findOneAndUpdate({orderId:orderId},{$set:{status:status}});
  res.redirect('/admin/orders');
})





