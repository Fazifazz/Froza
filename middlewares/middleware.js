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

exports.uploadCategoryImage = upload.single('photo')

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