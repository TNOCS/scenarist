import { customElement, useView, bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AureliaLeafletException } from './aurelia-leaflet-exceptions';
import { defaultMapOptions, defaultLayers } from './aurelia-leaflet-defaults';
import LayerFactory from './aurelia-leaflet-factory';
import * as Leaflet from 'leaflet';
import { Map } from 'leaflet';
import { ILayerDefinition } from 'models/layer';
import './plugins/leaflet-mouse-coordinates/leaflet-mouse-coordinates';

@customElement('leaflet')
@useView('./aurelia-leaflet.html')
@inject(Leaflet, EventAggregator, Element)
export class AureliaLeafletCustomElement {
  // public static inject = [Leaflet, EventAggregator, Element];
  @bindable public layers: { base: ILayerDefinition[], overlay: ILayerDefinition[] };
  @bindable public mapEvents: string[];
  @bindable public mapOptions: Leaflet.MapOptions;
  @bindable public withLayerControl: boolean;
  @bindable public withScaleControl: boolean;
  @bindable public withZoomControl: boolean;

  public attachedLayers = {
    base: {},
    overlay: {}
  };
  private isAttached = false;
  private map: Map;
  private L;
  private layerFactory;
  private layerControl;
  private scaleControl;
  private zoomControl;
  private mapContainer: string;
  private mapInit: Promise<{}>;
  private mapInitResolve: (value?: {} | PromiseLike<{}>) => void;
  private mapInitReject: (value?: {} | PromiseLike<{}>) => void;
  private eventsBound: Promise<{}>;
  private eventsBoundResolve: (value?: {} | PromiseLike<{}>) => void;
  private eventsBoundReject: (value?: {} | PromiseLike<{}>) => void;

  constructor(Leaflet, private eventAggregator: EventAggregator, private element: Element) {
    this.L = Leaflet;
    this.layerFactory = new LayerFactory(Leaflet);

    this.mapInit = new Promise((resolve, reject) => {
      this.mapInitResolve = resolve;
      this.mapInitReject = reject;
    });

    this.eventsBound = new Promise((resolve, reject) => {
      this.eventsBoundResolve = resolve;
      this.eventsBoundReject = reject;
    });

    this.eventAggregator.subscribe('LayersChanged', (data: any) => {
      this.layersChanged(data, null);
    });

    this.mapOptions = defaultMapOptions;
    this.layers = defaultLayers;

    // FIX issue with default markers not being rendered
    // https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
    this.L.Icon.Default.imagePath = '.';
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }

  public attached() {
    return new Promise((resolve, reject) => {
      // remove the center option before contructing the map to have a chance to bind to the "load" event
      // first. The "load" event on the map gets fired after center and zoom are set for the first time.
      const center = this.mapOptions.center;
      delete this.mapOptions.center;
      if (!this.map) {
        this.map = this.L.map(this.mapContainer, this.mapOptions);
      }
      this.mapOptions.center = center;
      this.attachLayers();
      this.isAttached = true;

      if (this.map) {
        this.mapInitResolve();
      } else {
        this.mapInitReject();
        reject();
      }

      resolve();

      if (this.mapEvents) {
        this.eventsBound.then(() => {
          this.map.setView([(this.mapOptions.center as Leaflet.LatLngLiteral).lat, (this.mapOptions.center as Leaflet.LatLngLiteral).lng], this.mapOptions.zoom);
        });
      } else {
        this.map.setView([(this.mapOptions.center as Leaflet.LatLngLiteral).lat, (this.mapOptions.center as Leaflet.LatLngLiteral).lng], this.mapOptions.zoom);
      }
    });
  }

  public detached() {
    this.isAttached = false;
  }

  public layersChanged(newLayers, oldLayers) {
    if (!this.isAttached) { return; }
    if (oldLayers && oldLayers !== null) {
      this.removeOldLayers(oldLayers.base, 'base');
      this.removeOldLayers(oldLayers.overlay, 'overlay');
    }
    this.attachLayers();
  }

  public mapOptionsChanged(newOptions, oldOptions) {
    this.mapOptions = Object.assign(defaultMapOptions, newOptions);

    // some options can get set on the map object after init
    this.mapInit.then(() => {
      if (oldOptions) {
        if (this.mapOptions.center !== oldOptions.center) {
          this.map.setView(this.mapOptions.center, this.mapOptions.zoom);
        } else if (this.mapOptions.zoom !== oldOptions.zoom) {
          this.map.setZoom(this.mapOptions.zoom);
        }
        if (this.mapOptions.maxBounds !== oldOptions.maxBounds) {
          this.map.setMaxBounds(this.mapOptions.maxBounds);
        }
      }
    });
  }

