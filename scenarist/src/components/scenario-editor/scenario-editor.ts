import { ITrack, ITrackView, TrackViewModel } from './../../models/track';
import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { defaultLayers, defaultMapOptions } from './../aurelia-leaflet/aurelia-leaflet-defaults';
import { ILayerDefinition } from 'models/layer';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import { IScenario } from './../../models/scenario';
import { MapOptions, Map, icon, Point, Marker, LeafletMouseEvent, LatLng, LeafletEvent } from 'leaflet';
import { MdModal } from 'aurelia-materialize-bridge';

@inject(State, EventAggregator)
export class ScenarioEditor {
  private static DefaultMarkerOpacity = 0.7;
  private static DefaultIconHeight = 48;

  public isActive = false;
  public scenario: IScenario;
  public entityTypes: IEntityType[];
  public mapOptions: MapOptions = defaultMapOptions;
  public layers: { base: ILayerDefinition[], overlay?: ILayerDefinition[] } = defaultLayers;
  public leafletMapEvents = ['load', 'click', 'dblclick'];
  public withLayerControl = false;
  public withZoomControl = false;
  public withScaleControl = true;
  public showPropertyEditor = false;
  public clickLocation: L.LatLng;

  private tracks: ITrackView[];
  private isInitialized = false;
  private map: Map;
  private entityCollection: MdModal;
  private infoBox: MdModal;
  private deleteTrackOrKeyframe: MdModal;
  private deletingTrack: ITrackView;
  private subscriptions: Subscription[] = [];

  constructor(private state: State, private ea: EventAggregator) { }

  public attached() {
    this.resizeMap();
    this.subscriptions.push(this.ea.subscribe('aurelia-leaflet', (ev) => this.mapEvent(ev)));
    this.subscriptions.push(this.ea.subscribe('trackVisibilityChanged', (track: ITrackView) => this.trackVisibilityChanged(track)));
    this.subscriptions.push(this.ea.subscribe('trackSelectionChanged', (track: ITrackView) => this.trackSelectionChanged(track)));
    this.subscriptions.push(this.ea.subscribe('timeIndexChanged', (track: ITrackView) => this.timeIndexChanged(track)));
    this.subscriptions.push(this.ea.subscribe('deleteTrack', (track: ITrackView) => this.deleteTrack(track)));
    this.subscriptions.push(this.ea.subscribe(`entityTypesUpdated`, (et: IEntityType) => {
      this.entityTypes = this.state.entityTypes;
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
      this.showPropertyEditor = this.tracks && this.tracks.length > 0;
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
        console.warn(ev);
        break;
    }
  }

  public newEntity() {
    this.openEntityCollection();
  }

  public createEntity(entityType: IEntityType) {
    console.warn(`Create new entity ${entityType.title}`);
    const track = {
      scenarioId: this.scenario.id,
      entityTypeId: entityType.id, features: [{
        geometry: {
          type: 'Point',
          coordinates: [this.clickLocation.lng, this.clickLocation.lat]
        }
      } as GeoJSON.Feature<GeoJSON.Point>]
    } as ITrack;
    this.state.save('tracks', track, (t: ITrack) => {
      this.tracks.push(new TrackViewModel(t));
      const base = this.layers.base;
      const overlay: ILayerDefinition[] = this.tracks.map(t2 => this.createMarker(t2));
      this.layers = { base, overlay };
    });
  }

  public openEntityCollection() {
    this.entityCollection.open();
  }

  public openInfoBox() {
    if (this.infoBox) { this.infoBox.open(); }
  }

  public deleteEntity() {
    console.warn('Delete entity called');
    const index = this.tracks.indexOf(this.deletingTrack);
    const id = this.deletingTrack.id;
    this.state.delete('tracks', this.deletingTrack, () => {
      this.deletingTrack = null;
      this.tracks.splice(index, 1);
      this.scenario.trackIds = this.scenario.trackIds.filter(t => t !== id);
      this.state.save('scenarios', this.scenario);
    });
  }

  public deleteKeyframe() {
    console.warn('Delete keyframe called');
    delete this.deletingTrack.features[this.deletingTrack.activeTimeIndex];
    this.state.save('tracks', this.deletingTrack);
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

  private createMarker(track: ITrackView) {
    const et = this.entityTypes.filter(e => e.id === track.entityTypeId).shift();
    const iconScale = ScenarioEditor.DefaultIconHeight / et.iconSize[1];
    const iconSize = new Point(iconScale * et.iconSize[0] * iconScale, ScenarioEditor.DefaultIconHeight);
    const id = track.id || this.tracks.length;
    const f = track.features[track.activeTimeIndex]; // || this.state.tracks.filter(t => t.id === track.id).shift().features.shift();
    const latLng = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    const options = { icon: icon({ iconUrl: et.imgDataUrl, iconSize }), opacity: ScenarioEditor.DefaultMarkerOpacity }; // http://leafletjs.com/examples/custom-icons/
    const marker = { type: 'marker', latLng, id, options, click: this.markerClicked(track) } as ILayerDefinition;
    return marker;
  }

  private markerClicked(track: ITrackView) {
    return (me: LeafletMouseEvent) => {
      me.originalEvent.preventDefault();
      const marker = (me.target as Marker);
      track.isSelected = !track.isSelected;
      this.setMarkerSelectionMode(marker, track);
    };
  }

  private setMarkerSelectionMode(marker: Marker, track: ITrackView) {
    if (track.isSelected) {
      marker.dragging.enable();
      marker.on('move', this.markerMoved(track));
      marker.on('moveend', this.markerMoveEnd(track));
      // see https://stackoverflow.com/a/40888862/319711
      (marker as any)._icon.classList.add('marker-selected');
    } else {
      marker.dragging.disable();
      marker.off('move');
      marker.off('moveend');
      (marker as any)._icon.classList.remove('marker-selected');
    }
  }

  private markerMoved(track: ITrackView) {
    return (me: LeafletMouseEvent) => {
      const coordinates = me.latlng;
      track.features[track.activeTimeIndex].geometry.coordinates = [coordinates.lng, coordinates.lat];
    };
  }

  private markerMoveEnd(track: ITrackView) {
    return (me: LeafletMouseEvent) => {
      track.applyChanges();
    };
  }

  private trackSelectionChanged(track: ITrackView) {
    // const marker = this.layers.overlay.filter(m => m.options && (m.options as any).id === track.id)
    // const marker = this.layers.overlay.filter(o => o.id === track.id).shift() as any;
    this.map.eachLayer((l: Marker) => {
      if (l.hasOwnProperty('options') && l.options.hasOwnProperty('id') && (l.options as any).id === track.id) {
        this.setMarkerSelectionMode(l, track);
      }
    });
    // this.toggleMarkerSelection(marker, track);
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

  private timeIndexChanged(track: ITrackView) {
    const base = this.layers.base;
    let overlay: ILayerDefinition[];
    if (track.isVisible) {
      // Remove the marker
      overlay = this.layers.overlay.filter(l => l.id !== track.id);
      this.layers = { base, overlay };
      setTimeout(() => {
        // Add the marker on the next tick
        overlay.push(this.createMarker(track));
        this.layers = { base, overlay };
      });
    }
  }

  private deleteTrack(track: ITrackView) {
    this.deletingTrack = track;
    this.deleteTrackOrKeyframe.open();
  }

  private tracksToViewModels() {
    return this.state.tracks.map(t => new TrackViewModel(t));
  }
}
