import { IEntityType } from './../../models/entity';
import { State } from './../../models/state';
import { inject, bindable } from 'aurelia-framework';
import { Point } from 'leaflet';
import * as ms from 'milsymbol';
import { SymbolOptions } from 'milsymbol';
import { clean } from 'utils/utils';

@inject(State)
export class MilSymbolEditorCustomElement {
  @bindable public entityType: IEntityType;

  private pCodingScheme: string = 'S';
  private pAffiliation: string = 'F';
  private pBattleDimension: string = 'G';
  private pStatus: string = '-';
  private pFunctionID: string = '------';
  private pSymbolModifier1: string;
  private pSymbolModifier2: string;
  private pAdditionalInformation: string;
  private pAltitude: string;
  private pCombatEffectiveness: string;
  private pDirection: number;
  private pDtg: string;
  private pEvaluationRating: string;
  private pHigherFormation: string;
  private pHostile: string;
  private pIff: string;
  private pLocation: string;
  private pQuantity: string;
  private pReinforcedReduced: string;
  private pSignatureEquipment: string;
  private pSpecialHeadquarters: string;
  private pSpeed: string;
  private pStaffComments: string;
  private pMtype: string;
  private pUniqueDesignation: string;
  private isInitialized = false;

  constructor(private state: State) { this.redraw(); }

  public get sidc(): string {
    return this.entityType ? this.entityType.sidc : '';
  }
  public set sidc(v: string) {
    this.entityType.sidc = v;
    if (v) {
      this.isInitialized = false;
      this.codingScheme = v.substr(0, 1);
      this.affiliation = v.substr(1, 1);
      this.battleDimension = v.substr(2, 1);
      this.status = v.substr(3, 1);
      this.functionID = v.substr(4, 6);
      this.symbolModifier1 = v.substr(v.length - 5, 1);
      this.symbolModifier2 = v.substr(v.length - 4, 1);
      this.isInitialized = true;
    }
    this.redraw();
  }

  public get codingScheme(): string {
    return this.pCodingScheme;
  }
  public set codingScheme(v: string) {
    this.pCodingScheme = v;
    this.updateSIDC();
  }

  public get affiliation(): string {
    return this.pAffiliation;
  }
  public set affiliation(v: string) {
    this.pAffiliation = v;
    this.updateSIDC();
  }

  public get battleDimension(): string {
    return this.pBattleDimension;
  }
  public set battleDimension(v: string) {
    this.pBattleDimension = v;
    this.updateSIDC();
  }

  public get status(): string {
    return this.pStatus;
  }
  public set status(v: string) {
    this.pStatus = v;
    this.updateSIDC();
  }

  public get functionID(): string {
    return this.pFunctionID;
  }
  public set functionID(v: string) {
    this.pFunctionID = v;
    this.updateSIDC();
  }

  public get symbolModifier1(): string {
    return this.pSymbolModifier1;
  }
  public set symbolModifier1(v: string) {
    this.pSymbolModifier1 = v;
    this.updateSIDC();
  }

  public get symbolModifier2(): string {
    return this.pSymbolModifier2;
  }
  public set symbolModifier2(v: string) {
    this.pSymbolModifier2 = v;
    this.updateSIDC();
  }

  public get additionalInformation(): string {
    return this.pAdditionalInformation;
  }
  public set additionalInformation(v: string) {
    this.pAdditionalInformation = v;
    this.updateSIDC();
  }

  public get altitude(): string {
    return this.pAltitude;
  }
  public set altitude(v: string) {
    this.pAltitude = v;
    this.updateSIDC();
  }

  public get combatEffectiveness(): string {
    return this.pCombatEffectiveness;
  }
  public set combatEffectiveness(v: string) {
    this.pCombatEffectiveness = v;
    this.updateSIDC();
  }

  public get direction(): number {
    return this.pDirection;
  }
  public set direction(v: number) {
    this.pDirection = v;
    this.updateSIDC();
  }

  public get dtg(): string {
    return this.pDtg;
  }
  public set dtg(v: string) {
    this.pDtg = v;
    this.updateSIDC();
  }

  public get evaluationRating(): string {
    return this.pEvaluationRating;
  }
  public set evaluationRating(v: string) {
    this.pEvaluationRating = v;
    this.updateSIDC();
  }

