/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken'); 
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("./../utils/email");


const filterObj = (obj, ...allowedFields) => {
   
    const newObj = {};
    Object.keys(obj).forEach( el => {
            if(allowedFields.includes(el)) newObj [el] = obj [el];
        });

        return newObj;
}

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

    const createSendToken = (user, statusCode, res) => {
        const token = signToken(user._id); 
       
        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        
        if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

        res.cookie('jwt', token, cookieOption);

        // remove the user form out put
        user.password = undefined;
 
        res.status(statusCode).json({
            status:'success',
            token,
            data: {
                user
            }
        });
    }

    exports.signup = catchAsync(async (req, res, next) => {

        const filteredBody = filterObj(req.body, 'password', 'passwordConfirm', 'email', 'name',  );

        const newUser = await User.create(filteredBody);
            
        const url = `${req.protocol}://localhost:3000/me`;
            
      //  if (process.env.NODE_ENV === 'production') {
      //      url = `${req.protocol}://${req.get('host')}/me`;
      //      }       
      //      
        await new Email(newUser, url).sendWelcome();
       
        createSendToken(newUser, 201, res);
          
    });

    exports.login = catchAsync(async(req, res, next) => {
        const { email, password } = req.body;

     //1 ) check if email ad pass exist
     if(!email || !password) {
         return next(new AppError('Pelase provide email and password', 400))
     }
    
     //2 ) check if the user is exist && pass is correct 
     const user = await User.findOne({ email }).select('+password');

     if(!user || !(await user.correctPassword(password, user.password))) {
         return next(new AppError('Incorrent email or password', 401))
     }

     //3 ) if evrything is ok, send token to client 

     createSendToken(user, 200, res);
    
    });

    exports.protect = catchAsync( async (req, res, next) => {

        // 1) Getting token and check if it's there 
        let token;

        if (req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')
            
            ) {
                token = req.headers.authorization.split(' ')[1];
              } else if (req.cookies.jwt) {
                  token = req.cookies.jwt;
              }
              
        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get acces', 401))
        };      

        // 2) Verification token (importnat)

         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            console.log(decoded);
            
        // 3) Chech if user still exist 
         const currentUser = await User.findById(decoded.id);
         if(!currentUser) {
             return next(
                 new AppError(
                     'The user belonging to this token is no longer exist', 
                     401)
                     );
         }

        // 4) if user change password after the token was issued
         if(currentUser.changePasswordAfter(decoded.iat)) {
             return next(
                 new AppError(
                     'User recently changed password! Please log in again', 
                      401)
             );
         }

        // GRANT ACCESS TO PROTECTED ROUTE 
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    });

    exports.logout = (req, res) => {
        res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000 ),
            httpOnly: true
        });
        res.status(200).json({ status: 'success' });
    };

exports.restrictTo = (...roles) => {
    return(req, res, next) => {
        // roles [admin], 'lead-guide']  role= user currently
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to do this process.', 403)
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTED email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('There is not user with this email address', 404));
    }
   
    // 2) Genetare the random reset pass

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to user's email
   
    try {

      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user, resetURL).sendPasswordReset();
    
        res.status(200).json({
            status: 'sucess',
            message: 'Token sent to email!'
        });
        
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the amil. Try it again later ,', 500))

    }
   
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on TOKEN 
    
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token not expired, and there is a user , set a new password 
    if(!user) {
        return next(new AppError('Token is invalid or hash expired', 400))
    } 

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();


        // 3) Updade the chancgePassword propety for the user 
    // 4) log the user in , send JWT

    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync( async (req, res, next) => {
   // 1) Get user from the collection
   const user = await User.findById(req.user.id).select('+password');
   
   // 2) Check ifthe pass is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong', 401))
  }
   
  // 3) If the pass is correct , update it
  user.password = req.body.password;    
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();    
 //User.findByIdAndUpdate does not work as intended.

   // 4) Log user in, send JWT

   createSendToken(user, 200, res);

});

// Only for render pages , no errors. 
exports.isLoggedIn =  async (req, res, next) => {
    if (req.cookies.jwt) {
    // 1 verify the token
     try {
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
            );
            
        // 3) Chech the user is still exist
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next();
        }

        // 3) if user change password after the token was issued
        if(currentUser.changePasswordAfter(decoded.iat)) {
            return next();
        }

        // THE IS A LOGED IN USER! 
         res.locals.user = currentUser;
             return next();
    } catch (err) {
        return next();
    }       
}
    
    
    next();

};