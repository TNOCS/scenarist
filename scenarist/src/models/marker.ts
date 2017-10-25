import { IdType } from 'models/model';
import { Marker, MarkerOptions, LatLng } from 'leaflet';

export interface IMarkerOptions extends MarkerOptions {
  id: IdType;
}

export interface IMarker extends Marker {
  options: IMarkerOptions;
  /**
   * Set the marker's new position
   *
   * @see https://stackoverflow.com/q/14173815/319711
   * @param {any} LatLng
   * @memberof IMarker
   */
  setLatLng(latLng: LatLng);
}
