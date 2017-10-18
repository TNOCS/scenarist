import { IModel } from './model';
export type PropertyType = 'number' | 'text' | 'textarea' | 'option';

export interface IProperty extends IModel {
  propertyType: PropertyType;
  defaultValue?: string | number;
  unit?: string;
  options?: string[] | number[];
}

export interface IPropertyView extends IProperty {
  value: any;
}
