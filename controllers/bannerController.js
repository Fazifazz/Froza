const fs = require('fs')
const path = require('path')
const Banner = require('../models/bannerModel');
const catchAsync = require('../utils/catchAsync')



exports.showBannerIndex = catchAsync( async (req,res) => {
    const banners = await Banner.find({})
    res.render('admin/banners/index',{banners})
});

exports.showBannerCreate = catchAsync( async (req,res) => {
    res.render('admin/banners/new')
})

exports.createBanner  = async (req,res) => {
    const { heading ,images} = req.body
    console.log(images);
    const imagesWithPath = images.map(img => '/banners/' + img)
    try{
        const banner = await Banner.create({
            heading,
            images:imagesWithPath
        })
    
        res.redirect('/admin/banners')
    }catch(error) {
        console.log(error.message);
    }
}


exports.showEditBanners = catchAsync (async (req,res) =>{
    const { id }= req.params
    const banners = await Banner.findById(id)
    res.render('admin/banners/edit',{ banners })
})


exports.updateBanner = catchAsync (async (req,res) => {
    const { id } = req.params;
    const { heading } =req.body;
    const banner = await Banner.findByIdAndUpdate(id,{$set:{
        heading
    }},{new:true})

    res.redirect('/admin/banners')
})

exports.updateBannerImages = catchAsync ( async (req,res) => {
    const { id } = req.params;
    const { images } = req.body;
    let imagesWithPath
    if(images.length){
        imagesWithPath = images.map(image => '/banners/' + image)
    }
    const updateBanner = await Banner.findByIdAndUpdate(id, {$push: { images: imagesWithPath }}, { new: true })
    res.redirect(`/admin/banners/${id}/edit`)
})


exports.deleteBanner = catchAsync(async (req,res) => {
    const id  = req.body.id;
    const state = Boolean(req.body.state)
    const banner = await Banner.findByIdAndUpdate(id, {$set:{ is_deleted: state} }, { new: true });
        res.redirect('/admin/banners')
})


exports.destroyBannerImage =  catchAsync ( async (req,res) => {
    const { id } = req.params
    const { image } = req.body
    const banner = await Banner.findByIdAndUpdate(id,{$pull: { images: image}}, {new: true})
    fs.unlink(path.join(__dirname,'../public', image), (err)=>{
        if(err)console.log(err);
    })
    res.redirect(`/admin/banners/${id}/edit`)
})