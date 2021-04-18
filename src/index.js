const mapStyles = require('./map.json');

import 'regenerator-runtime/runtime';
import { Loader } from '@googlemaps/js-api-loader';

const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
  LAUNCHPADS: '/launchpads',
};

const utils = {
  wordCapitalize(word) {
    return String(word)[0].toUpperCase() + String(word).slice(1);
  },
};

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

/**
 * @description Makes API request for company information
 * @param {Object} SPACEX_API - Container for API endpoints
 * @param {string} BASE_URL - SpaceX API base URL
 * @param {string} COMPANY - API endpoint for SpaceX company info
 * @returns {Object} Desired response values
 */
const getCompanyInfo = function ({ BASE_URL, COMPANY }) {
  return fetch(`${BASE_URL}${COMPANY}`)
    .then((rawData) => rawData.json())
    .then((parsedData) => ({
      summary: parsedData.summary,
      ceo: parsedData.ceo,
      coo: parsedData.coo,
      employees: parsedData.employees,
      headquarters: parsedData.headquarters,
      links: parsedData.links,
    }))
    .catch((err) => {
      console.log('Something went wrong getting company info', err);
    });
};

/**
 * @description Template DOM component class
 * @constructor Intentionally does NOT need to be called with 'new'
 * @param {string} tag - HTML tag
 * @param {string} className - CSS class
 * @param {string} html – innerHTML for the Component instance
 * @returns {Object}
 */
const Component = function (tag, className, html) {
  const domEl = document.createElement(tag);
  domEl.className = className;
  if (html) domEl.innerHTML = html;
  return domEl;
};

const Info = async function () {
  const infoData = await getCompanyInfo(SPACEX_API);
  const infoEl = Component('div', 'info');
  const childEl = InfoList(infoData);
  infoEl.append(childEl);
  return infoEl;
};

const InfoList = function (data) {
  const infoEl = Component('ul', 'info__list', '');
  for (let key in data) {
    if (key == 'headquarters') {
      infoEl.append(HqInfoItem('Headquarters', data[key]));
    } else if (key == 'links') {
      infoEl.append(UrlsInfoItem('Links', data[key]));
    } else {
      infoEl.append(InfoItem(utils.wordCapitalize(key), data[key]));
    }
  }
  return infoEl;
};

const InfoItem = function (label, content) {
  const html = `
  <span class="label__label">${label}</span>
  <li class="label__li">${content}</li>
`;
  return Component('label', 'info__item', html);
};

const HqInfoItem = function (label, value) {
  const { address, city, state } = value;
  const html = `
    <span class="label__label">${label}</span>
    <li class="label__li">${address}<br>${city}<br>${state}</li>
  `;
  return Component('label', 'info__item', html);
};

const UrlsInfoItem = function (label, value) {
  const { website, flickr, twitter } = value;
  const html = `
    <span class="label__label">${label}</span>
    <li class="label__li">
      <a href="${website}" target="_blank">Website</a> &nbsp|&nbsp
      <a href="${flickr}" target="_blank">Flickr</a> &nbsp|&nbsp 
      <a href="${twitter}" target="_blank">Twitter</a>
    </li>
  `;
  return Component('label', 'info__item', html);
};

/*
LAUNCHES
*/

// METHODS COMMON TO BOTH LAST AND NEXT LAUNCHES
const launchMethods = {
  async getLaunch(baseUrl, endpoint) {
    const launchRaw = await fetch(`${baseUrl}${endpoint}`);
    const launch = await launchRaw.json();
    return launch;
  },
  unixDateHandler(unixTimestamp) {
    // THANK YOU: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(unixTimestamp * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = '0' + date.getMinutes();
    const second = '0' + date.getSeconds();

    return `${day}/${month}/${year} ${hour}:${minute.substr(
      -2
    )}:${second.substr(-2)}`;
  },
  toggleBtnText(btnEl, get, remove) {
    if (btnEl.textContent == get) {
      btnEl.textContent = remove;
    } else {
      btnEl.textContent = get;
    }
  },
};

