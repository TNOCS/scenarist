import { computedFrom } from 'aurelia-binding';
import { pad } from './../utils/utils';
import { ITrackView } from 'models/track';
import { IPropertyView } from 'models/property';
import { FeatureViewModel } from './feature';
import { IModel, IdType } from './model';
import { clone, parseTime } from 'utils/utils';

/**
 * Actual track data object interface that will be persisted
 *
 * @export
 * @interface ITrack
 * @extends {IModel}
 */
export interface ITrack extends IModel {
  scenarioId: IdType;
  entityTypeId: number;
  features: Array<GeoJSON.Feature<GeoJSON.Point>>;
}

/**
 * View model interface of a track, so we can more easily manipulate it
 *
 * @export
 * @interface ITrackView
 * @extends {ITrack}
 */
export interface ITrackView extends ITrack {
  activeTimeIndex: string;
  activeFeature: FeatureViewModel;
  isVisible: boolean;
  isSelected: boolean;
  hasChanged: boolean;
  applyChanges(): ITrack;
  restore(): void;
  /**
   * Find the last keyframe index before the requested time
   * @param time
   */
  findLastKeyframe(startDate: Date, time: Date);
  /**
   * Add a new feature (keyframe)
   *
   * @param {Date} startDate : Start date of the scenario
   * @param {Date} [time] : Time of the new feature
   * @memberof ITrackView
   */
  addFeature(startDate: Date, time?: Date): void;
}

export class TrackViewModel implements ITrackView {
  public isVisible = true;
  public isSelected = false;
  public hasChanged = false;

  private pTitle: string;
  private pDescription: string;
  private pEntityTypeId: number;
  private pFeatures: FeatureViewModel[];
  private pActiveTimeIndex = '0';

  constructor(private track: ITrack) {
    this.restore();
  }

  public applyChanges() {
    this.track.title = this.pTitle;
    this.track.description = this.pDescription;
    for (let i = 0; i < this.pFeatures.length; i++) {
      const fromFeature = this.pFeatures[i];
      const toFeature = this.track.features[i];
      toFeature.geometry.coordinates = fromFeature.geometry.coordinates;
      const fromProperties = fromFeature.properties;
      if (!toFeature.properties) { toFeature.properties = {}; }
      for (const key in fromProperties) {
        if (!fromProperties.hasOwnProperty(key)) { continue; }
        toFeature.properties[key] = fromProperties[key];
      }
    }
    this.hasChanged = false;
    return this.track;
  }

  public restore() {
    this.pTitle = this.track.title;
    this.pDescription = this.track.description;
    this.pEntityTypeId = this.track.entityTypeId;
    this.pFeatures = this.track.features.map(f => new FeatureViewModel(f, this.featureHasChangedHandler));
    this.hasChanged = false;
  }

  public get id() { return this.track.id; }

  public get scenarioId() { return this.track.scenarioId; }

  /**
   * Active time index extracts the key frame.
   * It is a string, so I can bind it in the select options.
   *
   * @memberof TrackViewModel
   */
  public get activeTimeIndex() { return this.pActiveTimeIndex; }
  public set activeTimeIndex(i) { this.pActiveTimeIndex = `${i}`; }

  @computedFrom('pActiveTimeIndex', 'pFeatures')
  public get activeFeature(): FeatureViewModel {
    return this.pFeatures[this.pActiveTimeIndex];
  }

  public get title() { return this.pTitle; }
  public set title(t) {
    if (this.pTitle === t) { return; }
    this.pTitle = t;
    this.hasChanged = true;
  }

  public get description() { return this.pDescription; }
  public set description(d) {
    if (this.pDescription === d) { return; }
    this.pDescription = d;
    this.hasChanged = true;
  }

  public get entityTypeId() { return this.pEntityTypeId; }
  public set entityTypeId(e) {
    if (this.pEntityTypeId === e) { return; }
    this.pEntityTypeId = e;
    this.hasChanged = true;
  }

  public get features() { return this.pFeatures; }
  public set features(f) {
    if (this.pFeatures === f) { return; }
    this.pFeatures = f;
    this.hasChanged = true;
  }

  public addFeature(startDate: Date, time?: Date) {
    const index = time
      ? this.findLastKeyframe(startDate, time)
      : +this.activeTimeIndex;
    const newFeature = clone({ geometry: this.track.features[index].geometry, properties: this.track.features[index].properties || {} });
    if (!newFeature.properties.date) { newFeature.properties.date = startDate; }
    if (time) {
      newFeature.properties.date = new Date(new Date(time.valueOf()).setHours(0, 0, 0, 0));
      newFeature.properties.time = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    } else if (!newFeature.properties.time) {
      newFeature.properties.date = new Date(new Date(startDate.valueOf()).setHours(0, 0, 0, 0));
      newFeature.properties.time = '00:00';
    }
    this.track.features.splice(index, 0, newFeature);
    const fvm = new FeatureViewModel(newFeature, this.featureHasChangedHandler);
    this.features.splice(index, 0, fvm);
    this.activeTimeIndex = `${index + 1}`;
    return fvm;
  }

  /**
   * Find the last keyframe index before the requested time
   * @param time
   */
  public findLastKeyframe(startDate: Date, time: Date) {
    const t = time.valueOf();
    return this.track.features
      .reduce((p, c, i) => {
        const dt = t - parseTime(c.properties, startDate);
        return dt < 0 || p.dt < dt ? p : { dt, i };
      }, { dt: Number.MAX_VALUE, i: 0 }).i;
  }

  private featureHasChangedHandler(feature: FeatureViewModel) {
    this.hasChanged = true;
  }
}
