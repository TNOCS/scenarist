import { IModel } from './model';

export interface IEntityType extends IModel {
  app6a?: string;
  imgDataUrl?: string;
  /**
   * The APP6B, MIL-STD-2525C or MIL-STD-2525D code.
   * See https://www.spatialillusions.com/unitgenerator.html
   *
   * @type {string}
   * @memberof IEntityType
   */
  sidc?: string;
  color?: string;
  propertyIds: string[];
}

export interface IEntity {
  id: string | number;
  entityId: string;
  title: string;
  callSign?: string;
  description?: string;
  properties?: { [propertyId: string]: string | number };
}
