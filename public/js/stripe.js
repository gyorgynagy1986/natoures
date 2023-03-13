import axios from "axios";
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51L0hsOJn1lF4rQdkbmVNawG4sDLzGJhIdxuLrzm3qfYovSuaUaZxIpvr4mR6mqZW1WGzuERb680RVROtrEmlzO0000EvdRSjeq');


export const bookTour = async tourId => {
    
    try {
        //1 get the checkout session from the server

            const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
            console.log(session);
    
        //2 create the form for checkout + process the paymant
        
            await stripe.redirectToCheckout({
            sessionId: session.data.session.id
    });

    } catch(err) {
        console.log(err);
        showAlert('err', err)
    }
    
    
   

} ;