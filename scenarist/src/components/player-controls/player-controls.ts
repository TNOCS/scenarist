import { EventAggregator } from 'aurelia-event-aggregator';
import { IScenario } from './../../models/scenario';
import { State, ModelType } from './../../models/state';
import { IScenarioState } from './../../models/playstate';
import { Endpoint, Rest } from 'aurelia-api';
import { inject } from 'aurelia-framework';

@inject(Endpoint.of('player'), State, EventAggregator)
export class PlayerControlsCustomElement {

  public activePlayScenario: string;
  private showPlayerControls: boolean = false;
  private playStates: Map<string, IScenarioState> = new Map();
  private modelType: ModelType = 'scenarios';

  constructor(private rest: Rest, private state: State, private ea: EventAggregator) {}

  public attached() {
    this.activePlayScenario = null;
    this.showPlayerControls = false;
    this.ea.subscribe(`${this.modelType}Updated`, (scenario: IScenario) => {
      //update
    });
    this.init();
  }

  public init() {
    let urlPath = `scenarios`;
    this.rest.find(urlPath).then((ps) => {
      Object.keys(ps).forEach((key) => {
        this.playStates.set(key, ps[key]);
      });
    });
  }

  public selectScenario(id: string) {
    this.activePlayScenario = id;
    this.showPlayerControls = true;
  }

  public play() {
    let urlPath = `play/${this.activePlayScenario}`;
    this.rest.find(urlPath).then(ps => {this.playStates.set(ps.id, ps));
  }

}
