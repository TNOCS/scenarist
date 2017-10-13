import { EventAggregator } from 'aurelia-event-aggregator';
import { State, ModelType } from './../../models/state';
import { IProperty } from './../../models/property';
import { inject } from 'aurelia-framework';

@inject(State, EventAggregator)
export class PropertyEditorCustomElement {
  public properties: IProperty[];
  public activeProperty: IProperty;
  public showPropertyEditor = false;
  private modelType: ModelType = 'entityTypes';

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.properties = this.state.properties;
    this.ea.subscribe(`${this.modelType}Updated`, (prop: IProperty) => {
      this.properties = this.state.properties;
      if (prop) { this.activeProperty = this.properties.filter(p => p.id === prop.id)[0]; }
    });
  }

  public selectProperty(selected: IProperty) {
    this.activeProperty = this.activeProperty === selected ? null : selected;
    this.showPropertyEditor = this.activeProperty ? true : null;
  }

  public addProperty() {
    this.activeProperty = {} as IProperty;
    this.showPropertyEditor = true;
    this.state.save(this.modelType, this.activeProperty);
  }

  public deleteProperty() {
    this.showPropertyEditor = false;
    this.state.delete(this.modelType, this.activeProperty);
  }

  public saveProperty() {
    this.state.save(this.modelType, this.activeProperty);
  }
}
