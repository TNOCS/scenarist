import { IModel } from './model';

export type LayerType = 'tile' |
  'marker' |
  'popup' |
  'wms' |
  'canvas' |
  'imageOverlay' |
  'polyline' |
  'multiPolyline' |
  'polygone' |
  'multiPolygon' |
  'rectangle' |
  'circle' |
  'circleMarker' |
  'layerGroup' |
  'geoJSON' |
  'TopoJSON' |
  'KML' |
  'WKT' |
  'CSV' |
  'GPX';

export interface ILayerDefinition extends IModel {
  type?: LayerType;
  url?: string;
  options?: {
    attribution?: string;
    pointToLayer?: any;
    onEachFeature?: any;
  };
  [key: string]: any | any[];
}

