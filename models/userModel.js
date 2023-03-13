/* eslint-disable prettier/prettier */
const crypto = require('crypto'); // node modul no need to install anything
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); 
const { stringify } = require('querystring');

const Tour = require('./tourModel');


const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, 'Missing name' ],
        trim: true,
        maxlength: [15, 'User name has to be less or equal than 40 characters'],
        minlength: [3, 'User name has to be more or equal than 10 characters'],
    },

    email: {
        type: String,
        required: [true, 'Please provide a valid email address' ],
        unique: true,
        lowercase:true, //transform the email to lowercase
        validate: [validator.isEmail]
    },

    photo: {
        type: String,
        default:'default.png'
    },

    password: {
        type: String,
        required: [true, 'please provide a password' ],
        maxlength: [15, 'Less than 15 caracter'],
        select: false // does not show the pass as it GET (output)
    },

    numberOfReviews: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'leade-guide', 'admin'],
        default: 'user'
    },

    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password' ],
        validate: {
            // This only works on CREATE AND SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same',
        }
    },
    
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type:Boolean,
        default: true,
        select: false // not shown by the post request in the user data (only in the database)
    },
    
   

},
);


// pree save middleware

 userSchema.pre('save', async function(next) {
    // Only run thos function if the pass was actually modified
    
    if (!this.isModified('password')) return next();

    // hass tha pass with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete the passwodrConfirm filed
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000;
    next();
}); 

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    
    this.find({active : { $ne: false} })
  
    next();
});


userSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'review',
    });
    next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangeAt) {
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
 
        return JWTTimestamp < changeTimestamp;
    }
    
    // False means NOT CHANAGED(password)
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;