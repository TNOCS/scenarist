import { EventAggregator } from 'aurelia-event-aggregator';
import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { inject } from 'aurelia-framework';
import { Endpoint, Rest } from 'aurelia-api';
// import 'fetch';
import { MdToastService } from 'aurelia-materialize-bridge';

@inject(State, Endpoint.of('db'), MdToastService, EventAggregator)
export class EntityTypeEditorCustomElement {
  public entityTypes: IEntityType[];
  public activeEntityType: IEntityType;
  public showEntityTypeEditor = false;
  private api = 'entityTypes';

  constructor(private state: State, private rest: Rest, private toast: MdToastService, private ea: EventAggregator) {}

  public attached() {
    this.entityTypes = this.state.entityTypes;
    this.ea.subscribe('entityTypesUpdated', () => this.entityTypes = this.state.entityTypes);
  }

  public selectEntityType(selected: IEntityType) {
    this.activeEntityType = this.activeEntityType === selected ? null : selected;
    this.showEntityTypeEditor = this.activeEntityType ? true : null;
  }

  public addEntityType() {
    this.activeEntityType = {} as IEntityType;
    this.showEntityTypeEditor = true;
    this.entityTypes.push(this.activeEntityType);
  }

  public deleteEntityType() {
    const index = this.entityTypes.indexOf(this.activeEntityType);
    if (index < 0) { return console.warn('Cannot find entity type! Ignoring.'); }
    this.rest
      .destroy(this.api, this.activeEntityType.id)
      .then(() => {
        this.entityTypes.splice(index, 1);
        this.activeEntityType = null;
        this.showEntityTypeEditor = false;
        this.toastMessage('Delete successfull.');
      })
      .catch(m => this.toastMessage('Error deleting entity type!\n' + m, true));
  }

  public saveEntityType() {
    if (this.activeEntityType.id) {
      this.rest
        .update(this.api, this.activeEntityType.id, this.activeEntityType)
        .then(() => this.toastMessage('Update successfull.'))
        .catch(m => this.toastMessage('Error updating entity type!\n' + m, true));
    } else {
      this.rest
        .post(this.api, this.activeEntityType)
        .then(prop => {
          this.activeEntityType = prop;
          this.toastMessage('Created successfully.');
        })
        .catch(m => this.toastMessage('Error creating entity type!\n' + m, true));
    }
  }

  private toastMessage(msg: string, isError = false) {
    this.toast.show(msg, isError ? 2000 : 4000, isError ? 'red' : 'green');
  }

}
