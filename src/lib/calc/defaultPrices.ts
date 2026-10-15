import type { CompanyConfig, GlassThickness, GlassType, ProfileColor, SerieType } from './types';

export interface ProfilePriceRow {
  code: string;
  name: string;
  prices: Record<ProfileColor, number>;
}

export interface AccessoryPriceRow {
  code: string;
  name: string;
  unit: string;
  price: number;
}

export interface GlassPriceRow {
  type: GlassType;
  prices: Record<GlassThickness, number>; // PEN/pie2 for CRUDO/LAMINADO/REFLEJANTE; USD/m2 for TEMPLADO
  isUsdPerM2: boolean;
}

export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  companyName: 'Laura Solution S.A.C.',
  commercialName: 'LAURA SOLUTION - Carpintería en Aluminio & Vidrio Templado',
  ruc: '10743370924',
  phones: ['912 791 992'],
  instagram: '@serviciolauraglass',
  address: 'Lima, Perú',
  terms: [
    'Precios expresados en Soles (S/) e incluyen IGV salvo indicación.',
    'Validez de la oferta: 15 días calendario a partir de la fecha de emisión.',
    'Forma de pago: 60% de adelanto al confirmar el pedido y 40% contra entrega e instalación.',
    'Tiempo de fabricación e instalación estimado: 5 a 8 días hábiles tras toma de medidas definitivas.',
    'Garantía de instalación y perfiles: 1 año contra defectos de fabricación.'
  ],
  defaultPin: '1234',
  defaultExchangeRate: 3.70,
  defaultProfitMargin: 0.30,
};

// PRECIOS DE PERFILES POR SERIE (POR VARILLA DE 6 METROS)
export const DEFAULT_PROFILES_BY_SERIE: Record<SerieType, ProfilePriceRow[]> = {
  'SERIE 20': [
    { code: '2001', name: 'Riel Superior', prices: { NATURAL: 50, BLANCO: 60, NEGRO: 60, MADERA: 70, CHAMPAGNE: 65 } },
    { code: '2002', name: 'Riel Inferior', prices: { NATURAL: 60, BLANCO: 60, NEGRO: 60, MADERA: 70, CHAMPAGNE: 65 } },
    { code: '2009', name: 'Jamba Lateral', prices: { NATURAL: 70, BLANCO: 70, NEGRO: 70, MADERA: 80, CHAMPAGNE: 75 } },
    { code: '2005', name: 'Zócalo', prices: { NATURAL: 50, BLANCO: 60, NEGRO: 60, MADERA: 70, CHAMPAGNE: 65 } },
    { code: '2004', name: 'Cabezal', prices: { NATURAL: 40, BLANCO: 50, NEGRO: 50, MADERA: 60, CHAMPAGNE: 55 } },
    { code: '2010', name: 'Parante Lateral Hoja', prices: { NATURAL: 60, BLANCO: 60, NEGRO: 60, MADERA: 70, CHAMPAGNE: 65 } },
    { code: '2011', name: 'Traslape Central', prices: { NATURAL: 50, BLANCO: 60, NEGRO: 60, MADERA: 70, CHAMPAGNE: 65 } },
  ],
  'SERIE 25': [
    { code: '2501', name: 'Riel Superior', prices: { NATURAL: 70, BLANCO: 85, NEGRO: 85, MADERA: 95, CHAMPAGNE: 90 } },
    { code: '2502', name: 'Riel Inferior', prices: { NATURAL: 70, BLANCO: 80, NEGRO: 80, MADERA: 90, CHAMPAGNE: 85 } },
    { code: '2509', name: 'Jamba Lateral', prices: { NATURAL: 52, BLANCO: 62, NEGRO: 62, MADERA: 75, CHAMPAGNE: 70 } },
    { code: '2505', name: 'Zócalo', prices: { NATURAL: 70, BLANCO: 80, NEGRO: 80, MADERA: 90, CHAMPAGNE: 85 } },
    { code: '2504', name: 'Cabezal', prices: { NATURAL: 52, BLANCO: 62, NEGRO: 62, MADERA: 72, CHAMPAGNE: 68 } },
    { code: '2510', name: 'Parante Lateral Hoja', prices: { NATURAL: 55, BLANCO: 65, NEGRO: 65, MADERA: 75, CHAMPAGNE: 70 } },
    { code: '2507', name: 'Traslape Central', prices: { NATURAL: 54, BLANCO: 64, NEGRO: 64, MADERA: 74, CHAMPAGNE: 70 } },
    { code: '2521', name: 'Adaptador', prices: { NATURAL: 45, BLANCO: 55, NEGRO: 55, MADERA: 65, CHAMPAGNE: 60 } },
  ],
  'SERIE 42': [
    { code: '4209', name: 'Marco Exterior', prices: { NATURAL: 38, BLANCO: 90, NEGRO: 80, MADERA: 95, CHAMPAGNE: 85 } },
    { code: '4204', name: 'Travesaño', prices: { NATURAL: 79, BLANCO: 90, NEGRO: 80, MADERA: 95, CHAMPAGNE: 85 } },
    { code: '4202', name: 'Marco Nave (Proyectante)', prices: { NATURAL: 65, BLANCO: 90, NEGRO: 80, MADERA: 95, CHAMPAGNE: 85 } },
    { code: '4203', name: 'Pisavidrio / Junquillo', prices: { NATURAL: 24, BLANCO: 90, NEGRO: 80, MADERA: 95, CHAMPAGNE: 85 } },
  ],
  'SERIE 62': [
    { code: '80501', name: 'Riel Doble', prices: { NATURAL: 50, BLANCO: 60, NEGRO: 70, MADERA: 70, CHAMPAGNE: 65 } },
    { code: '80502', name: 'Marco Hoja', prices: { NATURAL: 70, BLANCO: 70, NEGRO: 70, MADERA: 80, CHAMPAGNE: 75 } },
    { code: '80503', name: 'Traslape', prices: { NATURAL: 50, BLANCO: 50, NEGRO: 50, MADERA: 60, CHAMPAGNE: 55 } },
    { code: '80505', name: 'Adaptador', prices: { NATURAL: 50, BLANCO: 60, NEGRO: 70, MADERA: 70, CHAMPAGNE: 65 } },
  ],
  'SERIE 80': [
    { code: '80501', name: 'Riel Doble', prices: { BLANCO: 50, NEGRO: 60, MADERA: 70, NATURAL: 50, CHAMPAGNE: 65 } },
    { code: '80502', name: 'Riel Triple', prices: { BLANCO: 60, NEGRO: 60, MADERA: 60, NATURAL: 60, CHAMPAGNE: 65 } },
    { code: '80503', name: 'Marco Hoja', prices: { BLANCO: 70, NEGRO: 70, MADERA: 70, NATURAL: 70, CHAMPAGNE: 75 } },
    { code: '80505', name: 'Traslape', prices: { BLANCO: 50, NEGRO: 50, MADERA: 50, NATURAL: 50, CHAMPAGNE: 55 } },
    { code: '80506', name: 'Adaptador', prices: { BLANCO: 50, NEGRO: 60, MADERA: 70, NATURAL: 50, CHAMPAGNE: 65 } },
  ],
};

