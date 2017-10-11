import { inject } from 'aurelia-framework';
import { Endpoint } from 'aurelia-api';
import 'fetch';

@inject(Endpoint.of('db'))
export class EntityEditor {
  public entities;
  private dbEndpoint;

  constructor(dbEndpoint) {
    this.dbEndpoint = dbEndpoint;
  }

  public activate() {
    return this.dbEndpoint.find('entities')
      .then(entities => this.entities = entities);
  }
}
