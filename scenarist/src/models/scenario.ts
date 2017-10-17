import { IModel } from './model';

export interface IScenario extends IModel {
  start?: { data: Date; time: Date };
  end?: { data: Date; time: Date };
  center?: { lat: number; lng: number; };
  zoom?: number;
  trackIds?: number[];
  layers?: {
    baseIds?;
    overlayIds?;
  };
}
