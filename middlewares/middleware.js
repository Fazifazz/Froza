
const multer = require('multer');
const sharp =  require('sharp')
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


//products
exports.uploadProductImages = upload.fields([
  {
    name: 'images',
    maxCount: 3
  }
])

exports.resizeProductImages = async (req, res, next) => {
  if(!req.files.images) return next();
  req.body.images = []
  await Promise.all(
    req.files.images.map(async(file) => {
      const filename = `products-${v4()}.jpeg`
      await sharp(file.buffer)
        .resize(640,640)//640
        .toFormat('jpeg')
        .jpeg( { quality:90 } )
        .toFile(path.join(__dirname, '../public', 'products', filename))

        req.body.images.push(filename)
    })
  )
  next()
}
//category
exports.uploadCategoryImage = upload.single('photo')

exports.resizeCategoryImage = async(req, res, next) => {
  try {
         if(!req.file) return next();
         req.file.originalname = 'category-' + v4() + '-' + '.png'
         req.body.photo = req.file.originalname
         await sharp(req.file.buffer)
         .resize(500,500) //
         .toFormat('png') 
         .png({ quality: 90 })
         .toFile(path.join(__dirname, '../public', 'category', req.file.originalname));
    
         next();
    
   } catch (error) {
       console.log(error.message)
   }

}

  