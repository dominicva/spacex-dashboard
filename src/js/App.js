import { Info } from './spacexInfo';
import { mapHandler } from './launchpads';
import { launchMethod, latestLaunchMethods } from './launches';

const App = {
  infoInit() {
    return Info().then((info) =>
      document.querySelector('.info__container').append(info)
    );
  },
  initEventListeners() {
    const nav = document.querySelector('.nav-items');
    const navItems = document.querySelector('.nav-items').children;
    nav.addEventListener('click', (e) => {
      const navItemsArr = Array.from(navItems);
      navItemsArr.forEach((el) => {
        el.classList.remove('bottom-border');
      });
      event.target.classList.add('bottom-border');
    });

    document.addEventListener('DOMContentLoaded', (e) => {
      mapHandler(e);
      navItems[0].classList.add('bottom-border');
    });

    document
      .querySelector('.nav-item.latest-launch')
      .addEventListener('click', (e) =>
        latestLaunchMethods.latestLaunchHandler(e)
      );
  },
  init() {
    this.infoInit();
    this.initEventListeners();
  },
};

export default App;
