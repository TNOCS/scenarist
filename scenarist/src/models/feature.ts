import { clone } from 'utils/utils';
import { IPropertyView } from 'models/property';

export class FeatureViewModel {
  public type: 'Feature';
  private pGeometry: GeoJSON.Point;
  private pProperties: { [key: string]: IPropertyView };

  constructor(private feature: GeoJSON.Feature<GeoJSON.Point>, private hasChangedHandler: (f: GeoJSON.Feature<GeoJSON.Point>) => void) {
    this.pGeometry = clone(feature.geometry);
    this.pProperties = feature.properties ? clone(feature.properties) : {};
  }

  public get geometry() { return this.pGeometry; }
  public set geometry(g) {
    if (this.pGeometry === g) { return; }
    this.pGeometry = g;
    this.invokeHasChangedHandler();
  }

  public get properties() { return this.pProperties; }
  public set properties(props) {
    this.pProperties = props;
    this.invokeHasChangedHandler();
  }

  private invokeHasChangedHandler() {
    this.hasChangedHandler(this);
  }
}
