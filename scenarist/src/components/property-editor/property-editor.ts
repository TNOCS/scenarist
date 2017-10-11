import { IPropertyType } from './../../models/property';
import { inject } from 'aurelia-framework';
import { Endpoint, Rest } from 'aurelia-api';
import 'fetch';

@inject(Endpoint.of('db'))
export class PropertyEditorCustomElement {
  public properties: IPropertyType[];
  public activeProperty: IPropertyType;
  public showPropertyEditor = false;

  private rest: Rest;

  constructor(rest) {
    this.rest = rest;
    console.log(this.rest.defaults);
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
    console.log('Delete property clicked');
  }

  public saveProperty() {
    if (this.activeProperty.id) {
      this.rest
        .update('properties', this.activeProperty.id, this.activeProperty)
        .then(console.log)
        .catch(console.error);
    } else {
      this.rest
        .post('properties', this.activeProperty)
        .then(prop => this.activeProperty = prop)
        .catch(console.error);
    }
  }

}
