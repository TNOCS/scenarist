import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';
import { IProperty } from './property';
import { IEntityType, IEntity } from './entity';
import { Endpoint, Rest } from 'aurelia-api';

@inject(Endpoint.of('db'), EventAggregator)
export class State {
  public entityTypes: IEntityType[] = [];
  public entities: IEntity[] = [];
  public properties: IProperty[] = [];

  constructor(private rest: Rest, private ea: EventAggregator) {
    this.rest.find('properties').then(pt => this.properties = pt).then(() => ea.publish('propertiesUpdated'));
    this.rest.find('entityTypes').then(et => this.entityTypes = et).then(() => ea.publish('entityTypesUpdated'));
    this.rest.find('entities').then(et => this.entities = et).then(() => ea.publish('entitiesUpdated'));
  }
}
