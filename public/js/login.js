/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';


export const signup = async (name, email, password, passwordConfirm) => {
    try {
    const res = await axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/signup',
        data: {
            name,
            email,
            password,
            passwordConfirm
        }
    });

    if(res.data.status === 'success') {
        showAlert('success', 'Your account has been created')
        window.setTimeout(() => {
            location.assign('/me');
        }, 2000);
    }

   } catch (err) {
    showAlert('error', err.response.data.message);
   }

};


export const login = async (email, password) => {
    try {
    const res = await axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/login',
        data: {
            email,
            password
        }
    });

    if(res.data.status === 'success') {
        showAlert('success', 'logged in sucesfully')
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);
    }

   } catch (err) {
     showAlert('error', err.response.data.message);
   }
};

export const logout = async () => {

    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:3000/api/v1/users/logout',
        });

        if((res.data.status = 'success')) location.assign('/');
    } catch(err) {
        showAlert('error', 'Error logging out! Try again')
    }
};