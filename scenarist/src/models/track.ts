export interface ITrack {
  id: string | number;
  geojson: GeoJSON.FeatureCollection<GeoJSON.GeometryObject>;
}
