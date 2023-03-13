/* eslint-disable prettier/prettier */
// review / rating / createdAt / ref to tour / ref user
const mongoose = require('mongoose'); //DRIVER HELPS FOR CONNECTING TO THE DATBASE //INSTALL= npm i mongoose@5 (version 5.)
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema({
 
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
 
    rating: {
        type: Number,
        default: 3,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5'],
    },

    createAt: {
        type: Date,
        default: Date.now(),
    },
    
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Revire must belong to a tour']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Revire must belong to a user']
    },   
},
    
    {   
        toJSON: { virtuals: true},
        toObject: { virtuals: true}
    }
    
);

reviewSchema.index( {tour: 1, user: 1}, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({
       path: 'user',
       select: 'name photo' 
    })
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
   const stats = await this.aggregate([

        {
            $match: {tour: tourId }
        },

        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' } 
            }
        }

    ]); 

    console.log(stats);

    if(stats.length > 0) {  await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity:stats[0].nRating
     });
    
    } else {
         await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
         });
    }
  
};



reviewSchema.statics.calcNumberofReview = async function(userId) {
    const count = await this.aggregate([
 
         {
             $match: {user: userId }
         },
 
         {
             $group: {
                 _id: '$user',
                 nRating: { $sum: 1 },
             }
         }
 
     ]); 
 
     console.log(count);
 
     if(count.length > 0) {  await User.findByIdAndUpdate(userId, {
        numberOfReviews:count[0].nRating
      });
     
     } else {
          await User.findByIdAndUpdate(userId, {
            numberOfReviews: 0
                  });
     }
   
 };
 

 reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcNumberofReview(this.user);
});

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// for calc avarage and quantity in case of editing or removing the review

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    //await this.findOne(); does not work here , query has alredy executed 
   await this.r.constructor.calcAverageRatings(this.r.tour);
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
