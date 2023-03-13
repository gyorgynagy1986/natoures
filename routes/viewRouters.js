/* eslint-disable prettier/prettier */
const express = require('express');

const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const tourController = require('../controllers/tourController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/signup', viewsController.getSignupForm);


router.use(authController.isLoggedIn);

router.get('/', bookingController.creatBookingCheckout, viewsController.getOverview);
//router.get('/myShoppingList', viewsController.getMyList);

router.get('/tour/:slug',  viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);


router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-bookings', authController.protect, viewsController.getMyTours);

router.get('/team', authController.protect, authController.restrictTo('admin', 'lead-guide'), userController.ourTeam);
router.get('/all-tours', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.getAlltours);
router.get('/all-reviews', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.getAllreview);
router.get('/new-tour', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.createANewTour);
router.get('/updateTour/:id', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.updateATour);




router.post('/submit-user-data', authController.protect, viewsController.updateUserData);



module.exports = router;

