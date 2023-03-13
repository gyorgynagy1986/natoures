/* eslint-disable prettier/prettier */
const Review = require('./../models/reviewModel');
const factory = require('../controllers/handelerFactory');
// const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.CreateOne(Review);
exports.updateReview = factory.UpdateOne(Review);
exports.deleteReview = factory.DeleteOne(Review);