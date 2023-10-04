const Order = require('../models/orderModel')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const crypto = require('crypto')
const Razorpay = require('razorpay')


var razorpay = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


exports.placeOrder = async (req,res)=>{
  const user = await User.findById(req.session.user)
  if(!req.body.paymentOptions){
    req.flash('error','Please choose a payment method');
    return res.redirect('/checkout')
 }

 if(!user.defaultAddress){
  req.flash('error','Please add an address');
  return res.redirect('/checkout')
 }
 
 if(req.body.orderTotal>0){
  const coupon = await Coupon.findOne({code:req.session.couponCode}) 
      const usedUser = coupon.usedUsers.find((item) => item.usedUser.toString() === user._id.toString() );
      if(usedUser){
        usedUser.usedCount += 1;
        await coupon.save();
      } else {
        coupon.usedUsers.push({ usedUser: user._id, usedCount: 1 });
        await coupon.save();
      }

      user.totalCartAmount = req.body.orderTotal
      await user.save()
 }


 const paymentMethod= req.body.paymentOptions
  if(paymentMethod === 'wallet'){

     const orderId = crypto.randomUUID();
     const order = await Order.create({
        orderId,
        customer:user._id,
        products:user.cart,
        totalPrice : user.totalCartAmount,
        deliveryAddress:user.defaultAddress,
        paymentMethod: 'wallet'
    });
    const orderPrice = order.totalPrice;
    const wallet = user.wallet;
    const currentWallet = wallet - orderPrice
    const walletHistory = {
     date: new Date(),
     amount:orderPrice,
     message: "ordered via Wallet",
    };
    if(orderPrice>wallet){
      req.flash('error','Insufficient Balance in your Wallet')
      return res.redirect('/checkout')
    }
    await User.updateOne({_id:user._id},{$set:{cart:[],totalCartAmount:0,wallet:currentWallet,is_deducted:true},$push:{walletHistory}})
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
      res.redirect('/orderSuccess')  
  }
  if(paymentMethod === 'cod'){
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
    res.redirect('/orderSuccess')
  }

  if(paymentMethod === 'razorpay'){
    try {
      const totalCartAmount = user.totalCartAmount * 100

      const options = {
        amount: totalCartAmount, // Amount in paise
        currency: 'INR',
        receipt: crypto.randomBytes(4).toString('hex'),
      }
       
      const order = await razorpay.orders.create(options);
       
      return res.render('users/razorpay-checkout', { order, key_id: process.env.KEY_ID,user });

    } catch (error) {
      console.error('Razorpay error:', err);
      req.flash('error', 'Razorpay payment failed. Please try again.');
      return res.redirect('/checkout');
    }
  } 
}

exports.createOrder = catchAsync(async(req,res) => {

  const user = await User.findById(req.session.user)
  const totalCartAmount = user.totalCartAmount * 100
  
  const newOrder = new Order({
    customer:user._id,
    orderId: req.query.orderId,
    transactionId:req.query.transactionId,
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
        orderId:req.query.orderId
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
  res.redirect('/orderSuccess')
})


exports.showCheckout = catchAsync(async (req,res) => {
    const userId = req.session.user;
    const userExist = Boolean(req.session.user)
    if(userExist){
      var user = await User.findById({_id:userId}).populate('cart.product') 
    }                     
    if(user.cart.length){
      const defAddress=await Address.findById(user.defaultAddress)
      const addresses = await Address.find({userId:req.session.user, defaultAddress:false, softDeleted:false})
        const cart = user.cart;
        const totalCartAmount=user.totalCartAmount
        const coupons= await Coupon.find({
          $and:[
          {expiryDate:{$gt:Date.now()}},
          { isCancelled:false }
          ]
        })       
         res.render('users/checkout',{userExist,user,cart,totalCartAmount,defAddress,addresses,error:req.flash('error'),coupons})
    }else{
        res.redirect('/cart')
    }
  })

  exports.showOrdersIndex = catchAsync(async (req,res) => {
    const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
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
      userExist,user,orders:myOrders,success:req.flash('success')
  }); 

})

