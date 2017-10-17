import { IModel } from './model';

export interface ITrack extends IModel {
  entityTypeId: string | number;
  features: Array<GeoJSON.Feature<GeoJSON.Point>>;
}
