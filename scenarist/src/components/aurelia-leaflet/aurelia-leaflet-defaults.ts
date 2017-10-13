import { IModel } from './../../models/model';
import { MapOptions } from 'leaflet';

export interface ILayerDefinition extends IModel {
  type: string;
  url: string;
  options: {
    attribution: string;
  };
}

export const defaultMapOptions: MapOptions = {
  center: {
    lat: 51.3686498,
    lng: 5.53918250
  },
  zoom: 13
};

export const defaultLayers: { base: ILayerDefinition[], overlay: ILayerDefinition[] } = {
  base: [
    {
      id: 'OSM Tiles',
      title: 'OSM Tiles',
      type: 'tile',
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    }
  ],
  overlay: []
};
