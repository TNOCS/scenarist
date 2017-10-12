import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.title = 'Scenario Player';
    config.map([
      { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./components/home/home'), nav: true, title: 'Home' },
      { route: ['scenario'], name: 'scenario', moduleId: PLATFORM.moduleName('./components/scenario-list/scenario-list'), nav: true, title: 'Scenarios' },
      { route: ['player'], name: 'player', moduleId: PLATFORM.moduleName('./components/player-controls/player-controls'), nav: true, title: 'Player' },
      { route: ['settings'], name: 'settings', moduleId: PLATFORM.moduleName('./components/settings-editor/settings-editor'), nav: true, title: 'Settings' }
    ]);
  }

}
