/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
import '../static/css/leaflet.css';
import '../static/css/styles.css';
import '../static/sass/materialize.scss';
import '../static/js/bin/materialize';
import 'material-design-icons/iconfont/material-icons.css';
// import '../static/css/styles.css';
import { Aurelia } from 'aurelia-framework';
import environment from './environment';
import * as Bluebird from 'bluebird';
import 'jquery';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

const waitForMaterialize = () => {
  return new Promise((resolve, reject) => {
    let iterations = 0;
    const handler = window.setInterval(() => {
      iterations++;
      let ma = (window as any).Materialize;
      if (
        ma.elementOrParentIsFixed &&
        ma.escapeHash &&
        ma.fadeInImage &&
        ma.guid &&
        ma.scrollFire &&
        ma.showStaggeredList &&
        ma.toast &&
        ma.updateTextFields
      ) {
        // log(`waited ${iterations} iterations for Materialize to finish loading`);
        window.clearInterval(handler);
        resolve();
      }
    }, 1);
  });
};

export async function configure(aurelia: Aurelia) {
  await waitForMaterialize();
  aurelia.use
    .standardConfiguration()
    // .globalResources(PLATFORM.moduleName('./components/property-editor/property-editor'))
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-api'), config => {
      config.registerEndpoint('db', 'http://localhost:3000/');
      config.registerEndpoint('player', 'http://localhost:3002/');
    });

  aurelia.use.plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), bridge => {
    // Comment the items below to reduce loading time
    bridge
      // .useAutoComplete()
      // .useBadge()
      // .useBreadcrumbs()
      // .useBox()
      .useButton()
      .useCard()
      // .useCarousel()
      // .useCharacterCounter()
      .useCheckbox()
      // .useChip()
      .useCollapsible()
      .useCollection()
      .useColors()
      .useDatePicker()
      .useDropdown()
      // .useFab()
      // .useFile()
      .useFooter()
      .useInput()
      .useModal()
      .useNavbar()
      .usePagination()
      // .useParallax()
      .useProgress()
      // .usePushpin()
      .useRadio()
      .useRange()
      // .useScrollfire()
      // .useScrollSpy()
      .useSelect()
      .useSidenav()
      .useSlider()
      .useSwitch()
      .useTabs()
      .useTooltip()
      .useTransitions()
      .useWaves()
      .useWell();
  });
  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
