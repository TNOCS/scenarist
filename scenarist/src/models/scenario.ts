import { IModel } from './model';

export interface IScenario extends IModel {
  start?: { data: Date; time: Date }
  end?: { data: Date; time: Date }
  trackIds?: string[] | number[];
  layers?: {
    baseIds?;
    overlayIds?;
  };
}