// LATEST-LAUNCH-SPECIFIC METHODS LINKED TO ABOVE LAUNCH METHODS
const latestLaunchMethods = Object.assign(Object.create(launchMethods), {
  getLatestLaunchHandler() {
    LatestLaunch(SPACEX_API)
      .then((launch) => launch.renderLatestLaunch())
      .then((el) => document.querySelector('.launch__container').append(el));
  },
  removeLatestLaunchHandler() {
    document.querySelector('.launch__container').innerHTML = '';
  },
  latestLaunchHandler(e) {
    const get = 'Latest launch';
    const remove = 'Remove latest launch';
    if (e.target.textContent == get) {
      this.getLatestLaunchHandler.call(latestLaunchMethods);
      this.toggleBtnText.call(launchMethods, e.target, get, remove);
    } else {
      this.removeLatestLaunchHandler.call(launchMethods);
      this.toggleBtnText.call(launchMethods, e.target, get, remove);
    }
  },
  renderLatestLaunch() {
    const launchEl = document.createElement('div');
    launchEl.className = 'launch';
    launchEl.innerHTML = `
      <div class="launch__image" style="background-image: url(${
        this.links.flickr.original[0]
      })"></div>
      <label class="label__label" for="launch__name">Name</label>
      <h2 class="launch__name">${this.name}</h2>
      <label class="label__label" for="launch__date">Date (day/month/year)</label>
      <h3 class="launch__date">${this.date}</h3>
      <label class="label__label" for="launch__time">Time (hour/minute/second)</label>
      <h3 class="launch__time">${this.time}</h3>
      <label class="label__label" for="launch__details">Details</label>
      <p class="launch__details">${this.details}</p>
      <label class="label__label" for="launch__success">Success status</label>
      <div class="launch__success">${utils.wordCapitalize(this.success)}</div>
      <label class="label__label" for="launch__webcast">Launch webcast</label>
      <iframe 
        class="launch__webcast" 
        src="https://www.youtube.com/embed/${this.links.youtube_id}" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen">
      </iframe>
      <label class="label__label" for="launch__links">Links</label>
      <ul class="launch__links">
        ${this.links}
      </ul>
    `;
    return launchEl;
  },
});

// LATEST LAUNCH "CONSTRUCTOR"
const LatestLaunch = async function ({ BASE_URL, LATEST_LAUNCH }) {
  const launch = Object.create(latestLaunchMethods);
  await launch.getLaunch(BASE_URL, LATEST_LAUNCH).then((l) => {
    launch.name = l.name;
    launch.date = launch.unixDateHandler(l.date_unix).split(' ')[0];
    launch.time = launch.unixDateHandler(l.date_unix).split(' ')[1];
    launch.details = l.details;
    launch.success = l.success;
    launch.links = l.links;
  });
  return launch;
};

// NEXT-LAUNCH-SPECIFIC METHODS, LINKED TO SHARED LAUNCH METHODS ABOVE
const nextLaunchMethods = Object.assign(Object.create(launchMethods), {
  // TO BE POPULATED
  // nextLaunchHandler(e) {
  //   if (e.target.textContent == 'Get next launch') {
  //     this.getNextLaunchHandler.call(launchMethods);
  //     this.toggleBtnText.call(launchMethods, e.target);
  //   } else {
  //     this.removeLatestLaunchHandler.call(launchMethods);
  //     this.toggleBtnText.call(launchMethods, e.target);
  //   }
  // },
});

const NextLaunch = async function ({ BASE_URL, NEXT_LAUNCH }) {
  const launch = Object.create(launchMethods);
  await launch.getLaunch(BASE_URL, NEXT_LAUNCH).then((l) => {
    launch.name = l.name;
    launch.date = launch.unixDateHandler(l.date_unix).split(' ')[0];
    launch.time = launch.unixDateHandler(l.date_unix).split(' ')[1];
    launch.details = l.details;
  });
  return launch;
};

// TEMPORARY INLINE TEST
// const next = fetch(`${SPACEX_API.BASE_URL}${SPACEX_API.NEXT_LAUNCH}`);
// next.then((d) => d.json()).then((l) => console.log(l));

const App = {
  infoInit() {
    return Info().then((info) =>
      document.querySelector('.info__container').append(info)
    );
  },
  initEventListeners() {
    document
      .querySelector('.nav-items.launchpads')
      .addEventListener('click', (e) => mapHandler(e));

    document
      .querySelector('.nav-items.latest-launch')
      .addEventListener('click', (e) =>
        latestLaunchMethods.latestLaunchHandler(e)
      );
    // document
    //   .querySelector('.next-launch__btn')
    //   .addEventListener('click', (e) => launchMethods.nextLaunchHandler(e));
  },
  init() {
    this.infoInit();
    this.initEventListeners();
  },
};

App.init();