  public get higherFormation(): string {
    return this.pHigherFormation;
  }
  public set higherFormation(v: string) {
    this.pHigherFormation = v;
    this.updateSIDC();
  }

  public get hostile(): string {
    return this.pHostile;
  }
  public set hostile(v: string) {
    this.pHostile = v;
    this.updateSIDC();
  }

  public get iff(): string {
    return this.pIff;
  }
  public set iff(v: string) {
    this.pIff = v;
    this.updateSIDC();
  }

  public get location(): string {
    return this.pLocation;
  }
  public set location(v: string) {
    this.pLocation = v;
    this.updateSIDC();
  }

  public get quantity(): string {
    return this.pQuantity;
  }
  public set quantity(v: string) {
    this.pQuantity = v;
    this.updateSIDC();
  }

  public get reinforcedReduced(): string {
    return this.pReinforcedReduced;
  }
  public set reinforcedReduced(v: string) {
    this.pReinforcedReduced = v;
    this.updateSIDC();
  }

  public get signatureEquipment(): string {
    return this.pSignatureEquipment;
  }
  public set signatureEquipment(v: string) {
    this.pSignatureEquipment = v;
    this.updateSIDC();
  }

  public get specialHeadquarters(): string {
    return this.pSpecialHeadquarters;
  }
  public set specialHeadquarters(v: string) {
    this.pSpecialHeadquarters = v;
    this.updateSIDC();
  }

  public get speed(): string {
    return this.pSpeed;
  }
  public set speed(v: string) {
    this.pSpeed = v;
    this.updateSIDC();
  }

  public get staffComments(): string {
    return this.pStaffComments;
  }
  public set staffComments(v: string) {
    this.pStaffComments = v;
    this.updateSIDC();
  }

  public get mtype(): string {
    return this.pMtype;
  }
  public set mtype(v: string) {
    this.pMtype = v;
    this.updateSIDC();
  }

  public get uniqueDesignation(): string {
    return this.pUniqueDesignation;
  }
  public set uniqueDesignation(v: string) {
    this.pUniqueDesignation = v;
    this.updateSIDC();
  }

  public entityTypeChanged(newET: IEntityType, oldET: IEntityType) {
    this.sidc = newET.sidc;
  }

  private updateSIDC() {
    if (!this.isInitialized) { return; }
    this.sidc = `${this.pCodingScheme}${this.pAffiliation}${this.pBattleDimension}${this.pStatus}${this.pFunctionID}${this.pSymbolModifier1}${this.pSymbolModifier2}--`;
  }

  private redraw() {
    const toUpper = (str?: string) => str ? str.toUpperCase() : null;

    if (!this.isInitialized || !this.entityType || !this.entityType.sidc) { return; }
    const sym = new ms.Symbol(this.entityType.sidc, clean({
      additionalInformation: toUpper(this.pAdditionalInformation),
      altitudeDepth: toUpper(this.pAltitude),
      combatEffectiveness: toUpper(this.pCombatEffectiveness),
      direction: this.pDirection,
      dtg: toUpper(this.pDtg),
      evaluationRating: toUpper(this.pEvaluationRating),
      higherFormation: toUpper(this.pHigherFormation),
      hostile: toUpper(this.pHostile),
      iffSif: toUpper(this.pIff),
      location: toUpper(this.pLocation),
      quantity: toUpper(this.pQuantity),
      reinforcedReduced: toUpper(this.pReinforcedReduced),
      signatureEquipment: toUpper(this.pSignatureEquipment),
      specialHeadquarters: toUpper(this.specialHeadquarters),
      speed: toUpper(this.pSpeed),
      staffComments: toUpper(this.pStaffComments),
      type: toUpper(this.pMtype),
      uniqueDesignation: toUpper(this.pUniqueDesignation)
    } as SymbolOptions));
    const canvas = sym.asCanvas();
    this.entityType.imgDataUrl = canvas.toDataURL();
    this.entityType.iconSize = new Point(canvas.width, canvas.height);
    this.entityType.iconAnchor = new Point(canvas.width / 2, canvas.height / 2);
    // TODO Also set the center point of the icon: iconAnchor
  }
}
