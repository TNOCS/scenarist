import { EventAggregator } from 'aurelia-event-aggregator';
import { ILayerDefinition } from 'models/layer';
import { inject } from 'aurelia-framework';
import { State, ModelType } from 'models/state';

@inject(State, EventAggregator)
export class LayerEditor {
  public modelType: ModelType;
  public layers: ILayerDefinition[];
  public activeLayer: ILayerDefinition;
  public showLayerEditor = false;

  constructor(private state: State, private ea: EventAggregator) {}

  public activate(params: { layertype: ModelType}) {
    this.modelType = params.layertype;
    if (!this.modelType) { return; }
    this.layers = this.state.getModel(this.modelType) as ILayerDefinition[];
    this.ea.subscribe(`${this.modelType}Updated`, (layer: ILayerDefinition) => {
      this.layers = this.state.getModel(this.modelType) as ILayerDefinition[];
      if (layer) { this.activeLayer = this.layers.filter(l => l.id === layer.id)[0]; }
    });
  }

  public selectLayer(selected: ILayerDefinition) {
    this.activeLayer = this.activeLayer === selected ? null : selected;
    this.showLayerEditor = this.activeLayer ? true : null;
  }

  public addLayer() {
    this.activeLayer = {} as ILayerDefinition;
    this.showLayerEditor = true;
    this.state.save(this.modelType, this.activeLayer);
  }

  public deleteLayer() {
    this.showLayerEditor = false;
    this.state.delete(this.modelType, this.activeLayer);
  }

  public saveLayer() {
    this.state.save(this.modelType, this.activeLayer);
  }

}
