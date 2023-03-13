/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../controllers/handelerFactory');

const storage = multer.memoryStorage(); 

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image, please upload only images', 400), false)
    }
};

const upload = multer ({ 
  storage: storage,
  fileFilter: multerFilter});



exports.uploadTourImages = upload.fields([

    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
   
]);


exports.resizeTourImages = catchAsync (async ( req, res,  next) => {
    console.log(req.files);
    // if(!req.files.imageCover && !req.files.images) return next();
   
    // 1) Cover Image
    if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`);
    }

    // 2) Images

    if (req.files.images) {
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`;
        
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`public/img/tours/${filename}`);


            req.body.images.push(filename);
            })
        );
    }
     console.log(req.files);
 next();   
    
});

// upload.array('images', 5)

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage, pice';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};



exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.creatTour = factory.CreateOne(Tour);
exports.deleteTour = factory.DeleteOne(Tour);
exports.updateTour = factory.UpdateOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([

        {
            $match: { ratingsAverage: { $lt: 4 } }, //{ ratingsAverage: { $gte: 1 } }
        },

        {
            $group: {
                 _id:       {$toUpper: '$difficulty'},
                numTours:   { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating:  { $avg: '$ratingsAverage' },
                avgPrice:   { $avg: '$price' },
                minPrice:   { $min: '$price' }, 
                maxPrice:   { $max: '$price' }, 
                
            }
        },
       
    ]);

    res.status(200).json({
        status:'success',
        data: {
            stats
        }
    });

}); 


exports.getMothlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1;
    const plan = await Tour.aggregate([

        {
            $unwind: '$startDates',
        },

        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            },
            
        },

        {  
            $group: {

                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1},
                tours: { $push: '$name'}    
            } 
        },

        {
            $addFields: { month: '$_id'}
        },

        {
            $project: {
                _id:0
            }
        },
        
        {
            $sort: {
                numTourStarts: -1
            }

        },

    ]);

    res.status(200).json({
        status:'success',
        data: {
            plan
        }
    });

});




// REFERENCES 

/* exports.updateTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            runValidators: true
        })

        if(!tour) {
            return next(new AppError('No tour found with that ID', 404))
        }

        res.status(200).json({
            status:'success',
            data: {
                tour
            }
        });

   
}); 

 exports.creatTour = catchAsync(async (req, res, next) => {
    const newTour= await Tour.create(req.body);
    
        res.status(201).json({
            status: 'Sucess',
            data: {
            tour:newTour
                   }
                });       
});
 

exports.deleteTour = catchAsync(async (req, res, next) => {

       const tour = await Tour.findByIdAndDelete(req.params.id);

       if(!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }

        res.status(204).json({
        
            status: 'Success',
            data: null  
        });
}); 


exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate('reviews');

    if(!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status:'success, the ID is found successfully',
            data: {
                tour
            }
        });
}); 


exports.getAllTours = catchAsync(async (req, res, next) => {
    
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFileds()
            .paginate();
        const tours = await features.query;
        
         //SEND RESPOND

         res.status(200).json({
             status:'success',
             requestedAt: req.requestTime,
             results: tours.length,
             data: {
                tours
             }
         });
});




*/