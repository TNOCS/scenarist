import { IModel } from './model';

export type IdType = string | number;
export interface ITrack extends IModel {
  scenarioId: IdType;
  entityTypeId: number;
  features: Array<GeoJSON.Feature<GeoJSON.Point>>;
}

export interface IScenario extends IModel {
  simTitle?: string;
  start?: { date: Date; time: Date };
  end?: { date: Date; time: Date };
  center?: { lat: number; lng: number; };
  zoom?: number;
  trackIds?: number[];
  tracks?: ITrack[];
  layers?: {
    baseIds?: Array<IdType>;
    overlayIds?: Array<IdType>;
  };
}