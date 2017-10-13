import { IScenario } from './../../models/scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
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

  constructor(private state: State, private ea: EventAggregator) {}

  public activate() {
    this.scenarios = this.state.scenarios;
    this.activeScenario = this.state.activeScenarioId
      ? this.scenarios.filter(s => s.id === this.state.activeScenarioId)[0]
      : null;
    if (this.activeScenario) { this.showScenarioSelector = true; }
    this.ea.subscribe(`${this.modelType}Updated`, (scenario: IScenario) => {
      this.scenarios = this.state.scenarios;
      if (scenario) { this.activeScenario = this.scenarios.filter(l => l.id === scenario.id)[0]; }
    });
    this.baseLayers = this.state.baseLayers;
    this.ea.subscribe(`baseLayersUpdated`, (scenario: IScenario) => {
      this.baseLayers = this.state.baseLayers;
    });
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
    this.activeScenario = {} as IScenario;
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
