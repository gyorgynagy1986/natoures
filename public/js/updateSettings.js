import axios from 'axios';
import { showAlert } from './alert';

// Type is either "password" or "data"
export const updateSettings = async (data, type) => {
    try {
    
        const url = type === 'password' 
            ? '/api/v1/users/updateMyPassword' 
            : '/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data 
    });
    
    console.log(res.data.status);

    if(res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()} is sucesfully updated`)
    }

   } catch (err) {
    showAlert('error', err.response.data.message);
   }
};

// ADD TOUR

export const addTour = async (name, difficulty, startDates, summary) => {

    try {
        const res = await axios({
            method: 'POST',
            url: `/api/v1/tours`,
            data: {
                name,
                difficulty,
                startDates,
                summary
            }
        });

        console.log(res);

        showAlert('success', 'The Tour is sucesfully ADDED')
        window.setTimeout(() => {
            location.assign('/all-tours');
        }, 1500);

    } catch(err) {
        showAlert('error', err.response.data.message)
    }
};


export const updateTour = async (name, difficulty, startDates, summary, e) => {

    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:3000/api/v1/tours/${e}`,
            data: {
                name,
                difficulty,
                startDates,
                summary
            }
        });

        console.log(res);

        showAlert('success', 'The Tour is sucesfully ADDED')
        window.setTimeout(() => {
            location.assign('/all-tours');
        }, 1500);

    } catch(err) {
        showAlert('error', err.response.data.message)
    }
};




// UPDATE A TOUR



// REMOVE TOUR

export const removeTour = async id => {

    try {
        const res = await axios({
            method: 'DELETE',
            url: `http://localhost:3000/api/v1/tours/${id}`,
        });

        console.log(res);

        showAlert('success', 'The Tour is sucesfully REMOVED')
        window.setTimeout(() => {
            location.assign('/all-tours');
        }, 1500);

    } catch(err) {
        showAlert('error', err.response.data.message)
    }
};