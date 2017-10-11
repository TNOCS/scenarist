export interface IEntityType {
  id: number;
  title: string;
  description?: string;
  app6a?: string;
  imageUrl?: string;
  faction?: string;
  color?: string;
  propertyIds: string[];
}

export interface IEntity {
  id: number;
  entityId: string;
  title: string;
  callSign?: string;
  description?: string;
  properties?: { [propertyId: string]: string | number };
}
