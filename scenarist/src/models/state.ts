import { ITrack } from './track';
import { IModel, IdType } from './model';
import { IScenario } from './scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-framework';
import { IProperty } from './property';
import { IEntityType } from './entity';
import { Endpoint, Rest } from 'aurelia-api';
import { MdToastService } from 'aurelia-materialize-bridge';
import { ILayerDefinition } from 'models/layer';
import { clone } from 'utils/utils';

export type ModelType = 'properties' | 'entityTypes' | 'scenarios' | 'baseLayers' | 'tracks';

@inject(Endpoint.of('db'), MdToastService, EventAggregator)
export class State {
  private pScenario: IScenario;
  private store: {
    activeScenarioId: IdType;
    entityTypes: IEntityType[];
    properties: IProperty[];
    scenarios: IScenario[];
    baseLayers: ILayerDefinition[];
    overLayers: ILayerDefinition[];
    /**
     * Tracks that are part of the active scenario.
     *
     * @type {ITrack[]}
     */
    tracks: ITrack[];
  } = {
      activeScenarioId: null,
      entityTypes: [],
      properties: [],
      scenarios: [],
      baseLayers: [],
      overLayers: [],
      tracks: []
    };

  private defaultProperties: IProperty[] = [{
    id: 'time',
    title: 'Time',
    description: 'Keyframe time',
    propertyType: 'time',
    isPermanent: true
  }];
  public get entityTypes() { return this.store.entityTypes.map(clone) as IEntityType[]; }
  public get properties() { return this.store.properties.map(clone) as IProperty[]; }
  public get scenarios() { return this.store.scenarios.map(clone) as IScenario[]; }
  public get baseLayers() { return this.store.baseLayers.map(clone) as ILayerDefinition[]; }
  public get overLayers() { return this.store.overLayers.map(clone) as ILayerDefinition[]; }
  public get tracks() { return this.store.tracks.map(clone) as ITrack[]; }

  public get activeScenarioId() { return this.store.activeScenarioId; }
  public set activeScenarioId(id: IdType) {
    this.store.activeScenarioId = id;
    if (id) {
      this.rest.findOne('scenarios', id, { '_embed': 'tracks' }).then((s) => {
        this.pScenario = s;
        this.store.tracks = s.tracks;
        delete s.tracks;
        this.ea.publish('activeScenarioChanged', this.scenario);
      });
    } else {
      this.ea.publish('activeScenarioChanged', null);
    }
  }

  /**
   * Get (a copy of) the active scenario
   */
  public get scenario() {
    return this.pScenario ? clone(this.pScenario) : null;
  }

  constructor(private rest: Rest, private toast: MdToastService, private ea: EventAggregator) {
    this.rest.find('properties').then(p => this.store.properties = [...this.defaultProperties, ...p]).then(() => ea.publish('propertiesUpdated'));
    this.rest.find('entityTypes').then(et => this.store.entityTypes = et).then(() => ea.publish('entityTypesUpdated'));
    // this.rest.find('entities').then(e => this.entities = e).then(() => ea.publish('entitiesUpdated'));
    this.rest.find('scenarios').then(s => this.store.scenarios = s).then(() => ea.publish('scenariosUpdated'));
    this.rest.find('baseLayers').then(l => this.store.baseLayers = l).then(() => ea.publish('baseLayersUpdated'));
    this.rest.find('overLayers').then(l => this.store.overLayers = l).then(() => ea.publish('overLayersUpdated'));
    // TODO Do not load all tracks, only the ones that are associated with the current scenario!
    // this.rest.find('tracks').then(t => this.store.tracks = t).then(() => ea.publish('tracksUpdated'));
  }

  public getModel(modelType: ModelType) {
    return (this.store[modelType] as IModel[]).map(clone);
  }

  public save(modelType: ModelType, model: IModel, callback?: (model: IModel) => void) {
    if (model.id) {
      this.update(modelType, model, callback);
    } else {
      this.create(modelType, model, callback);
    }
  }

  public delete(modelType: ModelType, model: IModel, callback?: (model: IModel) => void) {
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
        if (callback) { callback(model); }
      })
      .catch(m => this.toastMessage(`Error deleting ${modelType}!\n` + m, true));
  }

  private create(modelType: ModelType, model: IModel, callback?: (model: IModel) => void) {
    this.rest
      .post(modelType, model)
      .then((created: IModel) => {
        (this.store[modelType] as IModel[]).push(created);
        if (modelType === 'tracks') {
          this.addTrackToScenario(created as ITrack);
        } else {
          this.toastMessage('Created successfully.');
        }
        this.ea.publish(`${modelType}Updated`, created);
        if (callback) { callback(created); }
      })
      .catch(m => this.toastMessage(`Error creating ${modelType}!\n` + m, true));
  }

  private update(modelType: ModelType, model: IModel, callback?: (model: IModel) => void) {
    const selected = this.store[modelType] as IModel[];
    const index = selected.indexOf(selected.filter(m => m.id === model.id)[0]);
    if (index < 0) { return console.warn(`Cannot find ${modelType}! Ignoring.`); }
    this.rest
      .update(modelType, model.id, model)
      .then((updated: IModel) => {
        this.toastMessage('Updated successfully.');
        (this.store[modelType] as IModel[]).splice(index, 1, model);
        this.ea.publish(`${modelType}Updated`, updated);
        if (callback) { callback(updated); }
      })
      .catch(m => this.toastMessage(`Error updating ${modelType}!\n` + m, true));
  }

  private addTrackToScenario(track: ITrack) {
    if (!this.pScenario) { return; }
    this.pScenario.trackIds.push(track.id as number);
    this.save('scenarios', this.pScenario);
  }

  private toastMessage(msg: string, isError = false) {
    this.toast.show(msg, isError ? 2000 : 4000, isError ? 'red' : 'green');
  }
}
