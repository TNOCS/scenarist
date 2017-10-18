import { IEntityType } from 'models/entity';
import { IScenario } from 'models/scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { State } from 'models/state';
import { autoinject, bindable } from 'aurelia-framework';
import { ITrackView } from 'models/track';
import { IProperty, IPropertyView } from 'models/property';
import { clone } from 'utils/utils';

@autoinject
export class EntityPropertyEditorCustomElement {
  @bindable public tracks: ITrackView[];
  public scenario: IScenario;
  private entityTypes: IEntityType[];
  private properties: IProperty[];

  constructor(private state: State, private ea: EventAggregator) { }

  public attached() {
    this.scenario = this.state.scenario;
    this.entityTypes = this.state.entityTypes;
    this.properties = this.state.properties;
  }

  public createEntityViewModel(track: ITrackView) {
    const et = this.entityTypes.filter(e => e.id === track.entityTypeId).shift();
    if (!et) { return; }
    const f = track.features[0];
    const props = this.properties
      .filter(p => et.propertyIds.includes(p.id))
      .map(p => {
        const pv = clone(p) as IPropertyView;
        pv.value = f && f.properties && f.properties.hasOwnProperty(p.id)
          ? f.properties[p.id]
          : p.defaultValue;
        return pv;
      });
    f.properties = props;
    return props;
  }

  public save(track: ITrackView) {
    const t = track.applyChanges();
    if (t) { this.state.save('tracks', t); }
  }

  public restore(track: ITrackView) {
    track.restore();
  }
}
