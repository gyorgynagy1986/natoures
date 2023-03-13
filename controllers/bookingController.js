const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('../controllers/handelerFactory');
const catchAsync = require('../utils/catchAsync');


exports.getCheckoutSession  = catchAsync( async (req,res, next) => {

    //1 get currently booked tour

    const tour = await Tour.findById(req.params.tourId) 
    console.log(tour);
    //2 create checkout session

   const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url:`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://media.tacdn.com/media/attractions-splice-spp-674x446/06/dd/4d/f7.jpg`],
                amount: tour.price * 100, 
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    //3 send it to the client

    res.status(200).json({
        status: 'sucess',
        session
    })

});




exports.creatBookingCheckout = catchAsync (async (req, res, next) => {
    
    //This is only TEMPORARY, becuse it is not secured! 
    
    const {tour, user, price} = req.query;

    if(!tour && !user && !price) return next();
    await Booking.create({tour, user, price})

    res.redirect(req.originalUrl.split('?')[0])
});

exports.createBooking = factory.CreateOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.UpdateOne(Booking);
exports.deleteBooking = factory.DeleteOne(Booking);
