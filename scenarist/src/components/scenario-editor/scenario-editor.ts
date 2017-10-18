import { ITrack, ITrackView, TrackViewModel } from './../../models/track';
import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { defaultLayers, defaultMapOptions } from './../aurelia-leaflet/aurelia-leaflet-defaults';
import { ILayerDefinition } from 'models/layer';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import { IScenario } from './../../models/scenario';
import { MapOptions, Map, icon, Point, Marker } from 'leaflet';
import { MdModal } from 'aurelia-materialize-bridge';

@inject(State, EventAggregator)
export class ScenarioEditor {
  public isActive = false;
  public scenario: IScenario;
  public entityTypes: IEntityType[];
  public mapOptions: MapOptions = defaultMapOptions;
  public layers: { base: ILayerDefinition[], overlay?: ILayerDefinition[] } = defaultLayers;
  public leafletMapEvents = ['load', 'click', 'dblclick'];
  public withLayerControl = false;
  public withZoomControl = false;
  public withScaleControl = true;
  public clickLocation: L.LatLng;
  private tracks: ITrackView[];
  private isInitialized = false;
  private map: Map;
  private entityCollection: MdModal;
  private infoBox: MdModal;
  private subscriptions: Subscription[] = [];

  constructor(private state: State, private ea: EventAggregator) {}

  public attached() {
    this.resizeMap();
    this.subscriptions.push(this.ea.subscribe('aurelia-leaflet', (ev) => this.mapEvent(ev)));
    this.subscriptions.push(this.ea.subscribe('trackVisibilityChanged', (track: ITrackView) => this.trackVisibilityChanged(track)));
    this.subscriptions.push(this.ea.subscribe(`entityTypesUpdated`, (et: IEntityType) => {
      this.entityTypes = this.state.entityTypes;
    }));
    this.subscriptions.push(this.ea.subscribe(`scenariosUpdated`, (s: IScenario) => {
      if (s) { this.activeScenarioChanged(s); }
    }));
  }

  public detached() {
    this.subscriptions.forEach(s => s.dispose());
  }

  public activate() {
    this.entityTypes = this.state.entityTypes;
    const scenario = this.state.scenario;
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
      this.tracks = this.tracksToViewModels();
      // const overlay: ILayerDefinition[] = [];
      const overlay: ILayerDefinition[] = this.tracks.map(t => this.createMarker(t));
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
    this.tracks.push(new TrackViewModel(track));
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

  private createMarker(track: ITrack) {
    const et = this.entityTypes.filter(e => e.id === track.entityTypeId).shift();
    const iconHeight = 32;
    const iconScale = iconHeight / et.iconSize[1];
    const iconSize = new Point(iconScale * et.iconSize[0] * iconScale, iconHeight);
    const id = track.title || track.id;
    const f = track.features.shift() || this.state.tracks.filter(t => t.id === track.id).shift().features.shift();
    const latLng = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    const options = { icon: icon({ iconUrl: et.imgDataUrl, iconSize }) }; // http://leafletjs.com/examples/custom-icons/
    return { type: 'marker', latLng, id, options, click: this.markerClicked(track.id) } as ILayerDefinition;
  }

  private markerClicked(trackId: string | number) {
    return (marker: Marker) => {
      this.tracks.some(t => {
        if (t.id !== trackId) { return false; }
        t.isSelected = !t.isSelected;
        return true;
      });
    };
  }

  private trackVisibilityChanged(track: ITrackView) {
    const base = this.layers.base;
    let overlay: ILayerDefinition[];
    if (track.isVisible) {
      this.layers.overlay.push(this.createMarker(track));
      overlay = this.layers.overlay;
    } else {
      overlay = this.layers.overlay.filter(l => l.id !== track.id);
    }
    this.layers = { base, overlay };
  }

  private tracksToViewModels() {
    return this.state.tracks
      .filter(t => this.scenario.trackIds.includes(t.id as number))
      .map(t => new TrackViewModel(t));
  }
}
