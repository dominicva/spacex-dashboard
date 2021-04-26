import { Loader } from '@googlemaps/js-api-loader';
import SPACEX_API from './api';
const mapStyles = require('../map.json');

/**
 * Fetches and formats data on SpaceX's launchpads
 * @returns {Array} Each element is an object containing select data
 */
const getLaunchPads = async function () {
  const launchPads = [];

  await fetch(`${SPACEX_API.BASE_URL}${SPACEX_API.LAUNCHPADS}`)
    .then((data) => data.json())
    .then((data) =>
      launchPads.push(
        ...data.map((launchPad) => {
          const o = {};
          // must wrap destucturing pattern without declarator in parens
          ({
            full_name: o.fullName,
            details: o.details,
            latitude: o.latitude,
            longitude: o.longitude,
          } = launchPad);

          return o;
        })
      )
    );

  return launchPads;
};

const mapHandler = function () {
  const loader = new Loader({
    apiKey: 'AIzaSyDc319-jjkfND5IlTgKA0yITX-sJUInuJE',
    version: 'weekly',
  });

  const hawthorne = { lat: 33.916, lng: -118.352 };

  const mapRootEl = document.getElementById('map');
  mapRootEl.style.display = 'block';

  loader.load().then(() => {
    const map = new google.maps.Map(mapRootEl, {
      center: hawthorne,
      zoom: 3,
      styles: mapStyles,
    });

    const launchPads = getLaunchPads();
    launchPads.then((launchPads) => {
      launchPads.forEach((launchPad) => {
        const { fullName, details } = launchPad;
        const infoWindowHtml = `
          <h4 class="map__info-window">${fullName}</h4>
          <p class="map__info-window">${details}</p>
        `;

        const infowindow = new google.maps.InfoWindow({
          content: infoWindowHtml,
          maxWidth: 320,
        });

        const { latitude, longitude } = launchPad;
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          title: `${fullName}`,
        });

        marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
      });
    });
  });
};

export { mapHandler };
