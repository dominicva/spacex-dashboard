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
    .then((rawData) => rawData.json())

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
const launchMethods = {
  async getLatestLaunch({ BASE_URL, LATEST_LAUNCH }) {
    const launchRaw = await fetch(`${BASE_URL}${LATEST_LAUNCH}`);
    const launch = await launchRaw.json();
    // console.log(launch);
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
