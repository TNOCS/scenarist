import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';

@inject(EventAggregator)
export class PlayerControlsCustomElement {

  constructor(private ea: EventAggregator) {}

  public attached() {
      
  }

}
