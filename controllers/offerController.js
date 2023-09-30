const mongoose = require('mongoose')
const Order = require('../models/orderModel')
const User = require('../models/userModel')
const  Address = require('../models/addressModel')
const  Coupon = require('../models/couponModel')
const crypto = require('crypto')
const Offer = require('../models/offerModel')
const catchAsync = require('../utils/catchAsync')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')


exports.showOfferIndex = catchAsync(async (req,res) =>{
    const offers = await Offer.find({})
    res.render('admin/offers/index',{offers})
})

exports.showAddOffer = catchAsync (async (req,res) => {
    res.render('admin/offers/new',{error:req.flash('error')})
})

exports.addOffer = catchAsync (async (req,res) =>{
    const { discount,startingDate,expiryDate } =  req.body
     const offerName = req.body.offerName.toUpperCase()
    isOfferExists = await Offer.findOne({name:offerName})

        if(isOfferExists){
            req.flash('error','name already exists')
            return res.redirect('/admin/offers/create')
        }

        
        if(new Date(startingDate) >= new Date(expiryDate) || new Date(expiryDate) < new Date() ){
            req.flash('error','date selection is not valid')
            return res.redirect('/admin/offers/create')
        }

        let status;
        if(new Date(startingDate) <= new Date()){
            status = 'Available'
        }else if(new Date(startingDate) > new Date()){
            status = 'Starting Soon'
        }

     const offer = await Offer.create({
        name: offerName,
        discount,
        startingDate,
        expiryDate,
        status 
    })
    await offer.save()
    res.redirect('/admin/offers')
})

exports.showOfferEdit = catchAsync (async (req,res) => {
    const { id }  = req.params
    const offer = await Offer.findById(id)
    res.render('admin/offers/edit',{offer,error:req.flash('error')})
})

exports.updateOffer = catchAsync (async (req,res) => {
    const { id } = req.params
    const { discount,startingDate,expiryDate  } =  req.body
    const offerName = req.body.offerName.toUpperCase()
    const previousOffer = await Offer.findById(id)
    const isOfferExists = await Offer.findOne({ name:{$ne:previousOffer.name, $regex: new RegExp('^' + offerName + '$', 'i') } });
    if(isOfferExists){
        // if(!is){
            req.flash('error','name already exists')
            return res.redirect(`/admin/offers/edit/${id}`)
        // }
    }

    if(new Date(startingDate) >= new Date(expiryDate) || new Date(expiryDate) < new Date() ){
        req.flash('error','date selection is not valid')
        return res.redirect(`/admin/offers/edit/${id}`)
    }

    let status;
    if(new Date(startingDate) <= new Date()){
        status = 'Available'
    }else if(new Date(startingDate) > new Date()){
        status = 'Starting Soon'
    }

    const offerExistingProducts = await Product.find({offer:id})
        if(offerExistingProducts){
            for(let i=0;i<offerExistingProducts.length;i++){
                let price =offerExistingProducts[i].regularPrice
                let offerPrice = offerExistingProducts[i].offerPrice

                offerPrice = (discount/100) * price
                offerPrice = Math.ceil(price-offerPrice)
                offerExistingProducts[i].offerPrice = offerPrice
                await offerExistingProducts[i].save()
            }
        }
        const offerExistingCategories = await Category.find({offer:id})
        console.log(offerExistingCategories)
        if(offerExistingCategories.length > 0){
            for(let i=0;i<offerExistingCategories.length;i++){
                let category = await Category.findById(offerExistingCategories[i]._id)
                let catProducts = await Product.find({category:category._id})
                if(catProducts.length > 0){
                 for(let j=0;j<catProducts.length;j++){
                    let price = catProducts[j].regularPrice
                    let categoryOfferPrice = catProducts[j].categoryOfferPrice

                    categoryOfferPrice = (discount/100) * price
                    categoryOfferPrice = Math.ceil(price - categoryOfferPrice)
                    catProducts[j].categoryOfferPrice = categoryOfferPrice
                    await catProducts[j].save()
                 }
                }
            }
        }
    
    const offer = await Offer.findByIdAndUpdate(id,{$set:{
        name: offerName,
        discount,
        startingDate,
        expiryDate,
        status
    }},{new:true})

    res.redirect('/admin/offers')
})

exports.destroyOffer = catchAsync(async (req,res) => {
    const id = req.body.id
    const state = Boolean(req.body.state)
    if(state === true){
        const offerExistingProducts = await Product.find({offer:id})
            if(offerExistingProducts){
                for(let i=0;i<offerExistingProducts.length;i++){
                    offerExistingProducts[i].offerPrice = 0
                    offerExistingProducts[i].offer  = null  
                    await offerExistingProducts[i].save()
                }
            }
            const offerExistingCategories = await Category.find({offer:id})
        if(offerExistingCategories){
            for(let i=0;i<offerExistingCategories.length;i++){
                let category = await Category.findById(offerExistingCategories[i]._id)
                category.offer = null
                await category.save()

                let catProducts = await Product.find({category:category._id})
                if(catProducts.length > 0){
                  for(let j=0;j<catProducts.length;j++){
                    catProducts[j].categoryOfferPrice = 0
                    await catProducts[j].save()
                  }
                }
                
            }
        }
    }
    const offer  = await Offer.findByIdAndUpdate(id,{$set:{ is_deleted:state}},{new:true})
    res.redirect('/admin/offers')
})