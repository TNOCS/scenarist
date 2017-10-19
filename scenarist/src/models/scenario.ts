import { ITrack } from './track';
import { IModel, IdType } from './model';

export interface IScenario extends IModel {
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
