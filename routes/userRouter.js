/* eslint-disable prettier/prettier */
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('multer');


// const upload = multer ({ dest: 'public/img/users/uploadedPhotos'});


const router = express.Router();
    
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// GET TEAM MEMBER BY AGGRIGATION! 


router.use(authController.protect); // All below is protected now, so do not need to add "authController.protect" to the routs  one by one

router.get('/me',
    userController.getMe, 
   userController.getUser
    );

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
    );
router.delete('/deleteMe', userController.deleteMe);


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


router.use(authController.restrictTo('admin'));

router.post('/getOnebyEmail', userController.getOnebyEmail);
    
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


module.exports = router;