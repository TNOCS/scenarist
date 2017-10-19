import { IModel } from './model';

export type PropertyType = {[key: string]: string | number | string[] | number[]};

export type InputType = 'number' | 'text' | 'textarea' | 'option' | 'time';

export interface IProperty extends IModel {
  propertyType: InputType;
  defaultValue?: string | number;
  unit?: string;
  options?: string[] | number[];
  /**
   * If true, do not delete this property in the editor.
   *
   * @type {boolean}
   * @memberof IProperty
   */
  isPermanent?: boolean;
}

export interface IPropertyView extends IProperty {
  value: any;
}
