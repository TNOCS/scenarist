import { ITrack } from './track';
import { IModel, IdType } from './model';

export interface IScenario extends IModel {
  /**
   * Name given to an external service when playing the scenario.
   *
   * @type {string}
   * @memberof IScenario
   */
  simTitle?: string;
  start?: { date: Date | string; time: Date | string };
  end?: { date: Date | string; time: Date | string };
  center?: { lat: number; lng: number; };
  zoom?: number;
  trackIds?: number[];
  tracks?: ITrack[];
  layers?: {
    baseIds?: Array<IdType>;
    overlayIds?: Array<IdType>;
  };
}
