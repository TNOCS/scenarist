import { FeatureViewModel } from './feature';
import { IModel } from './model';

/**
 * Actual track data object interface that will be persisted
 *
 * @export
 * @interface ITrack
 * @extends {IModel}
 */
export interface ITrack extends IModel {
  entityTypeId: string;
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
}

export class TrackViewModel implements ITrackView {
  public isVisible = true;
  public isSelected = false;
  public hasChanged = false;

  public id: string | number;
  private pTitle: string;
  private pDescription: string;
  private pEntityTypeId: string;
  private pFeatures: Array<GeoJSON.Feature<GeoJSON.Point>>;

  constructor(private track: ITrack) {
    this.id = track.id;
    this.pTitle = track.title;
    this.pDescription = track.description;
    this.pEntityTypeId = track.entityTypeId;
    this.pFeatures = track.features.map(f => new FeatureViewModel(f, this.featureHasChangedHandler));
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

  private featureHasChangedHandler(feature: FeatureViewModel) {
    this.hasChanged = true;
  }
}
