import { EventAggregator } from 'aurelia-event-aggregator';
import { IScenario } from './../../models/scenario';
import { State, ModelType } from './../../models/state';
import { IScenarioState, PlayState } from './../../models/playstate';
import { Endpoint, Rest } from 'aurelia-api';
import { inject } from 'aurelia-framework';

@inject(Endpoint.of('player'), State, EventAggregator)
export class PlayerControlsCustomElement {

  private activePlayScenarioId: string;
  private activePlayScenario: IScenarioState;
  private showPlayerControls: boolean = false;
  private playStates: Map < string, IScenarioState > = new Map();
  private modelType: ModelType = 'scenarios';
  private playStateNames: {[key: string]: string};
  private enablePolling: boolean = true;

  constructor(private rest: Rest, private state: State, private ea: EventAggregator) {}

  public attached() {
    this.setActiveScenario(null);
    this.showPlayerControls = false;
    this.ea.subscribe(`${this.modelType}Updated`, (scenario: IScenario) => {
      //update
    });
    this.init();
    this.poll();
  }

  public init() {
    let urlPath = `allscenarios`;
    this.rest.find(urlPath).then((ps) => {
      Object.keys(ps).forEach((key) => {
        this.playStates.set(key.toString(), ps[key]);
      });
    });
    this.playStateNames = <any>PlayState; FIX to stop typescript from complaining. Needs improvement
  }

  public play(time: number = null) {
    let urlPath = `play/${this.activePlayScenarioId}`;
    if (time != null) {
      urlPath += `?time=${time}`;
    }
    this.rest.find(urlPath).then(ps => {
      this.playStates.set(ps.id.toString(), ps);
      this.setActiveScenario(ps.id);
    });
  }

  public pause(time: number = null) {
    let urlPath = `pause/${this.activePlayScenarioId}`;
    if (time != null) {
      urlPath += `?time=${time}`;
    }
    this.rest.find(urlPath).then(ps => {
      this.playStates.set(ps.id.toString(), ps);
      this.setActiveScenario(ps.id);
    });
  }

  public stop() {
    let urlPath = `stop/${this.activePlayScenarioId}`;
    this.rest.find(urlPath).then(ps => {
      this.playStates.set(ps.id.toString(), ps);
      this.setActiveScenario(ps.id);
    });
  }

  public speed(speed: number) {
    let urlPath = `speed/${this.activePlayScenarioId}/${speed}`;
    this.rest.find(urlPath).then(ps => {
      this.playStates.set(ps.id.toString(), ps);
      this.setActiveScenario(ps.id);
    });
  }

  public getState() {
    if (this.activePlayScenarioId == null) return;
    let urlPath = `state/${this.activePlayScenarioId}`;
    this.rest.find(urlPath).then(ps => {
      this.playStates.set(ps.id.toString(), ps);
      this.setActiveScenario(ps.id);
    });
  }

  public onRangeChange(evt: Event) {
    this.play(this.activePlayScenario.currentTime);
  }

  public onPollingChange(evt: Event) {
    this.enablePolling = !this.enablePolling;
    this.poll();
  }

  private poll() {
    if (this.enablePolling) {
      this.getState();
      setTimeout(() => {
        this.poll();
      }, 1000);
    }
  }

  private speedMin() {
    if (!this.activePlayScenario || this.activePlayScenario.speed < 1) {
      this.speed(0.5);
      return;
    }
    this.activePlayScenario.speed /= 2;
    this.speed(this.activePlayScenario.speed);
  }

  private speedPlus() {
    if (!this.activePlayScenario || this.activePlayScenario.speed > 2048) {
      this.speed(4096);
      return;
    }
    this.activePlayScenario.speed *= 2;
    this.speed(this.activePlayScenario.speed);
  }

  private setActiveScenario(id: string) {
    if (this.playStates && this.playStates.has(id)) {
      this.activePlayScenarioId = id;
      this.activePlayScenario = this.playStates.get(id);
      this.showPlayerControls = true;
    } else {
      this.activePlayScenarioId = null;
      this.activePlayScenario = null;
      this.showPlayerControls = false;
    }
  }
}
