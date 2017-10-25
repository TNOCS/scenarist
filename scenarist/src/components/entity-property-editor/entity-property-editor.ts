import { computedFrom } from 'aurelia-binding';
import { IEntityType } from 'models/entity';
import { IScenario } from 'models/scenario';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { State } from 'models/state';
import { autoinject, bindable } from 'aurelia-framework';
import { ITrackView } from 'models/track';
import { IProperty, IPropertyView } from 'models/property';
import { clone } from 'utils/utils';
import { FeatureViewModel } from 'models/feature';

@autoinject
export class EntityPropertyEditorCustomElement {
  @bindable public tracks: ITrackView[];
  public selectedTracks: ITrackView[] = [];
  public track: ITrackView;
  public activePage = 1;
  public scenario: IScenario;
  private entityTypes: IEntityType[];
  private properties: IProperty[];
  private subscriptions: Subscription[] = [];

  constructor(private state: State, private ea: EventAggregator) { }

  public get activeFeature(): FeatureViewModel {
    return this.track ? this.track.activeFeature : null;
  }
  public set activeFeature(v: FeatureViewModel) {
    this.track.activeTimeIndex = '' + this.track.features.indexOf(v);
  }

  public get activeTimeIndex(): number { return this.track ? +this.track.activeTimeIndex : 0; }
  public set activeTimeIndex(v: number) { this.track.activeTimeIndex = '' + v; }

  public attached() {
    this.subscriptions.push(this.ea.subscribe('trackSelectionChanged', (track: ITrackView) => this.trackSelectionChanged(track)));
    this.scenario = this.state.scenario;
    this.entityTypes = this.state.entityTypes;
    this.properties = this.state.properties;
    ($('.tooltipped') as any).tooltip({ delay: 50 });
  }

  public detached() {
    this.subscriptions.forEach(s => s.dispose());
  }

  public createEntityViewModel(featureIndex: string, track: ITrackView) {
    if (!track) { return; }
    const et = this.entityTypes.filter(e => e.id === track.entityTypeId).shift();
    if (!et) { return; }
    const f = track.features[+featureIndex];
    if (!f) { return; }
    if (!f.properties) { f.properties = {}; }
    const props = this.properties
      .filter(p => et.propertyIds.includes(p.id))
      .map(p => {
        const pv = clone(p) as IPropertyView;
        pv.value = f.properties.hasOwnProperty(p.id) && f.properties[p.id]
          ? f.properties[p.id]
          : p.defaultValue;
        f.properties[p.id] = pv.value;
        return pv;
      });
    return props;
  }

  public save(track: ITrackView) {
    const t = track.applyChanges();
    if (t) { this.state.save('tracks', t); }
  }

  public add(track: ITrackView, time?: Date) {
    const startDate = typeof this.scenario.start.date === 'string'
      ? new Date(Date.parse(this.scenario.start.date))
      : this.scenario.start.date;
    track.addFeature(startDate, time);
    this.activeFeature = this.track.features[this.track.activeTimeIndex];
    this.keyframesUpdated(track);
  }

  public get activeDate() {
    if (!this.activeFeature) { return null; }
    const date = this.activeFeature.properties.date.value;
    return typeof date === 'string' ? new Date(Date.parse(date)) : date as Date;
  }
  public set activeDate(date: Date) {
    this.activeFeature.properties.date.value = date.toISOString();
    this.keyframesUpdated(this.track);
  }

  public keyframesUpdated(track: ITrackView) {
    this.ea.publish('keyframesUpdated', track);
  }

  public timeIndexChanged(track: ITrackView) {
    track.activeTimeIndex = '' + track.features.indexOf(this.activeFeature);
    this.ea.publish('timeIndexChanged', track);
  }

  public delete(track: ITrackView) {
    this.ea.publish('deleteTrack', track);
  }

  public restore(track: ITrackView) {
    track.restore();
  }

  public onPageChanged(e: { detail: number }) {
    if (this.selectedTracks.length === 0) {
      this.track = null;
      this.activeFeature = null;
    } else {
      this.track = this.selectedTracks[Math.min(this.selectedTracks.length, e.detail) - 1];
      this.activeFeature = this.track.features[this.track.activeTimeIndex];
    }
  }

  private trackSelectionChanged(track: ITrackView) {
    if (track.isSelected) {
      this.activePage = this.selectedTracks.push(track);
    } else {
      const index = this.selectedTracks.indexOf(track);
      if (index < 0) { return; }
      this.selectedTracks.splice(index, 1);
      this.activePage = 1;
    }
    setTimeout(() => {
      this.track = this.selectedTracks.length === 0 ? null : this.selectedTracks[this.activePage - 1];
      this.activeFeature = this.track ? this.track.features[this.track.activeTimeIndex] : null;
    });
  }
}