  public mapEventsChanged(newEvents, oldEvents) {
    this.mapInit.then(() => {
      if (newEvents && newEvents.length) {
        for (let eventName of newEvents) {
          this.map.on(eventName, (e) => this.eventAggregator.publish('aurelia-leaflet', Object.assign(e, { map: this.map })));
        }
      }
      if (oldEvents !== null && oldEvents && oldEvents.filter) {
        for (let removedEvent of oldEvents.filter((e) => newEvents.indexOf(e) === -1)) {
          this.map.off(removedEvent);
        }
      }
      // if (!this.eventsBound.resolved) {
      this.eventsBoundResolve();
      // }
    });
  }

  public withLayerControlChanged(newValue) {
    if (newValue === false) {
      this.mapInit.then(() => {
        if (this.layerControl) {
          this.map.removeControl(this.layerControl);
        }
      });
    } else {
      this.mapInit.then(() => {
        if (this.layerControl) {
          this.map.removeControl(this.layerControl);
        }
        this.layerControl = this.L.control.layers(this.attachedLayers.base, this.attachedLayers.overlay, newValue).addTo(this.map);
      });
    }
  }

  public withScaleControlChanged(newValue) {
    if (newValue === false) {
      this.mapInit.then(() => {
        if (this.scaleControl) {
          this.map.removeControl(this.scaleControl);
        }
      });
    } else {
      this.mapInit.then(() => {
        if (this.scaleControl) {
          this.map.removeControl(this.scaleControl);
        }
        this.scaleControl = this.L.control.scale(newValue).addTo(this.map);
        this.L.control.mouseCoordinate({ gps: false, utmref: true }).addTo(this.map);
      });
    }
  }

  public withZoomControlChanged(newValue) {
    if (newValue === false) {
      this.mapInit.then(() => {
        if (this.zoomControl) {
          this.map.removeControl(this.zoomControl);
        }
      });
    } else {
      this.mapInit.then(() => {
        if (this.zoomControl) {
          this.map.removeControl(this.zoomControl);
        }
        this.zoomControl = this.L.control.zoom(newValue).addTo(this.map);
      });
    }
  }

  public attachLayers() {
    let layersToAttach = {
      base: {},
      overlay: {}
    };
    if (this.layers.hasOwnProperty('base')) {
      for (let layer of this.layers.base) {
        const id = this.getLayerId(layer);
        if (this.attachedLayers.base.hasOwnProperty(id)) { continue; }
        layersToAttach.base[id] = this.layerFactory.getLayer(layer);
      }
    }
    if (this.layers.hasOwnProperty('overlay')) {
      for (let layer of this.layers.overlay) {
        const id = this.getLayerId(layer);
        if (this.attachedLayers.overlay.hasOwnProperty(id)) { continue; }
        layersToAttach.overlay[this.getLayerId(layer)] = this.layerFactory.getLayer(layer);
      }
    }
    this.mapInit.then(() => {
      for (const layerId of Object.keys(layersToAttach.base)) {
        this.attachedLayers.base[layerId] = layersToAttach.base[layerId].addTo(this.map);
      }
      for (const layerId of Object.keys(layersToAttach.overlay)) {
        if (!layersToAttach.overlay[layerId]) { continue; }
        this.attachedLayers.overlay[layerId] = layersToAttach.overlay[layerId].addTo(this.map);
      }
    });
  }

  public removeOldLayers(oldLayers, type) {
    if (!oldLayers || !oldLayers.length) {
      return;
    }
    let removedLayers = oldLayers.filter((oldLayer) => {
      let removed = true;
      if (!this.layers.hasOwnProperty(type)) {
        return true;
      }
      for (let newLayer of this.layers[type]) {
        if (this.getLayerId(newLayer) === this.getLayerId(oldLayer)) {
          removed = false;
        }
      }
      return removed;
    });

    for (let removedLayer of removedLayers) {
      this.mapInit.then(() => {
        let id = this.getLayerId(removedLayer);
        if (this.attachedLayers[type].hasOwnProperty(id)) {
          this.map.removeLayer(this.attachedLayers[type][id]);
          delete this.attachedLayers[type][this.getLayerId(removedLayer)];
        }
      });
    }
  }

  public getLayerId(layer) {
    let id = layer.id ? layer.id : layer.url;
    if (!id) {
      throw new AureliaLeafletException('Not possible to get id for layer. Set the id property');
    }
    return id;
  }

}
