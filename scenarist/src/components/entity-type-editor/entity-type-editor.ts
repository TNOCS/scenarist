import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { IEntityType } from './../../models/entity';
import { State, ModelType } from './../../models/state';
import { inject } from 'aurelia-framework';

@inject(State, EventAggregator)
export class EntityTypeEditorCustomElement {
  public entityTypes: IEntityType[];
  public activeEntityType: IEntityType;
  public showEntityTypeEditor = false;
  private modelType: ModelType = 'entityTypes';
  private subscriptions: Subscription[] = [];

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.entityTypes = this.state.entityTypes;
    this.subscriptions.push(this.ea.subscribe(`${this.modelType}Updated`, (et: IEntityType) => {
      this.entityTypes = this.state.entityTypes;
      if (et) { this.activeEntityType = this.entityTypes.filter(e => e.id === et.id)[0]; }
    }));
  }

  public detached() {
    this.subscriptions.forEach(s => s.dispose());
  }

  public selectEntityType(selected: IEntityType) {
    this.activeEntityType = this.activeEntityType === selected ? null : selected;
    this.showEntityTypeEditor = this.activeEntityType ? true : null;
  }

  public addEntityType() {
    this.activeEntityType = {} as IEntityType;
    this.showEntityTypeEditor = true;
    this.state.save(this.modelType, this.activeEntityType);
  }

  public deleteEntityType() {
    this.showEntityTypeEditor = false;
    this.state.delete(this.modelType, this.activeEntityType);
  }

  public saveEntityType() {
    this.state.save(this.modelType, this.activeEntityType);
  }

}
