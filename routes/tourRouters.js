/* eslint-disable prettier/prettier */
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRouters');

const router = express.Router();

// router.param('id', tourController.checkID);

/* router
.route('/:tourId/reviews')
.post(
    authController.protect,
    authController.restrictTo('user'), 
    reviewController.createReview
  );

*/

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats')
  .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
  .get(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide', 'guide'),
          tourController.getMothlyPlan
    );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.creatTour
      );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
          authController.protect, 
          authController.restrictTo('admin', 'lead-guide'),
          tourController.updateTour,
          tourController.uploadTourImages,
          tourController.resizeTourImages
          )
  .delete(
          authController.protect, //check whether the user is looged in and the token is valid 
          authController.restrictTo('admin', 'lead-guide'), // // check whether the user have permission to the the removal
          tourController.deleteTour); // Doing the removal process 

module.exports = router;