// PRECIOS DE VIDRIOS (REGLA COMERCIAL EXACTA)
// Vidrio Templado: USD/m2
// Vidrio Crudo, Laminado, Reflejante: PEN/pie2
export const DEFAULT_GLASS_PRICES: GlassPriceRow[] = [
  {
    type: 'CRUDO',
    isUsdPerM2: false,
    prices: { '6 mm': 3.5, '8 mm': 4.5, '10 mm': 5.5 }
  },
  {
    type: 'LAMINADO',
    isUsdPerM2: false,
    prices: { '6 mm': 5.5, '8 mm': 6.5, '10 mm': 7.5 }
  },
  {
    type: 'REFLEJANTE',
    isUsdPerM2: false,
    prices: { '6 mm': 5.0, '8 mm': 8.5, '10 mm': 9.0 }
  },
  {
    type: 'TEMPLADO',
    isUsdPerM2: true, // Multiplicar por T.C. y área en m2
    prices: { '6 mm': 20.0, '8 mm': 30.0, '10 mm': 35.0 }
  }
];

// PRECIOS DE ACCESORIOS POR SERIE
export const DEFAULT_ACCESSORIES_BY_SERIE: Record<SerieType, AccessoryPriceRow[]> = {
  'SERIE 20': [
    { code: 'GUI-20', name: 'Guías de ventana', unit: 'und', price: 1.0 },
    { code: 'GAR-V20', name: 'Garruchas ventana simple', unit: 'und', price: 2.5 },
    { code: 'GAR-M20', name: 'Garruchas mampara', unit: 'und', price: 5.0 },
    { code: 'SEG-20', name: 'Seguro caracol / botón', unit: 'und', price: 15.0 },
    { code: 'MAN-20', name: 'Manija / Cremona', unit: 'und', price: 70.0 },
    { code: 'FEL-20', name: 'Felpa sellado perimetral', unit: 'm', price: 0.40 },
    { code: 'SIL-20', name: 'Silicona neutra estructural', unit: 'm', price: 2.0 },
    { code: 'BUR-20', name: 'Burlete de jebe EPDM', unit: 'm', price: 2.5 },
    { code: 'TOR-20', name: 'Tornillos autorroscantes fijación', unit: 'm2', price: 0.50 },
  ],
  'SERIE 25': [
    { code: 'GUI-25', name: 'Guías de ventana', unit: 'und', price: 2.0 },
    { code: 'GAR-V25', name: 'Garruchas ventana', unit: 'und', price: 3.0 },
    { code: 'GAR-M25', name: 'Garruchas mampara de uso rudo', unit: 'und', price: 4.0 },
    { code: 'SEG-25', name: 'Seguro caracol reforzado', unit: 'und', price: 20.0 },
    { code: 'MAN-25', name: 'Manija de cierre', unit: 'und', price: 70.0 },
    { code: 'FEL-25', name: 'Felpa importada', unit: 'm', price: 0.40 },
    { code: 'SIL-25', name: 'Silicona sellado perimetral', unit: 'm', price: 1.00 },
    { code: 'BUR-25', name: 'Burlete vinílico', unit: 'm', price: 3.00 },
    { code: 'TOR-25', name: 'Tornillos autorroscantes fijación', unit: 'm2', price: 0.50 },
  ],
  'SERIE 42': [
    { code: 'MAN-42', name: 'Manija proyectante', unit: 'und', price: 13.0 },
    { code: 'BRZ-40', name: 'Brazos de fricción 40 cm', unit: 'und', price: 40.0 },
    { code: 'BRZ-60', name: 'Brazos de fricción 60 cm', unit: 'und', price: 80.0 },
    { code: 'BUR-42', name: 'Burlete perimetral proyectante', unit: 'm', price: 1.0 },
    { code: 'FEL-42', name: 'Felpa acústica', unit: 'm', price: 0.40 },
    { code: 'SIL-42', name: 'Silicona neutra', unit: 'm', price: 2.0 },
    { code: 'TOR-42', name: 'Tornillería y remaches', unit: 'm2', price: 0.50 },
  ],
  'SERIE 62': [
    { code: 'GAR-V62', name: 'Garruchas ventana', unit: 'und', price: 2.5 },
    { code: 'GAR-M62', name: 'Garruchas mampara', unit: 'und', price: 5.0 },
    { code: 'GUI-62', name: 'Guías', unit: 'und', price: 1.0 },
    { code: 'SEG-62', name: 'Seguro', unit: 'und', price: 15.0 },
    { code: 'MAN-62', name: 'Manija + Set Cremona', unit: 'und', price: 70.0 },
    { code: 'ESC-A62', name: 'Escuadras alineamiento', unit: 'und', price: 0.50 },
    { code: 'ESC-E62', name: 'Escuadras ensamblaje', unit: 'und', price: 5.00 },
    { code: 'ESC-P62', name: 'Escuadras de precisión', unit: 'und', price: 6.00 },
    { code: 'FEL-62', name: 'Felpa', unit: 'm', price: 0.40 },
    { code: 'BUR-62', name: 'Burlete', unit: 'm', price: 2.50 },
    { code: 'SIL-62', name: 'Silicona', unit: 'm', price: 2.00 },
    { code: 'TOR-62', name: 'Tornillos', unit: 'm2', price: 0.50 },
  ],
  'SERIE 80': [
    { code: 'GAR-V80', name: 'Garruchas ventana pesada', unit: 'und', price: 2.5 },
    { code: 'GAR-M80', name: 'Garruchas mampara pesada', unit: 'und', price: 5.0 },
    { code: 'GUI-80', name: 'Guías Serie 80', unit: 'und', price: 1.0 },
    { code: 'SEG-80', name: 'Seguro embutido', unit: 'und', price: 15.0 },
    { code: 'MAN-80', name: 'Set Cremona multipunto y manija', unit: 'und', price: 70.0 },
    { code: 'ESC-A80', name: 'Escuadras de alineamiento', unit: 'und', price: 0.50 },
    { code: 'ESC-E80', name: 'Escuadras de ensamblaje reforzado', unit: 'und', price: 5.00 },
    { code: 'ESC-P80', name: 'Escuadras de precisión', unit: 'und', price: 6.00 },
    { code: 'FEL-80', name: 'Felpa para hojas y traslape', unit: 'm', price: 0.40 },
    { code: 'FEL-R80', name: 'Felpa / Accesorios para riel (doble y triple)', unit: 'm', price: 2.00 },
    { code: 'BUR-80', name: 'Burlete hermético', unit: 'm', price: 2.50 },
    { code: 'SIL-80', name: 'Silicona sellado perimetral', unit: 'm', price: 2.00 },
    { code: 'TOR-80', name: 'Tornillos y anclajes', unit: 'm2', price: 0.50 },
  ],
};
