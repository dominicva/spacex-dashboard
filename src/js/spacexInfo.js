import SPACEX_API from './api';
import Component from './Component';
import utils from './utils';

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

export { Info };
