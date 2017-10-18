import { IModel } from './model';

export interface IScenario extends IModel {
  start?: { date: string; time: string };
  end?: { date: string; time: string };
  center?: { lat: number; lng: number; };
  zoom?: number;
  trackIds?: string[] | number[];
  layers?: {
    baseIds?;
    overlayIds?;
  };
}
