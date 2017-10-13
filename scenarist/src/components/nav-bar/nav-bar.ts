import { EventAggregator } from 'aurelia-event-aggregator';
import { bindable, inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@inject(EventAggregator)
export class NavBarCustomElement {
  @bindable public router: Router;
  public activeScenarioLabel = '';
  // private sideNav: any;
  private sideNavVisible = true;

  constructor(private ea: EventAggregator) {}

  public attached() {
    // this.sideNav = ($('.button-collapse') as any).sideNav;
    // this.sideNav({
    //   menuWidth: 300, // Default is 300
    //   // edge: 'right', // Choose the horizontal origin
    //   closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    //   draggable: true // Choose whether you can drag to open on touch screens,
    //   // onOpen: function(el) { /* Do Stuff* / }, // A function to be called when sideNav is opened
    //   // onClose: function(el) { /* Do Stuff* / }, // A function to be called when sideNav is closed
    // });
    this.ea.subscribe('activeScenarioChanged', (data: { id: string | number, title: string }) => {
      this.activeScenarioLabel = data && data.title
        ? `${data.title} | `
        : '';
    });
  }

  public toggleMenu() {
    this.sideNavVisible = !this.sideNavVisible;
    // this.sideNav(this.sideNavVisible ? 'show' : 'hide');
    ($('.button-collapse') as any).sideNav('show');
  }


}
