import { IScenario } from './../../models/scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { State } from './../../models/state';
import { autoinject, bindable } from 'aurelia-framework';
import { ITrackView } from 'models/track';

@autoinject
export class EntityPropertyEditorCustomElement {
  @bindable public tracks: ITrackView[];
  public scenario: IScenario;

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.scenario = this.state.scenario;
  }

  public toggleVisibility(track: ITrackView) {
    track.isVisible = !track.isVisible;
    this.ea.publish('trackVisibilityChanged', track);
  }
}
