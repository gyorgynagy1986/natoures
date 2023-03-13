/* eslint-disable prettier/prettier */

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError')


exports.getOverview = catchAsync( async (req, res, next) => {

  // 1) Get all the tour date from collection
   const tours = await Tour.find();
 
  

   //3) Rendered the template using the tour data 
    res.status(200).render('newmainpage', {
        title: 'All tours',
        tours
         
    });
});

exports.getTour = catchAsync( async (req, res, next) => {

    // 1) Get all the tour date from collection
     const tour = await Tour.findOne({slug: req.params.slug}).populate({
         path: 'reviews',
         fields: 'review rating user'
     })
     
     if(!tour) {
       return next(new appError('There is no tour with this name', 404))
     }

    //2 ) Bild the template 
  
    //3) Rendered the template using the tour data 
  
      res.status(200).render('tour', {
          title: `${tour.name} Tour`,
          tour
          
      });
  });


  
exports.getLoginForm =  (req, res) => {

      res.status(200).render('login', {
        title: 'log into your account'
      });
  };

  
  
exports.getSignupForm =  (req, res, next) => {

    if (req.cookies.jwt) {
      return next (new appError('You are already logeed in :) ', 404))
    } 

    res.status(200).render('signup', {
      title: 'Create your very first account'
    });

};


//Create a new tour

exports.createANewTour =  (req, res, ) => {


  res.status(200).render('createANewTour', {
    title: 'Create a New TOUR'
  });
};

// UPDATE A TOUR

exports.updateATour = catchAsync( async (req, res, next) => {

  // 1) Get all the tour date from collection
   const tour = await Tour.findById(req.params.id);

   if(!tour) {
    return next(new appError('There is no tour with this id', 404))
  }
 
   //3) Rendered the template using the tour data 
   res.status(200).render('updateAtour', {
    title: `Update`,
    tour  
  });
});


exports.getAccount =  (req, res, ) => {


    res.status(200).render('account', {
      title: 'Your account'
    });
};

exports.getMyTours = catchAsync (async (req, res, ) => {

  // 1) find all bookings

  const  bookings = await Booking.find({user : req.user.id})

  // 2) Find tours with the retun ID-s

  const tourIDs = bookings.map(el => el.tour);
  
  const tours = await Tour.find({ _id: { $in: tourIDs } })

  res.status(200).render('newmainpage', {
    title: 'My bokkings',
    tours
  });

});


exports.updateUserData = catchAsync ( async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name,
      email: req.body.email
    },
    {
      new:true,
      runValidators:true
    }
    );
      res.status(200).render('account', {
        user: updatedUser   
      });
});


//GET ALL TOURS AT ADMIN DASH

exports.getAlltours = catchAsync( async (req, res, next) => {

  // 1) Get all the tour date from collection
   const tour = await Tour.find();
 
  

   //3) Rendered the template using the tour data 
    res.status(200).render('adminAllTours', {
        title: 'All tours for admins',
        tour
         
    });
});


exports.getAllreview = catchAsync( async (req, res, next) => {

  // 1) Get all the tour date from collection
   const review = await Review.find();
 

   //3) Rendered the template using the tour data 
    res.status(200).render('adminAllReviews', {
        title: 'All tours for admins',
        review
         
    });
});