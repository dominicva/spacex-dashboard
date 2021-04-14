import 'regenerator-runtime/runtime';

const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
};

/*
COMPANY
*/
const getCompanyInfo = function ({ BASE_URL, COMPANY }) {
  return fetch(`${BASE_URL}${COMPANY}`)
    .then((data) => data.json())
    .then((parsedData) => ({
      summary: parsedData.summary,
      ceo: parsedData.ceo,
      coo: parsedData.coo,
      employees: parsedData.employees,
      headquarters: Object.values(parsedData.headquarters),
      links: Object.entries(parsedData.links),
    }))
    .catch((err) => {
      console.log('Something went wrong getting company info', err);
    });
};

const InfoField = function (label, content, type) {
  const infoEl = document.createElement('label');
  infoEl.className = 'company__field';
  infoEl.innerHTML = `
      <span class="label__label">${label}</span>
      <li class="label__li">${content}</li>
  `;
  return infoEl;
};

const render = function (hook, el) {
  hook.append(el);
};

const companyInfo = getCompanyInfo(SPACEX_API);
companyInfo.then((info) => {
  for (const key in info) {
    const infoEl = InfoField(key.toUpperCase(), info[key]);
    render(document.querySelector('.company'), infoEl);
  }
});

/*
LATEST LAUNCH
*/
const getLatestLaunch = async function ({ BASE_URL, LATEST_LAUNCH }) {
  const launchRaw = await fetch(`${BASE_URL}${LATEST_LAUNCH}`);
  const launch = await launchRaw.json();
  console.log(launch);
};

document
  .querySelector('button')
  .addEventListener('click', getLatestLaunch.bind(this, SPACEX_API));
