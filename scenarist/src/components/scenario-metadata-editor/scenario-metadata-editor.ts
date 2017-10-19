import { IScenario } from './../../models/scenario';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { State, ModelType } from './../../models/state';
import { inject } from 'aurelia-framework';
import { ILayerDefinition } from 'models/layer';

@inject(State, EventAggregator)
export class ScenarioMetadataEditor {
  public scenarios: IScenario[];
  public baseLayers: ILayerDefinition[];
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
  }

  public detached() {
    this.subscriptions.forEach(s => s.dispose());
  }

  public activate() {
    this.scenarios = this.state.scenarios;
    this.activeScenario = this.state.scenario;
    if (this.activeScenario) { this.showScenarioSelector = true; }
    this.baseLayers = this.state.baseLayers;
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

  public addScenario() {
    this.activeScenario = {
      layers: { baseIds: [this.state.baseLayers[0].id], overlayIds: [] },
      center: { lat: 52.147186, lng: 5.349135 },
      zoom: 15,
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
