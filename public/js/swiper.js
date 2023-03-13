 const getsSwiper = document.querySelector('.swiper');
 const s = Swiper;

 const swiper = new s(getsSwiper, {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    slidesPerView: 3,
    spaceBetween: 60,

    breakpoints: {
        // when window width is >= 320px
        300: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        // when window width is >= 640px
        800: {
          slidesPerView: 3,
          spaceBetween: 40
        }
      }
  });

  

  

  