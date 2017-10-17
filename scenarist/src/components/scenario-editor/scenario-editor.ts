import { ITrack } from './../../models/track';
import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { defaultLayers, defaultMapOptions } from './../aurelia-leaflet/aurelia-leaflet-defaults';
import { ILayerDefinition } from 'models/layer';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import { IScenario } from './../../models/scenario';
import { MapOptions, Map, layerGroup, marker, icon, Point } from 'leaflet';
import { MdModal } from 'aurelia-materialize-bridge';

@inject(State, EventAggregator)
export class ScenarioEditor {
  public isActive = false;
  public scenario: IScenario;
  public entityTypes: IEntityType[];
  public mapOptions: MapOptions = defaultMapOptions;
  public layers: { base: ILayerDefinition[], overlay?: ILayerDefinition[] | L.LayerGroup } = defaultLayers;
  public leafletMapEvents = ['load', 'click', 'dblclick'];
  public withLayerControl = true;
  public withScaleControl = true;
  public clickLocation: L.LatLng;
  private tracks: ITrack[];
  private isInitialized = false;
  private map: Map;
  private entityCollection: MdModal;
  private infoBox: MdModal;

  constructor(private state: State, private ea: EventAggregator) {
    this.ea.subscribe('aurelia-leaflet', (ev) => this.mapEvent(ev));
    // this.ea.subscribe('activeScenarioChanged', scenario => this.activeScenarioChanged(scenario));
    this.resizeMap();
  }

  public attached() {
    this.resizeMap();
  }

  public activate() {
    this.entityTypes = this.state.entityTypes;
    this.ea.subscribe(`entityTypesUpdated`, (et: IEntityType) => {
      this.entityTypes = this.state.entityTypes;
    });
    const scenario = this.state.activeScenarioId
      ? this.state.scenarios.filter(s => s.id === this.state.activeScenarioId)[0]
      : null;
    this.ea.subscribe(`scenariosUpdated`, (s: IScenario) => {
      if (s) { this.activeScenarioChanged(s); }
    });
    this.activeScenarioChanged(scenario);
  }

  public activeScenarioChanged(scenario: IScenario) {
    if (!this.entityTypes) { return; }
    this.scenario = scenario;
    this.isActive = this.scenario ? true : false;
    if (this.isActive) {
      this.mapOptions = {
        center: this.scenario.center,
        zoom: this.scenario.zoom
      };
      this.tracks = this.state.tracks.filter(t => scenario.trackIds.includes(t.id as string));
      // const overlay: ILayerDefinition[] = [];
      const overlay: ILayerDefinition[] = this.tracks.map(t => {
        const et = this.entityTypes.filter(et => et.id === t.entityTypeId).shift();
        const iconHeight = 32;
        const iconScale = iconHeight / et.iconSize[1]
        const iconSize = new Point(iconScale * et.iconSize[0] * iconScale, iconHeight);
        const id = t.title || t.id;
        const f = t.features.shift();
        const latLng = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
        const options = { icon: icon({ iconUrl: et.imgDataUrl, iconSize }) }; // http://leafletjs.com/examples/custom-icons/
        return { type: 'marker', latLng, id, options } as ILayerDefinition;
      });
      // this.tracks.forEach(t => {
      //   const f = t.features.shift();
      //   overlay[t.title] = [marker({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] })];
      // });
      // const overlay = layerGroup(this.tracks.map(t => {
      //   const f = t.features.shift();
      //   return { 'd': marker({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }) };
      // }));
      const base = this.state.baseLayers.filter(l => scenario.layers.baseIds.indexOf(l.id) >= 0);
      this.layers = { base, overlay };
    }
  }

  public mapEvent(ev: { type: string, [key: string]: any }) {
    switch (ev.type) {
      case 'load':
        this.map = ev.map as Map;
        break;
      case 'click':
        this.clickLocation = ev.latlng;
        this.openInfoBox();
        break;
      default:
        console.log(ev);
        break;
    }
  }

  public newEntity() {
    this.openEntityCollection();
  }

  public createEntity(entityType: IEntityType) {
    console.log(`Create new entity ${entityType.title}`);
    const track = {
      entityTypeId: entityType.id, features: [{
        geometry: {
          type: 'Point',
          coordinates: [this.clickLocation.lng, this.clickLocation.lat]
        }
      } as GeoJSON.Feature<GeoJSON.Point>]
    } as ITrack;
    this.state.save('tracks', track);
  }

  public openEntityCollection() {
    this.entityCollection.open();
  }

  public openInfoBox() {
    if (this.infoBox) { this.infoBox.open(); }
  }

  private resizeMap() {
    const mapMargin = 65;
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