exports.salesReport=async (req,res)=>{
  try {
    let neededFilter;
    if(req.body.startDate && req.body.endDate){
      let startDate =req.body.startDate
      let endDate= req.body.endDate
     
      const sales = await Order.find({
        status:'Delivered',
        orderDate:{ $gte:new Date(`${startDate}T00:00:00.000Z`), $lte:new Date(`${endDate}T23:59:59.999Z`) }
      })

       console.log(sales)
       console.log('start', startDate)
       console.log('end', endDate)
       if(sales.length ===0){
          req.flash('error','no reports found')
          return res.redirect('/admin/salesReport')
       }else{
         neededFilter = { status:'Delivered', orderDate:{ $gte:new Date(`${startDate}T00:00:00.000Z`), $lte:new Date(`${endDate}T23:59:59.999Z`) }  }
       }
    }else{
      neededFilter = { status:'Delivered' }
    }  
    
    const allOrders=await Order.aggregate([
          {
            $match:neededFilter
              
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
        
      ])

    console.log(allOrders)  
    res.render('Admin/orders/salesReport',{orders:allOrders, error:req.flash('error')})
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}


exports.orderDetails=async (req,res)=>{
  try {
    const userExist = Boolean(req.session.user)
    if(userExist){
      var user = await User.findById({_id:req.session.user})  
    }
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
        res.render('users/account/orderDetails',{userExist,user,details:orderDetails})
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
  const userExist = Boolean(req.session.user)
      if(userExist){
        var user = await User.findById({_id:req.session.user})  
      }
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
res.render('admin/orders/index',{userExist,user,orders,success:req.flash('success')});
})

exports.destroyOrder = async (req, res) => {
  try {
    // Find the order by orderId and update its status to 'Cancelled'
    await Order.findOneAndUpdate({ orderId: req.body.orderId }, { $set: { status: 'Cancelled' } });
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
   let productId=orderDetails[i].products.product[0]._id
   let orderQuantity = orderDetails[i].products.quantity
   let product = await Product.findById(productId)
   let stock=product.stock
   let newStock = stock + orderQuantity
   await Product.updateOne({_id:productId}, {$set:{stock:newStock}})
 }

    const user = await User.findById({ _id: req.session.user });
    const order = await Order.findOne({ orderId: req.body.orderId }); // Use findOne with orderId
         //for wallet payment
    if (order.paymentMethod === 'wallet') {
      const wallet = user.wallet;
      const refundWallet = order.totalPrice;
      const walletHistory = {
        date: new Date(),
        amount: refundWallet,
        message: 'Refunded via Wallet',
      };

      // add the refunded amount from the user's wallet and add it to walletHistory
      await User.findByIdAndUpdate(
        { _id: req.session.user },
        {
          $inc: {
            wallet: refundWallet,
          },
          $push: {
            walletHistory,
          },
          $set: { is_credited: true }
        }
      );

      // Update the order with walletHistory
      await Order.findOneAndUpdate(
        { orderId: req.body.orderId },
        {
          $push: {
            walletHistory,
          },
        }
      );
    }

    req.flash('success', 'Order cancelled successfully');
    res.redirect('/showOrders');
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


exports.updateOrderStatus = catchAsync(async(req,res) => {
  const status = req.body.status;
  const orderId = req.body.orderId
  if(status==='Delivered'){
    await Order.findOneAndUpdate({_id:orderId},{$set:{status:status,deliveredOn:Date.now()}});
    return res.redirect('/admin/orders')
  }
  await Order.findOneAndUpdate({_id:orderId},{$set:{status:status}});
  res.redirect('/admin/orders');
})


exports.refundOrder = catchAsync (async (req,res) =>{
  const user = await User.findById({_id:req.session.user})
  const orderId = req.body.orderId
  const order = await Order.findOne({orderId:orderId})
  const refundPrice = order.totalPrice;
  const wallet = user.wallet;
  const walletHistory = {
    date: new Date(),
    amount:refundPrice,
    message: "Refunded via Razorpay",
  };
  await User.findByIdAndUpdate(
    { _id: req.session.user},
    {
      $inc: {
        wallet: refundPrice,
      },
      $push: {
        walletHistory,
      },
      $set: { is_credited: true }
    }
  );
  await Order.findOneAndUpdate({orderId:orderId},{$set:{isRefunded:true}})
  req.flash('success',` ${refundPrice}/-rupees is refunded to your Wallet`)
  res.redirect('/showOrders')
})


exports.showOrderSuccess  = catchAsync(async (req,res) => {
  res.render('users/orderSuccess')
})


exports.loadInvoice = async (req,res)=>{
  try {
    const order=await Order.find({orderId:req.body.orderId})

    const orderDetails = await Order.aggregate([
      {
          $match:{
            orderId:req.body.orderId
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
    
    res.render('users/invoice',{Details:orderDetails})
  } catch (error) {
    console.log(error.message)
    res.status(500).send('Internal Server Error');
  }
}
      







