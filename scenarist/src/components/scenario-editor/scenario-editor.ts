import { State } from './../../models/state';
import { defaultLayers, defaultMapOptions } from './../aurelia-leaflet/aurelia-leaflet-defaults';
import { ILayerDefinition } from 'models/layer';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import { IScenario } from './../../models/scenario';
import { MapOptions, Map } from 'leaflet';

@inject(State, EventAggregator)
export class ScenarioEditor {
  public isActive = false;
  public scenario: IScenario;
  public mapOptions: MapOptions = defaultMapOptions;
  public layers: { base: ILayerDefinition[], overlay?: ILayerDefinition[] } = defaultLayers;
  public leafletMapEvents = ['load', 'click', 'dblclick'];
  public withLayerControl = true;
  public withScaleControl = true;
  private isInitialized = false;
  private map: Map;

  constructor(private state: State, private ea: EventAggregator) {
    this.ea.subscribe('aurelia-leaflet', (ev) => this.mapEvent(ev));
    // this.ea.subscribe('activeScenarioChanged', scenario => this.activeScenarioChanged(scenario));
    this.resizeMap();
  }

  public attached() {
    this.resizeMap();
  }

  public activate() {
    const scenario = this.state.activeScenarioId
    ? this.state.scenarios.filter(s => s.id === this.state.activeScenarioId)[0]
    : null;
    this.activeScenarioChanged(scenario);
  }

  public activeScenarioChanged(scenario: IScenario) {
    this.scenario = scenario;
    this.isActive = this.scenario ? true : false;
    if (this.isActive) {
      this.mapOptions = {
        center: this.scenario.center,
        zoom: this.scenario.zoom
      };
      this.layers = { base: this.state.baseLayers.filter(l => scenario.layers.baseIds.indexOf(l.id) >= 0) };
    }
  }

  public mapEvent(ev: { type: string, [key: string]: any }) {
    switch (ev.type) {
      case 'load':
        this.map = ev.map as Map;
        break;
      default:
        console.log(ev);
        break;
    }
  }
  private resizeMap() {
    const mapMargin = 65 + 200;
    const map = $('#map');
    const w = $(window);
    // https://gis.stackexchange.com/questions/62491/sizing-leaflet-map-inside-bootstrap
    const resize = () => {
      const height = w.height();
      map.css('height', height - mapMargin);
    };
    if (!this.isInitialized) {
      w.on('resize', resize);
    }
    resize();
    this.isInitialized = true;
  }
}
