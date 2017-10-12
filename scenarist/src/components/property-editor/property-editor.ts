import { EventAggregator } from 'aurelia-event-aggregator';
import { State } from './../../models/state';
import { IProperty } from './../../models/property';
import { inject } from 'aurelia-framework';
import { Endpoint, Rest } from 'aurelia-api';
// import 'fetch';
import { MdToastService } from 'aurelia-materialize-bridge';

@inject(State, Endpoint.of('db'), MdToastService, EventAggregator)
export class PropertyEditorCustomElement {
  public properties: IProperty[];
  public activeProperty: IProperty;
  public showPropertyEditor = false;
  private api = 'properties';

  constructor(private state: State, private rest: Rest, private toast: MdToastService, private ea: EventAggregator) {}

  public attached() {
    this.properties = this.state.properties;
    this.ea.subscribe('propertiesUpdated', () => this.properties = this.state.properties);
  }

  public selectProperty(selected: IProperty) {
    this.activeProperty = this.activeProperty === selected ? null : selected;
    this.showPropertyEditor = this.activeProperty ? true : null;
  }

  public addProperty() {
    this.activeProperty = {} as IProperty;
    this.showPropertyEditor = true;
    this.properties.push(this.activeProperty);
  }

  public deleteProperty() {
    const index = this.properties.indexOf(this.activeProperty);
    if (index < 0) { return console.warn('Cannot find property! Ignoring.'); }
    this.rest
      .destroy(this.api, this.activeProperty.id)
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
        .update(this.api, this.activeProperty.id, this.activeProperty)
        .then(() => this.toastMessage('Update successfull.'))
        .catch(m => this.toastMessage('Error updating property!\n' + m, true));
    } else {
      this.rest
        .post(this.api, this.activeProperty)
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
