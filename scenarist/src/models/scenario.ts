import { IModel } from './model';

export interface IScenario extends IModel {
  startTime?: Date;
  endTime?: Date;
  trackIds?: string[] | number[];
  layers?: {
    baseIds?;
    overlayIds?;
  };
}
