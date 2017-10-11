import { IProperty } from './property';
import { IEntityType, IEntity } from './entity';

export class State {
  public entityTypes: IEntityType[] = [];
  public entities: IEntity[] = [];
  public properties: IProperty[] = [];
}
