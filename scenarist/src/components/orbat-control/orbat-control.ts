import { IScenario } from './../../models/scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { State } from './../../models/state';
import { autoinject } from 'aurelia-framework';
import { ITrackView } from 'models/track';

@autoinject
export class OrbatControlCustomElement {
  public scenario: IScenario;
  public tracks: ITrackView[];

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.scenario = this.state.scenario;
    if (!this.scenario) { return; }
    this.tracks = this.state.tracks
      .filter(t => this.scenario.trackIds.includes(t.id as number))
      .map((t: ITrackView) => {
        t.isVisible = true;
        return t;
      });
  }

  public toggleVisibility(track: ITrackView) {
    track.isVisible = !track.isVisible;
    this.ea.publish('trackVisibilityChanged', track);
  }
}
