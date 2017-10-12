import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { inject, bindable } from 'aurelia-framework';
import * as ms from 'milsymbol';

@inject(State)
export class MilSymbolEditorCustomElement {
  @bindable public entityType: IEntityType;

  constructor(private state: State) { this.redraw(); }

  private redraw() {
    if (!this.entityType || !this.entityType.sidc) { return; }
    const sym = new ms.Symbol(this.entityType.sidc);
    this.entityType.imgDataUrl = sym.asCanvas().toDataURL();
  }
}
