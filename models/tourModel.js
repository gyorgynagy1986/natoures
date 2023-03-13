/* eslint-disable prettier/prettier */
const mongoose = require('mongoose'); //DRIVER HELPS FOR CONNECTING TO THE DATBASE //INSTALL= npm i mongoose@5 (version 5.)
// const User = require('./userModel');
const { default: slugify } = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

 const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name' ],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name has to be less or equal than 40 characters'],
        minlength: [10, 'Tour name has to be more or equal than 10 characters'],
       // validate: [validator.isAlpha, 'The name must only contain caracters']
    },

    slug : String,

    duration: {
        type: Number,
        required: [true, 'A tour must have a duration' ],
        default:1000
    },

    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a groupsize' ],
        default:1000
    },

    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty' ],
        enum: {
            values: ['easy', 'medium', 'difficult',],
            message: 'Diffuculty is either: easy, medium, difficult'
        }
        
    },


    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5'],
        set: val => Math.round(val * 10) / 10 // 4.666666,
    },

    ratingsQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        required:[true, 'A tour must have a price' ],
        default:1000
    },

    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price; // 10
              },
              message: 'Discount price ({VALUE}) should be below regular price'
            }
         
    },
        
    summary: {
        type: String,
        trim: true, // trim only works with strings // this will remove all the white space from the beggining and from the and 
        default: 'You did not add description of the tour'

    },

    description: {
        type: String,
        trim: true,
        default: 'You did not add description of the tour'
    },

    imageCover: {
        type: String,
        default: 'tour-7-1.jpg',
       // required:[false, 'A tour must have an image']
    
    },

    images: {
        type: [String],
        default: ['tour-7-1.jpg' , 'tour-7-2.jpg', 'tour-7-3.jpg']
    },
    
    createAt: {
        type: Date,
        default: Date.now(),
        select:false // In this case the creation date will be not visible
    },

        startDates: [Date],
        
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default:'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address : String,
            description: String
        },

        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address : String,
                description: String,
                day: Number

            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId, 
                ref: 'User'
            }
        ]
    },
    
    {   
        toJSON: { virtuals: true},
        toObject: { virtuals: true}
    }
); 

tourSchema.index({price: 1, ratingsAverage: -1 });
tourSchema.index({slug: 1}); 


tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref:'Review',
    foreignField: 'tour',
    localField: '_id'
});


// virtual populate


// DOCUMNET MEDDELWARE : runs beforete .save() command and  .create() command.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true});
    next();
});


// QUERY MIDDLEWARE 

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt -numberOfReviews -_id' 
    });
    next();
});


tourSchema.pre(/^find/, function(next) { ///^find/ = all the strings that starts as find
// tourSchema.pre('find', function(next) {
this.find({secretTour: {$ne: true}})
    next();
});

//AGGREGATION MIDDLEWARE 
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: {secretTour: { $ne: true}}   })
    console.log(this.pipeline());
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

/* 
tourSchema.pre('save', async function(next) {
    const guidesPromises = this.guides.map(async id => User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
});

*/

/* 

MIDDLEWARES FOR REFERENCE

tourSchema.pre('save', function(next) {
    console.log('Will save documents');
    next();
});


tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next();
}); 

*/

