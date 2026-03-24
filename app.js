
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catwaysRouter = require('./routes/catways');
var dashbordRouter = require('./routes/dashbord');
var documentationRouter = require('./routes/documentation');
var reservationRouter = require('./routes/reservations')
const mongodb = require('./db/mongo');
const authMiddleware = require('./middleware/auth')
mongodb.initClientDbConnection();
var app = express();

// view engine setup

app.use(cors());
app.use(cors({
    origin: '*', // allow all (dev only)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users',  usersRouter);
app.use('/catways', authMiddleware, catwaysRouter);
app.use('/dashboard',authMiddleware, dashbordRouter);
app.use('/documentation', documentationRouter);
app.use('/reservations', reservationRouter);
app.get('/logout', async(req, res) => {
  res.clearCookie('token');
  res.redirect('/');
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
});

module.exports = app;
