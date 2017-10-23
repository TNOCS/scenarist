import { IScenario } from './../../models/scenario';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { State, ModelType } from './../../models/state';
import { inject } from 'aurelia-framework';
import { ILayerDefinition } from 'models/layer';
import { computedFrom } from 'aurelia-binding';

@inject(State, EventAggregator)
export class ScenarioMetadataEditor {
  public scenarios: IScenario[];
  public baseLayers: ILayerDefinition[];
  public overLayers: ILayerDefinition[];
  public activeScenario: IScenario;
  public showScenarioSelector = false;
  private modelType: ModelType = 'scenarios';
  private subscriptions: Subscription[] = [];

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.subscriptions.push(this.ea.subscribe(`${this.modelType}Updated`, (scenario: IScenario) => {
      this.scenarios = this.state.scenarios;
      if (scenario) { this.activeScenario = this.scenarios.filter(l => l.id === scenario.id).shift(); }
    }));
    this.subscriptions.push(this.ea.subscribe(`baseLayersUpdated`, (scenario: IScenario) => {
      this.baseLayers = this.state.baseLayers;
    }));
    this.subscriptions.push(this.ea.subscribe(`overLayersUpdated`, (scenario: IScenario) => {
      this.overLayers = this.state.overLayers;
    }));
  }

  public detached() {
    this.subscriptions.forEach(s => s.dispose());
  }

  public activate() {
    this.scenarios = this.state.scenarios;
    this.activeScenario = this.state.scenario;
    if (this.activeScenario) { this.showScenarioSelector = true; }
    this.baseLayers = this.state.baseLayers;
    this.overLayers = this.state.overLayers;
  }

  public selectScenario(selected: IScenario) {
    this.activeScenario = (this.activeScenario && selected && this.activeScenario.id === selected.id) ? null : selected;
    if (this.activeScenario) {
      this.activeScenario = selected;
      this.state.activeScenarioId = selected.id;
      this.showScenarioSelector = true;
    } else {
      this.activeScenario = null;
      this.state.activeScenarioId = null;
      this.showScenarioSelector = false;
    }
  }

  @computedFrom('activeScenario')
  public get startDate() {
    if (!this.activeScenario || !this.activeScenario.start) { return null; }
    return typeof(this.activeScenario.start.date === 'string')
      ? new Date(Date.parse(this.activeScenario.start.date as string))
      : this.activeScenario.start.date;
    }
  public set startDate(t: string | Date) {
    if (this.activeScenario && this.activeScenario.start) {
      this.activeScenario.start.date = t;
    }
  }

  @computedFrom('activeScenario')
  public get endDate() {
    if (!this.activeScenario || !this.activeScenario.end) { return null; }
    return typeof(this.activeScenario.end.date === 'string')
      ? new Date(Date.parse(this.activeScenario.end.date as string))
      : this.activeScenario.end.date;
    }
  public set endDate(t: string | Date) {
    if (this.activeScenario && this.activeScenario.end) {
      this.activeScenario.end.date = t;
    }
  }

  public addScenario() {
    this.activeScenario = {
      layers: { baseIds: [this.state.baseLayers[0].id], overlayIds: [] },
      center: { lat: 32.147186, lng: -82.349135 },
      zoom: 12,
      trackIds: []
    } as IScenario;
    this.showScenarioSelector = true;
    this.state.save(this.modelType, this.activeScenario);
  }

  public deleteScenario() {
    this.showScenarioSelector = false;
    this.state.delete(this.modelType, this.activeScenario);
  }

  public saveScenario() {
    this.state.save(this.modelType, this.activeScenario);
  }
}
