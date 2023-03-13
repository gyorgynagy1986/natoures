import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login , logout, signup} from './login';
import { updateSettings, removeTour, addTour, updateTour} from './updateSettings';
import { showAlter } from './alert';
import { bookTour } from './stripe';


// DOM ELEMENTS
const mapBox = document.getElementById('map');
//  SIGNUP
const selectForm = document.querySelector('.signUpform');
// LOGIN
const loginForm = document.querySelector('.login-form-get');
// LOG OUT BUTTON! 
const logOutBtn = document.querySelector('.logout--logout');
// UPDATE USER DATA 
const userData = document.querySelector('.admin-form');
// Update PASS
const userPasswordForm = document.querySelector('.form-user-settings'); 
// USER Photo rendering after upload
const userImgInputEl = document.getElementById('photo');
const userImgEl = document.querySelector('.form__user-photo');
// BOOKING TOUR
const bookButton = document.getElementById('book-tour');
console.log(bookButton);

// REMOVE TOUR remove-tour
const removeTourFromadmin = document.querySelector('.for-select-this-shit');
// CREATE A NEW TOUR
const createTour = document.querySelector('.input-container-add-tour');


// DELAGATION

/*if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    console.log(locations)
    displayMap(locations);
} */

// SIGNUP
if(selectForm) 
        selectForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;    
        const passwordConfirm = document.getElementById('passwordConf').value;    
       
        console.log(selectForm);

        signup(name, email, password, passwordConfirm);

    });


// LOGIN
if(loginForm) 
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;    
        login(email, password);
    });

  if(logOutBtn) logOutBtn.addEventListener('click', logout)


// UPDATE USER DATA
if(userData) 
    userData.addEventListener('submit', e => {
            e.preventDefault();
            const form = new FormData();
            form.append('name', document.getElementById('name').value);
            form.append('email', document.getElementById('email').value);
            form.append('photo', document.getElementById('photo').files[0]);
            console.log(form);

            updateSettings(form, 'data');
        });

if(userPasswordForm) 
    userPasswordForm.addEventListener('submit', async e  => {
        e.preventDefault();

        document.querySelector('.btn--save--password').textContent = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await  updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

            document.querySelector('.btn--save--password').textContent = 'Save password';
            document.getElementById('password-current').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password-confirm').value = '';
        });

  
    
const handleDisplayUserPhoto = e => {
   const imgFile = e.target.files?.[0];
  
   if (!imgFile?.type.startsWith('image/')) return;
   const reader = new FileReader();
  
   reader.addEventListener('load', () => {
     userImgEl.setAttribute('src', reader.result);
   });
  
   reader.readAsDataURL(imgFile);
 
 };

 if(userImgInputEl)
 userImgInputEl.addEventListener('change', handleDisplayUserPhoto);  

//HANDELING BOOKING

if(bookButton) 
    bookButton.addEventListener('click', e => {
       e.target.textContent = 'Processing...';
       const {tourId} = e.target.dataset;
       bookTour(tourId);
});



//ADD A NEW TOUR

if(createTour) 
    createTour.addEventListener('submit', e => {
        e.preventDefault();

        const a = document.getElementById('tourname').value;
        const b = document.getElementById('difficulties').value;
        const c = document.getElementById('date').value;    
        const d = document.getElementById('summary').value;    

        addTour(a, b, c, d);

    });


// UPDATE A TOUR

if(createTour) 
    createTour.addEventListener('submit', el => {
        el.preventDefault();

        const a = document.getElementById('update-tourname').value;
        const b = document.getElementById('update-difficulties').value;
        const c = document.getElementById('update-date').value;    
        const d = document.getElementById('update-summary').value;
        const e = document.getElementById('tour-id-update').textContent;

       console.log(e); 

        updateTour(a, b, c, d, e);

    });



// REMOVE TOUR

if(removeTourFromadmin) 
    removeTourFromadmin.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById('rtid').value;
        
        removeTour(id);

    });