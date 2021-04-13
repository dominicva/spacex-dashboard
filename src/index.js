const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
};

const getCompanyInfo = function ({ BASE_URL, COMPANY }) {
  return fetch(`${BASE_URL}${COMPANY}`)
    .then((data) => data.json())
    .then((parsedData) => {
      console.log(parsedData);
      document.getElementById('summary').textContent = parsedData.summary;
      document.getElementById('ceo').textContent = parsedData.ceo;
      document.getElementById('coo').textContent = parsedData.coo;
      document.getElementById('cto').textContent = parsedData.cto;
      document.getElementById('cto-propulsion').textContent =
        parsedData.cto_propulsion;
      document.getElementById('employees').textContent = parsedData.employees;
      // document.getElementById('headquarters').textContent =
      //   parsedData.headquarters;
      // document.getElementById('links').textContent = parsedData.links;
    })
    .catch((err) => {
      console.log('Something went wrong getting company info', err);
    });
};

window.addEventListener(
  'DOMContentLoaded',
  getCompanyInfo.bind(this, SPACEX_API)
);
