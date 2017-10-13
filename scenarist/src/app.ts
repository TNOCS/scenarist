import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  public router: Router;

  public configureRouter(config: RouterConfiguration, router: Router) {
    this.router = router;

    config.title = 'Scenarist';
    config.map([
      { route: ['', 'home'], name: 'welcome', moduleId: PLATFORM.moduleName('./components/scenario-metadata-editor/scenario-metadata-editor'), nav: true, title: 'Home' },
      { route: ['scenario'], name: 'scenario', moduleId: PLATFORM.moduleName('./components/scenario-editor/scenario-editor'), nav: true, title: 'Scenario' },
      { route: ['entities'], name: 'entities', moduleId: PLATFORM.moduleName('./components/entity-type-editor/entity-type-editor'), nav: true, title: 'Entities' },
      { route: ['properties'], name: 'properties', moduleId: PLATFORM.moduleName('./components/property-editor/property-editor'), nav: true, title: 'Properties' }
    ]);
  }

}
