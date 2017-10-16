import { EventAggregator } from 'aurelia-event-aggregator';
import { State, ModelType } from './../../models/state';
import { IProperty } from './../../models/property';
import { inject } from 'aurelia-framework';

@inject(State, EventAggregator)
export class PlayerControlsCustomElement {

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
      
  }

}
