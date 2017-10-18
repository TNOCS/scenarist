import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { inject, bindable } from 'aurelia-framework';
import { Point } from 'leaflet';
import * as ms from 'milsymbol';

@inject(State)
export class MilSymbolEditorCustomElement {
  @bindable public entityType: IEntityType;

  constructor(private state: State) { this.redraw(); }

  private redraw() {
    if (!this.entityType || !this.entityType.sidc) { return; }
    const sym = new ms.Symbol(this.entityType.sidc);
    const canvas = sym.asCanvas();
    this.entityType.imgDataUrl = canvas.toDataURL();
    this.entityType.iconSize = new Point(canvas.width, canvas.height);
    // TODO Also set the center point of the icon
  }
}
