import { IPropertyView } from 'models/property';
import { FeatureViewModel } from './feature';
import { IModel, IdType } from './model';
import { clone } from 'utils/utils';

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
  addFeature(): void;
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

  public get activeFeature() { return this.pFeatures[this.pActiveTimeIndex]; }

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

  public addFeature() {
    const newFeature = clone(this.track.features[this.track.features.length - 1]);
    this.track.features.push(newFeature);
    this.features.push(new FeatureViewModel(newFeature, this.featureHasChangedHandler));
    this.activeTimeIndex = `${this.features.length - 1}`;
  }

  private featureHasChangedHandler(feature: FeatureViewModel) {
    this.hasChanged = true;
  }
}
