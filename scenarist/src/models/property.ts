export type PropertyType = 'number' | 'text' | 'textarea' | 'option';

export interface IProperty {
  id: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  defaultValue?: string | number;
  unit?: string;
  options?: string[] | number[];
}
