import { IModel } from './model';

export type PropertyType = {[key: string]: string | number | string[] | number[]};

export type InputType = 'number' | 'text' | 'textarea' | 'option';

export interface IProperty extends IModel {
  propertyType: InputType;
  defaultValue?: string | number;
  unit?: string;
  options?: string[] | number[];
}

export interface IPropertyView extends IProperty {
  value: any;
}
