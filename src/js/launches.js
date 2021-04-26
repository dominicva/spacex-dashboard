import SPACEX_API from './api';
import utils from './utils';
// METHODS COMMON TO BOTH LAST AND NEXT LAUNCHES
const launchMethods = {
  async getLaunch(baseUrl, endpoint) {
    const launchRaw = await fetch(`${baseUrl}${endpoint}`);
    const launch = await launchRaw.json();
    return launch;
  },
  unixDateHandler(unixTimestamp) {
    // THANK YOU: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
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
const nextLaunchMethods = Object.assign(Object.create(launchMethods), {});

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

export { launchMethods, latestLaunchMethods };
