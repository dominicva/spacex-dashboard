import 'regenerator-runtime/runtime';

const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
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
  const childEl = InfoList(infoData);
  const infoEl = Component('div', 'info');
  infoEl.append(childEl);
  return infoEl;
};

const InfoList = function (data) {
  const infoEl = Component('ul', 'info__list', '');
  for (let key in data) {
    if (key == 'headquarters') {
      infoEl.append(hqInfoItem('Headquarters', data[key]));
    } else if (key == 'links') {
      infoEl.append(urlsInfoItem('Links', data[key]));
    } else {
      infoEl.append(InfoItem(key.toUpperCase(), data[key]));
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

const hqInfoItem = function (label, value) {
  const { address, city, state } = value;
  const html = `
    <span class="label__label">${label}</span>
    <li class="label__li">${address}<br>${city}<br>${state}</li>
  `;
  return Component('label', 'info__item', html);
};

const urlsInfoItem = function (label, value) {
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
LATEST LAUNCH
*/
const launchMethods = {
  async getLatestLaunch({ BASE_URL, LATEST_LAUNCH }) {
    const launchRaw = await fetch(`${BASE_URL}${LATEST_LAUNCH}`);
    const launch = await launchRaw.json();
    return launch;
  },
  render() {
    const launchEl = document.createElement('div');
    launchEl.className = 'launch';
    launchEl.innerHTML = `
      <h2 class="launch__name">${this.name}</h2>
      <h3 class="launch__date">${this.date}</h3>
      <p class="launch__details">${this.details}</p>
      <div class="launch__success">${this.success}</div>
      <div class="launch__links">${this.links}</div>
    `;
    return launchEl;
  },
};

const LatestLaunch = async function () {
  const launch = Object.create(launchMethods);
  await launch.getLatestLaunch(SPACEX_API).then((l) => {
    launch.name = l.name;
    launch.date = l.date_utc;
    launch.details = l.details;
    launch.success = l.success;
    launch.links = l.links;
  });
  return launch;
};

const onGetLatestLaunch = function () {
  LatestLaunch()
    .then((launch) => launch.render())
    .then((el) => document.querySelector('.launch__container').append(el));
};

document.querySelector('button').addEventListener('click', onGetLatestLaunch);

const App = {
  init() {
    return Info().then((res) =>
      document.querySelector('.info__container').append(res)
    );
  },
};

App.init();
