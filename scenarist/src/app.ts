import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.title = 'Scenario Manager';
    config.map([
      { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./components/home/home'), nav: true, title: 'Home' },
      { route: ['scenario'], name: 'scenario', moduleId: PLATFORM.moduleName('./components/scenario-editor/scenario-editor'), nav: true, title: 'Scenario' },
      { route: ['entities'], name: 'entities', moduleId: PLATFORM.moduleName('./components/entity-type-editor/entity-type-editor'), nav: true, title: 'Entities' },
      { route: ['properties'], name: 'properties', moduleId: PLATFORM.moduleName('./components/property-editor/property-editor'), nav: true, title: 'Properties' }
    ]);
  }

}
