/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
export const displayMap = locations => {

  mapboxgl.accessToken = 'pk.eyJ1IjoiZ3lvcmd5bmFneTE5ODYiLCJhIjoiY2wwbWdhcmJhMTJqNjNjcXR3d2Z5cThuMSJ9.kRrnShtvkKSBJ-ChYo55UA';

  var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/gyorgynagy1986/cl0mh5ao9000l15qg4okjjmtk',
      scrollZoom: false
      
      //center: [17.5969, 8.0829],
      //zoom: 4
  });
  
  
  // eslint-disable-next-line no-undef
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    // create marker
  
    const el = document.createElement('div');
    el.className = 'marker';
  
    // Add marker
  
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
        .setLngLat(loc.coordinates)
        .addTo(map);
  
    // add popup
    
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
  
    // Extend map bounds to include the current location
    bounds.extend(loc.coordinates,);
  });
  
  map.fitBounds(bounds, {
      padding: {
        top:200,
        bottom:150,
        left: 100,
        right: 100
        }  
  });

}


















