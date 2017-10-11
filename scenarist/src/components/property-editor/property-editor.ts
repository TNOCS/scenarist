import { IPropertyType } from './../../models/property';
import { inject } from 'aurelia-framework';
import { Endpoint, Rest } from 'aurelia-api';
// import 'fetch';
import { MdToastService } from 'aurelia-materialize-bridge';

@inject(Endpoint.of('db'), MdToastService)
export class PropertyEditorCustomElement {
  public properties: IPropertyType[];
  public activeProperty: IPropertyType;
  public showPropertyEditor = false;

  private rest: Rest;
  private toast;

  constructor(rest: Rest, toast) {
    this.rest = rest;
    this.toast = toast;
  }

  public attached() {
    return this.rest.find('properties')
      .then(pt => this.properties = pt);
  }

  public selectProperty(selected: IPropertyType) {
    this.activeProperty = this.activeProperty === selected ? null : selected;
    this.showPropertyEditor = this.activeProperty ? true : null;
    console.log('Select property clicked');
  }

  public addProperty() {
    this.activeProperty = {} as IPropertyType;
    this.showPropertyEditor = true;
    this.properties.push(this.activeProperty);
    console.log('Add property clicked');
  }

  public deleteProperty() {
    const index = this.properties.indexOf(this.activeProperty);
    if (index < 0) { return console.warn('Cannot find property! Ignoring.'); }
    this.rest
      .destroy('properties', this.activeProperty.id)
      .then(() => {
        this.properties.splice(index, 1);
        this.activeProperty = null;
        this.showPropertyEditor = false;
        this.toastMessage('Delete successfull.');
      })
      .catch(m => this.toastMessage('Error deleting property!\n' + m, true));
  }

  public saveProperty() {
    if (this.activeProperty.id) {
      this.rest
        .update('properties', this.activeProperty.id, this.activeProperty)
        .then(() => this.toastMessage('Update successfull.'))
        .catch(m => this.toastMessage('Error updating property!\n' + m, true));
    } else {
      this.rest
        .post('properties', this.activeProperty)
        .then(prop => {
          this.activeProperty = prop;
          this.toastMessage('Created successfully.');
        })
        .catch(m => this.toastMessage('Error creating property!\n' + m, true));
    }
  }

  private toastMessage(msg: string, isError = false) {
    this.toast.show(msg, isError ? 2000 : 4000, isError ? 'red' : 'green');
  }

}
