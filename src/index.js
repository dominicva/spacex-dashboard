const SPACEX_API = {
  BASE_URL: 'https://api.spacexdata.com/v4',
  COMPANY: '/company',
  LATEST_LAUNCH: '/launches/latest',
  NEXT_LAUNCH: '/launches/next',
};

const getCompanyInfo = function ({ BASE_URL, COMPANY }) {
  return fetch(`${BASE_URL}${COMPANY}`)
    .then((data) => data.json())
    .then(
      (parsedData) =>
        (document.getElementById('summary').textContent = parsedData.summary)
    )
    .catch((err) => {
      console.log('Something went wrong getting company info', err);
    });
};

// const onPageLoad = function () {
// };

window.addEventListener(
  'DOMContentLoaded',
  getCompanyInfo.bind(this, SPACEX_API)
);
