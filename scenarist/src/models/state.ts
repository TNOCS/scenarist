import { IModel } from './model';
import { IScenario } from './scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';
import { IProperty } from './property';
import { IEntityType } from './entity';
import { Endpoint, Rest } from 'aurelia-api';
import { MdToastService } from 'aurelia-materialize-bridge';
import { ILayerDefinition } from 'models/layer';

export type ModelType = 'properties' | 'entityTypes' | 'scenarios' | 'baseLayers';

@inject(Endpoint.of('db'), MdToastService, EventAggregator)
export class State {
  private store: {
    activeScenarioId: string | number;
    entityTypes: IEntityType[];
    properties: IProperty[];
    scenarios: IScenario[];
    baseLayers: ILayerDefinition[];
  } = {
    activeScenarioId: null,
    entityTypes: [],
    properties: [],
    scenarios: [],
    baseLayers: []
  };

  public get entityTypes() { return this.store.entityTypes.map(this.clone) as IEntityType[]; }
  public get properties() { return this.store.properties.map(this.clone) as IProperty[]; }
  public get scenarios() { return this.store.scenarios.map(this.clone) as IScenario[]; }
  public get baseLayers() { return this.store.baseLayers.map(this.clone) as ILayerDefinition[]; }

  public get activeScenarioId() { return this.store.activeScenarioId; }
  public set activeScenarioId(id: string | number) {
    this.store.activeScenarioId = id;
    if (id) {
      const s = this.store.scenarios.filter(s => s.id === id)[0];
      this.ea.publish('activeScenarioChanged', s);
    } else {
      this.ea.publish('activeScenarioChanged', null);
    }
  }

  constructor(private rest: Rest, private toast: MdToastService, private ea: EventAggregator) {
    this.rest.find('properties').then(p => this.store.properties = p).then(() => ea.publish('propertiesUpdated'));
    this.rest.find('entityTypes').then(et => this.store.entityTypes = et).then(() => ea.publish('entityTypesUpdated'));
    // this.rest.find('entities').then(e => this.entities = e).then(() => ea.publish('entitiesUpdated'));
    this.rest.find('scenarios').then(s => this.store.scenarios = s).then(() => ea.publish('scenariosUpdated'));
    this.rest.find('baseLayers').then(l => this.store.baseLayers = l).then(() => ea.publish('baseLayersUpdated'));
  }

  public getModel(modelType: ModelType) {
    return (this.store[modelType] as IModel[]).map(this.clone);
  }

  public save(modelType: ModelType, model: IModel) {
    if (model.id) {
      this.update(modelType, model);
    } else {
      this.create(modelType, model);
    }
  }

  public delete(modelType: ModelType, model: IModel) {
    const selected = this.store[modelType] as IModel[];
    const index = selected.indexOf(selected.filter(m => m.id === model.id)[0]);
    if (index < 0) { return console.warn(`Cannot find ${modelType}! Ignoring.`); }
    this.rest
      .destroy(modelType, model.id)
      .then(() => {
        selected.splice(index, 1);
        model = null;
        this.ea.publish(`${modelType}Updated`, null);
        this.toastMessage('Deleted successfully.');
      })
      .catch(m => this.toastMessage(`Error deleting ${modelType}!\n` + m, true));
  }

  private create(modelType: ModelType, model: IModel) {
    this.rest
      .post(modelType, model)
      .then((created: IModel) => {
        this.toastMessage('Created successfully.');
        (this.store[modelType] as IModel[]).push(created);
        this.ea.publish(`${modelType}Updated`, created);
      })
      .catch(m => this.toastMessage(`Error creating ${modelType}!\n` + m, true));
  }

  private update(modelType: ModelType, model: IModel) {
    const selected = this.store[modelType] as IModel[];
    const index = selected.indexOf(selected.filter(m => m.id === model.id)[0]);
    if (index < 0) { return console.warn(`Cannot find ${modelType}! Ignoring.`); }
    this.rest
      .update(modelType, model.id, model)
      .then((updated: IModel) => {
        this.toastMessage('Updated successfully.');
        (this.store[modelType] as IModel[]).splice(index, 1, model);
        this.ea.publish(`${modelType}Updated`, updated);
      })
      .catch(m => this.toastMessage(`Error updating ${modelType}!\n` + m, true));
  }

  private toastMessage(msg: string, isError = false) {
    this.toast.show(msg, isError ? 2000 : 4000, isError ? 'red' : 'green');
  }

  private clone(model: IModel) { return JSON.parse(JSON.stringify(model)); }
}
