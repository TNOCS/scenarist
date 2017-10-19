import { IPropertyView } from 'models/property';
import { FeatureViewModel } from './feature';
import { IModel, IdType } from './model';

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
  isVisible: boolean;
  isSelected: boolean;
  hasChanged: boolean;
  applyChanges(): ITrack;
  restore(): void;
}

export class TrackViewModel implements ITrackView {
  public isVisible = true;
  public isSelected = false;
  public hasChanged = false;

  private pTitle: string;
  private pDescription: string;
  private pEntityTypeId: number;
  private pFeatures: Array<GeoJSON.Feature<GeoJSON.Point>>;

  constructor(private track: ITrack) {
    this.restore();
  }

  public applyChanges() {
    this.track.title = this.pTitle;
    this.track.description = this.pDescription;
    const fromFeature = this.pFeatures[0];
    const toFeature = this.track.features[0];
    if (!fromFeature || !toFeature) { return; }
    const props: { [key: string]: IPropertyView } = fromFeature.properties;
    if (!toFeature.properties) { toFeature.properties = {}; }
    for (const key in props) {
      if (!props.hasOwnProperty(key)) { continue; }
      const prop = props[key];
      toFeature.properties[prop.id] = prop.value;
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

  private featureHasChangedHandler(feature: FeatureViewModel) {
    this.hasChanged = true;
  }
}
