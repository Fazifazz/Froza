const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const Address = require('../models/addressModel')
const crypto = require('crypto')


exports.showCheckout = catchAsync(async (req,res) => {
    const userId = req.session.user;
    const user = await User.findById(userId).populate('cart.product')
    if(user.cart.length){
        const addresses=await Address.find({userId:req.session.user})
        const cart = user.cart;
        const totalCartAmount=user.totalCartAmount
        res.render('users/checkout',{cart,totalCartAmount,addresses})
    }else{
        res.redirect('/cart')
    }
  })


  exports.verifyCheckOut = catchAsync(async (req,res) => {
     if(!req.body.paymentOptions){
        req.flash('error','Please choose a payment method');
        return res.redirect('/checkout')
     }
     const user = await User.findById(req.session.user)
     const orderId = crypto.randomUUID();
     const order = await Order.create({
        orderId,
        customer:user._id,
        products:user.cart,
        totalPrice : user.totalCartAmount,
        deliveryAddress:user.defaultAddress,
        paymentMethod: req.body.paymentOptions
    });
    await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0}})
    res.redirect('/showOrders')
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
      user,orders:myOrders
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
      // console.log(orderDetails)
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

exports.destroyOrder = catchAsync(async (req,res) =>{
  const user = await User.findById(req.session.user);
  const orderId = req.body.orderId
  await Order.deleteOne({orderId:orderId})
  res.redirect('/showOrders')
})


exports.updateOrderStatus = catchAsync(async(req,res) => {
  const status = req.body.status;
  const orderId = req.body.orderId
  const updated = await Order.findOneAndUpdate({orderId:orderId},{$set:{status:status}});
  res.redirect('/admin/orders');
})