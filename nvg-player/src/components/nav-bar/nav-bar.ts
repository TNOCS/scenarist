import { bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';

export class NavBarCustomElement {
  @bindable public router: Router;
  private sideNav: any;
  private sideNavVisible = true;

  public attached() {
    this.sideNav = ($('.button-collapse') as any).sideNav;
    this.sideNav({
      menuWidth: 300, // Default is 300
      // edge: 'right', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens,
      // onOpen: function(el) { /* Do Stuff* / }, // A function to be called when sideNav is opened
      // onClose: function(el) { /* Do Stuff* / }, // A function to be called when sideNav is closed
    }
    );
  }

  public toggleMenu() {
    this.sideNavVisible = !this.sideNavVisible;
    // this.sideNav(this.sideNavVisible ? 'show' : 'hide');
    ($('.button-collapse') as any).sideNav('show');
  }


}
