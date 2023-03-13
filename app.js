/* eslint-disable prettier/prettier */
// NPM Packages 
const path = require('path');
const express = require('express');
const morgan = require('morgan'); // MIDDLEWARE 3 PARTY 
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize= require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieparser = require('cookie-parser');
const compression = require('compression');

// OWN Handlerers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// ROUTERS 
const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouters');
const viewRouter = require('./routes/viewRouters');
const bookingRouter = require('./routes/bookingRouts');

// Start express APP! 

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1 ) GLOBAL MIDDLEWARES
//     Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//  Set security HTTP headers
// app.use(helmet());

// Development logging 
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit request from same API (IP)
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, 
    message: 'To many request from this IP, pelase try agan later!'
});
app.use('/api', limiter);

// FUNCTION THAT MODIFY THE INCOMING REQUEST DATa (CALLED MIDDLEWARE, stay middle the request and the data)
// Bod parser, reading data form body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieparser());
// Data sanatasitaion against  NsQL query injection
app.use(mongoSanitize());

// Data sanatasitaion against XSS
app.use(xss());

// prevent parameter pollution
app.use(hpp( {
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// GET STATIC URL from Public folder
app.use(express.static(`${__dirname}/public`));


app.use(compression());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();    
    //console.log(req.cookies);
    
    next();
});

// 3) ROUTERS

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});



app.use(globalErrorHandler);


module.exports = app;

// npm install eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-jsx-a11y eslint-plugin-react-hooks eslint-plugin-node eslint-plugin-import  eslint-plugin-react eslint-config-airbnb --save-dev
