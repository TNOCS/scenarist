import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';

@inject(EventAggregator)
export class PlayerGUI {
  public showControls = true;

  constructor(private ea: EventAggregator) {}

  public attached() {
    
  }
  
}
