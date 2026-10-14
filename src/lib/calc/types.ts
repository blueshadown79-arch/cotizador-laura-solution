export type SerieType = 'SERIE 20' | 'SERIE 25' | 'SERIE 42' | 'SERIE 62' | 'SERIE 80';

export type ProfileColor = 'NATURAL' | 'BLANCO' | 'NEGRO' | 'MADERA' | 'CHAMPAGNE';

export type GlassType = 'CRUDO' | 'LAMINADO' | 'REFLEJANTE' | 'TEMPLADO';

export type GlassThickness = '6 mm' | '8 mm' | '10 mm';

export type SealingType = 'SILICONA' | 'BURLETE';

export type ItemType = 'VENTANA' | 'MAMPARA';

export type LeafCount = 'DOS_HOJAS' | 'TRES_HOJAS' | 'CUATRO_HOJAS';

export type S42Design = '01 fijo 01 proyectante' | '01 proyectante' | '02 proyectante';

export type S42Arms = '40 cm' | '60 cm';

export type ModulationType =
  | 'DOBLE CORREDIZO'
  | '02 CORREDIZAS 01 FIJO'
  | '02 FIJAS 01 CORREDIZO'
  | '02 FIJAS 02 CORREDIZOS'
  | '04 CORREDIZAS'
  | '03 CORREDIZOS'
  | '03 CORREDIZOS 01 FIJO';

export interface QuoteItem {
  id: string;
  itemNumber: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  itemType: ItemType; // VENTANA | MAMPARA
  leaves: LeafCount;
  modulation: ModulationType;
  handleType: 'MANIJA' | 'SEGURO';
  // Serie 42 specific
  s42Design?: S42Design;
  s42Arms?: S42Arms;
  notes?: string;
}

export interface QuoteSettings {
  serie: SerieType;
  color: ProfileColor;
  glassType: GlassType;
  glassThickness: GlassThickness;
  sealing: SealingType;
  exchangeRate: number; // Tipo de cambio (3.60 - 3.70, por defecto 3.70)
  profitMargin: number; // Porcentaje de ganancia (e.g. 0.30 para 30%)
  installationPerM2: number; // S/ por m2 (e.g. 20 o 45)
  assemblyPerM2: number; // S/ por m2 (e.g. 30)
  mobilityCost: number; // S/ (e.g. 100, 50, 120)
  otherCost: number; // S/ (e.g. 0)
  s42ProfileWaste: number; // 0.05 para 5%
}

export interface CutPiece {
  profileCode: string;
  profileName: string;
  cutName: string; // e.g. "Riel Sup", "Jamba", "Zócalo"
  lengthMm: number;
  quantity: number;
  totalMeters: number;
}

export interface ItemCalculationResult {
  item: QuoteItem;
  areaM2: number;
  unitPrice: number;
  subtotal: number;
  cuts: CutPiece[];
}

export interface ProfileUsage {
  code: string;
  name: string;
  metersUsed: number;
  pricePerRod: number;
  rodsFractional: number; // Metros / 6 (para costeo prorrateado comercial)
  rodsInteger: number; // Math.ceil(Metros / 6) (para compra de taller)
  wasteMeters: number; // (rodsInteger * 6) - metersUsed
  costProrated: number;
  costInteger: number;
}

export interface AccessoryUsage {
  code: string;
  name: string;
  quantity: number;
  unit: string; // 'und' | 'm'
  unitPrice: number;
  totalCost: number;
}

export interface QuoteCalculationSummary {
  areaTotalM2: number;
  itemsResults: ItemCalculationResult[];
  profileUsages: ProfileUsage[];
  accessoryUsages: AccessoryUsage[];
  // Direct Costs
  profilesCostDirect: number; // Prorrateado
  profilesCostWorkshop: number; // Entero
  accessoriesCostDirect: number;
  glassCostDirect: number;
  glassFormulaNote: string; // Explica si fue USD*TC o S/*10.76
  assemblyCostDirect: number;
  otherCostDirect: number;
  totalDirectCost: number; // Perfiles + Accesorios + Vidrio + Armado + Otro Costo
  // Pricing
  priceWithMargin: number; // totalDirectCost / (1 - profitMargin)
  installationCost: number; // areaTotalM2 * installationPerM2 (neto)
  mobilityCost: number; // Neto
  salePriceTotal: number; // priceWithMargin + installationCost + mobilityCost
  pricePerM2: number; // salePriceTotal / areaTotalM2
  grossProfit: number; // salePriceTotal - (totalDirectCost + installationCost + mobilityCost)
  effectiveProfitMarginPct: number;
}

export interface ClientData {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string; // Obra / Ubicación
  quoteNumber: string; // e.g. PRO-0001
  quoteDate: string; // ISO or formatted
  validityDays: number; // e.g. 15
}

export interface CompanyConfig {
  companyName: string;
  commercialName: string;
  ruc: string;
  phones: string[];
  instagram: string;
  address: string;
  terms: string[];
  defaultPin: string;
  defaultExchangeRate: number;
  defaultProfitMargin: number;
}
