import 'regenerator-runtime/runtime';

const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
};

/*
UTILS
*/
const utils = {
  wordCapitalize(word) {
    return String(word)[0].toUpperCase() + String(word).slice(1);
  },
};

/*
COMPANY INFO SECTION
*/

// DATA
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

// FUNCTIONALITY
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
const launchMethods = {
  async getLatestLaunch({ BASE_URL, LATEST_LAUNCH }) {
    const launchRaw = await fetch(`${BASE_URL}${LATEST_LAUNCH}`);
    const launch = await launchRaw.json();
    return launch;
  },
  toggleBtnText(btnEl) {
    const get = 'Get latest launch';
    const remove = 'Remove latest launch';
    if (btnEl.textContent == get) {
      btnEl.textContent = remove;
    } else {
      btnEl.textContent = get;
    }
  },
  getLatestLaunchHandler() {
    LatestLaunch()
      .then((launch) => launch.renderLatestLaunch())
      .then((el) => document.querySelector('.launch__container').append(el));
  },
  removeLatestLaunchHandler() {
    document.querySelector('.launch__container').innerHTML = '';
  },
  latestLaunchHandler(e) {
    if (e.target.textContent == 'Get latest launch') {
      this.getLatestLaunchHandler.call(launchMethods);
      this.toggleBtnText.call(launchMethods, e.target);
    } else {
      this.removeLatestLaunchHandler.call(launchMethods);
      this.toggleBtnText.call(launchMethods, e.target);
    }
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
};

const LatestLaunch = async function () {
  const launch = Object.create(launchMethods);
  await launch.getLatestLaunch(SPACEX_API).then((l) => {
    launch.name = l.name;
    launch.date = launch.unixDateHandler(l.date_unix).split(' ')[0];
    launch.time = launch.unixDateHandler(l.date_unix).split(' ')[1];
    launch.details = l.details;
    launch.success = l.success;
    launch.links = l.links;
  });
  return launch;
};

const App = {
  infoInit() {
    return Info().then((info) =>
      document.querySelector('.info__container').append(info)
    );
  },
  initEventListeners() {
    document
      .querySelector('button')
      .addEventListener('click', (e) => launchMethods.latestLaunchHandler(e));
  },
  init() {
    this.infoInit();
    this.initEventListeners();
  },
};

App.init();
