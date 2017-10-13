import { ILayerDefinition } from './../aurelia-leaflet/aurelia-leaflet-defaults';
import { IScenario } from './../../models/scenario';
import { EventAggregator } from 'aurelia-event-aggregator';
import { State, ModelType } from './../../models/state';
import { inject } from 'aurelia-framework';

@inject(State, EventAggregator)
export class ScenarioMetadataEditor {
  public scenarios: IScenario[];
  public baseLayers: ILayerDefinition[];
  public activeScenario: IScenario;
  public showScenarioSelector = false;
  private modelType: ModelType = 'scenarios';

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.scenarios = this.state.scenarios;
    this.ea.subscribe(`${this.modelType}Updated`, (scenario: IScenario) => {
      this.scenarios = this.state.scenarios;
      if (scenario) { this.activeScenario = scenario; }
    });
    this.ea.subscribe(`baseLayersUpdated`, (scenario: IScenario) => {
      this.baseLayers = this.state.baseLayers;
    });
  }

  public selectScenario(selected: IScenario) {
    this.activeScenario = this.activeScenario === selected ? null : selected;
    this.showScenarioSelector = this.activeScenario ? true : null;
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
