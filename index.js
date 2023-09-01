require('dotenv').config()
const express = require('express')
const config = require('./config/db')
const path = require('path')
const session = require('express-session')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const morgan = require('morgan');
const app = express()

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'uhdsguakgdfjsafd',
    resave: false,
    saveUninitialized: true,
}))
app.use(methodOverride('_method'))
app.use(flash())

config.dbConnect()

app.use(function(req, res, next){
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  res.locals.userData = req.flash('data');
  next();
});

app.use('/', require('./routes/userRoutes'))
app.use('/admin', require('./routes/adminRoutes'))


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server running...'))