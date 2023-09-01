const multer = require('multer');
const sharp =  require('sharp')
const catchAsync = require('../utils/catchAsync')
const path = require('path')
const { v4 } = require('uuid')

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null, true);
  }else{
    cb(err,false)
  }
}

const upload = multer({ storage, fileFilter })

const productStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public', 'products/'))
  },

  filename: function(req, file, cb) {
    cb(null, `product-${v4()}-${file.originalname}`);
  }
})

const productUpload = multer({ storage: productStorage })

exports.uploadCategoryImage = upload.single('photo')

exports.uploadProductImages = productUpload.array('photo', 3)
// exports.uploadProductImages = upload.fields([
//   {name:'photo',maxCount:4}
// ])

// exports.resizeProductImage = catchAsync(async(req, res, next) => {

//   if(!req.file) return next();
//   req.file.originalname = 'products-' + v4() + '-' + '.png'
//   req.body.photos = []
//   await Promise.all(
//     req.files.photos.map(file => {
//       const filename = `product-${v4()}.jpeg`

//       awaiot 
//     })
//   )
//   await sharp(req.file.buffer)
//   .resize(500, 500)
//   .toFormat('png') 
//   .png({ quality: 90 })
//   .toFile(path.join(__dirname, '../public', 'products', req.file.originalname));
  
//   next();
// })


exports.resizeCategoryImage = catchAsync(async(req, res, next) => {

  if(!req.file) return next();
  req.file.originalname = 'category-' + v4() + '-' + '.png'
  req.body.photo = req.file.originalname
  await sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('png') 
  .png({ quality: 90 })
  .toFile(path.join(__dirname, '../public', 'category', req.file.originalname));
  
  next();
})