import { IModel } from './model';
import { PointExpression } from 'leaflet';

export interface IEntityType extends IModel {
  app6a?: string;
  imgDataUrl?: string;
  /**
   * Icon width and height.
   *
   * @type {PointExpression}
   * @memberof IEntityType
   */
  iconSize: PointExpression;
  /**
   * The APP6B, MIL-STD-2525C or MIL-STD-2525D code.
   * See https://www.spatialillusions.com/unitgenerator.html
   *
   * @type {string}
   * @memberof IEntityType
   */
  sidc?: string;
  color?: string;
  propertyIds: Array<string | number>;
}

export interface IEntity {
  id: string | number;
  entityId: string;
  title: string;
  callSign?: string;
  description?: string;
  properties?: { [propertyId: string]: string | number };
}
