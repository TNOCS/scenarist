import { AureliaLeafletException } from './aurelia-leaflet-exceptions';
// import * as Leaflet from 'leaflet';

export default class LayerFactory {

  constructor(private L) {}

  public getLayer(layer) {
    if (!layer.hasOwnProperty('type')) {
      layer.type = 'tile';
    }

    let instance;

    switch (layer.type) {
      case 'marker':
        instance = this.getMarker(layer);
        break;
      case 'popup':
        instance = this.getPopup(layer);
        break;
      case 'tile':
        instance = this.getTile(layer);
        break;
      case 'wms':
        instance = this.getWMS(layer);
        break;
      case 'canvas':
        instance = this.getCanvas(layer);
        break;
      case 'imageOverlay':
        instance = this.getImageOverlay(layer);
        break;
      case 'polyline':
        instance = this.getPolyline(layer);
        break;
      case 'multiPolyline':
        instance = this.getMultiPolyline(layer);
        break;
      case 'polygone':
        instance = this.getPolygone(layer);
        break;
      case 'multiPolygone':
        instance = this.getMultiPolygone(layer);
        break;
      case 'rectangle':
        instance = this.getRectangle(layer);
        break;
      case 'circle':
        instance = this.getCircle(layer);
        break;
      case 'circleMarker':
        instance = this.getCircleMarker(layer);
        break;
      case 'group':
        instance = this.getLayerGroup(layer);
        break;
      case 'featureGroup':
        instance = this.getFeatureGroup(layer);
        break;
      case 'geoJSON':
        instance = this.getGeoJson(layer);
        break;
      default:
        throw new AureliaLeafletException(`Layer type ${layer.type} not implemented`);
    }

    if (typeof layer.initCallback === 'function') {
      layer.initCallback(instance);
    }

    if (layer.hasOwnProperty('events')) {
      for (let e of layer.events) {
        if (typeof instance.on === 'function') {
          instance.on(e.name, e.callback);
        }
      }
    }

    return instance;
  }

  public getMarker(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new AureliaLeafletException('No latLng given for layer.type "marker"');
    }
    const marker = this.L.marker(layer.latLng, layer.options);
    if (layer.hasOwnProperty('popupContent')) {
      marker.bindPopup(layer.popupContent).openPopup();
    }
    if (layer.hasOwnProperty('click')) {
      marker.on('click', (m) => layer.click(m));
    }
    return marker;
  }

  public getPopup(layer) {
    const popup = this.L.popup(layer.options);
    if (layer.hasOwnProperty('content')) {
      popup.setContent(layer.content);
    }
    if (layer.hasOwnProperty('latLng')) {
      popup.setLatLng(layer.latLng);
    }
    return popup;
  }

  public getTile(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new AureliaLeafletException('No url given for layer.type "tile"');
    }
    return this.L.tileLayer(layer.url, layer.options);
  }

  public getWMS(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new AureliaLeafletException('No url given for layer.type "wms"');
    }
    return this.L.tileLayer.wms(layer.url, layer.options);
  }

  public getCanvas(layer) {
    let l = this.L.tileLayer.canvas(layer.options);
    if (layer.hasOwnProperty('drawTile')) {
      l.drawTile = layer.drawTile;
    }
    if (layer.hasOwnProperty('tileDrawn')) {
      l.tileDrawn = layer.tileDrawn;
    }
    return l;
  }

  public getImageOverlay(layer) {
    if (!layer.hasOwnProperty('url')) {
      throw new AureliaLeafletException('No url given for layer.type "imageOverlay"');
    }
    if (!layer.hasOwnProperty('imageBounds')) {
      throw new AureliaLeafletException('No imageBounds given for layer.type "imageOverlay"');
    }
    return this.L.imageOverlay(layer.url, layer.imageBounds, layer.options);
  }

  public getPolyline(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new AureliaLeafletException('No latLngs given for layer.type "polyline"');
    }
    return this.L.polyline(layer.latlngs, layer.options);
  }

  public getMultiPolyline(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new AureliaLeafletException('No latLngs given for layer.type "multiPolyline"');
    }
    return this.L.multiPolyline(layer.latlngs, layer.options);
  }

  public getPolygone(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new AureliaLeafletException('No latLngs given for layer.type "polygone"');
    }
    return this.L.polygone(layer.latlngs, layer.options);
  }

  public getMultiPolygone(layer) {
    if (!layer.hasOwnProperty('latLngs')) {
      throw new AureliaLeafletException('No latLngs given for layer.type "multiPolygone"');
    }
    return this.L.multiPolygone(layer.latlngs, layer.options);
  }

  public getRectangle(layer) {
    if (!layer.hasOwnProperty('bounds')) {
      throw new AureliaLeafletException('No bounds given for layer.type "rectangle"');
    }
    return this.L.rectangle(layer.bounds, layer.options);
  }

  public getCircle(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new AureliaLeafletException('No latLng given for layer.type "circle"');
    }
    if (!layer.hasOwnProperty('radius')) {
      throw new AureliaLeafletException('No radius given for layer.type "circle"');
    }
    return this.L.circle(layer.latLng, layer.radius, layer.options);
  }

  public getCircleMarker(layer) {
    if (!layer.hasOwnProperty('latLng')) {
      throw new AureliaLeafletException('No latLng given for layer.type "circleMarker"');
    }
    return this.L.circleMarker(layer.latLng, layer.options);
  }

  public getLayerGroup(layer) {
    if (!layer.hasOwnProperty('layers')) {
      throw new AureliaLeafletException('No layers given for layer.type "group"');
    }
    let layers = [];
    for (let l of layer.layers) {
      layers.push(this.getLayer(l));
    }
    return this.L.layerGroup(layers);
  }

  public getFeatureGroup(layer) {
    if (!layer.hasOwnProperty('layers')) {
      throw new AureliaLeafletException('No layers given for layer.type "featureGroup"');
    }
    let layers = [];
    for (let l of layer.layers) {
      layers.push(this.getLayer(l));
    }
    return this.L.featureGroup(layers);
  }

  public getGeoJson(layer) {
    if (!layer.hasOwnProperty('data')) {
      throw new AureliaLeafletException('No data property given for layer.type "geoJSON"');
    }
    return this.L.geoJson(layer.data, layer.options);
  }
}
