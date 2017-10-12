import { inject } from 'aurelia-framework';
import { IProperty } from './property';
import { IEntityType, IEntity } from './entity';
import { Endpoint, Rest } from 'aurelia-api';

@inject(Endpoint.of('db'))
export class State {
  public entityTypes: IEntityType[] = [];
  public entities: IEntity[] = [];
  public properties: IProperty[] = [];

  constructor(private rest: Rest) {
    this.rest.find('properties').then(pt => this.properties = pt);
    this.rest.find('entityTypes').then(et => this.entityTypes = et);
    this.rest.find('entities').then(et => this.entities = et);
  }
}
