/* eslint-disable prettier/prettier */
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.DeleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No documnet found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });


exports.UpdateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

  exports.CreateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      },
    });
  });


exports.getOne = (Model, popOption) => 
  catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if(popOption) query = query.populate(popOption);
    const doc = await query;
    
    if(!doc) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status:'success, the ID is found successfully',
            data: {
              data: doc
            }
        });
});

exports.getAll = Model => 
  catchAsync(async (req, res, next) => {

    // To allow for nested GET reviews on tour (hack)
    
    let filter = {}
    if(req.params.tourId) filter = {tour : req.params.tourId};
    
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFileds()
        .paginate();
    const doc = await features.query;
  // const doc = await features.query.explain();

    
     //SEND RESPOND

     res.status(200).json({
         status:'success',
         requestedAt: req.requestTime,
         results: doc.length,
         data: {
            data: doc
         }
     });
});
