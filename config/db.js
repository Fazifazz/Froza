const mongoose = require('mongoose')

const dbConnect = () => mongoose.set('strictQuery', true).connect(process.env.MONGO_URI).then(() => console.log('DB Connected')).catch(err => console.log(err))

module.exports = { 
    dbConnect
}