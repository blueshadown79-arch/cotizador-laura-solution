import type {
  AccessoryUsage,
  CutPiece,
  ItemCalculationResult,
  ProfileUsage,
  QuoteCalculationSummary,
  QuoteItem,
  QuoteSettings,
  SerieType,
} from './types';
import {
  DEFAULT_ACCESSORIES_BY_SERIE,
  DEFAULT_GLASS_PRICES,
  DEFAULT_PROFILES_BY_SERIE,
} from './defaultPrices';

/**
 * MOTOR DE CÁLCULO PRINCIPAL: COTIZADOR LAURA SOLUTION
 *
 * Replica con exactitud matemática el libro COTIZADOR.xlsx para todas las series:
 * SERIE 20, 25, 42, 62, 80.
 *
 * Incluye correcciones de negocio aprobadas:
 * 1. Vidrio Templado: USD/m2 * TC * Área(m2)
 * 2. Vidrio Crudo/Laminado/Reflejante: PEN/pie2 * 10.76 * Área(m2) (sin TC)
 * 3. Fix Serie 42: Evalúa glassType === 'TEMPLADO', merma configurable (5%)
 * 4. Fix Serie 80: Felpa en riel incluye riel doble + riel triple: (m_doble + m_triple) * 2
 * 5. Arquitectura financiera: (Costo_Directo / (1 - Margen)) + Instalacion + Movilidad
 * 6. Desglose doble de varillas: Prorrateado (comercial) y Entero con sobrante (taller)
 */

export function calculateQuote(
  items: QuoteItem[],
  settings: QuoteSettings,
  customProfiles = DEFAULT_PROFILES_BY_SERIE,
  customAccessories = DEFAULT_ACCESSORIES_BY_SERIE,
  customGlass = DEFAULT_GLASS_PRICES
): QuoteCalculationSummary {
  const activeItems = items.filter(it => it.widthMm > 0 && it.heightMm > 0 && it.quantity > 0);

  const areaTotalM2 = activeItems.reduce((acc, it) => {
    return acc + (it.widthMm * it.heightMm * it.quantity) / 1000000;
  }, 0);

  // Mapeos de perfiles y accesorios acumulados
  const profileMetersMap = new Map<string, { code: string; name: string; meters: number }>();
  const accessoryQtyMap = new Map<string, { code: string; name: string; qty: number; unit: string; price: number }>();

  // Helper para sumar perfiles
  const addProfileMeters = (code: string, name: string, meters: number) => {
    if (meters <= 0) return;
    const current = profileMetersMap.get(code) || { code, name, meters: 0 };
    current.meters += meters;
    profileMetersMap.set(code, current);
  };

  // Helper para sumar accesorios
  const addAccessory = (code: string, name: string, qty: number, unit: string, price: number) => {
    if (qty <= 0) return;
    const current = accessoryQtyMap.get(code) || { code, name, qty: 0, unit, price };
    current.qty += qty;
    accessoryQtyMap.set(code, current);
  };

  // Helper para obtener precio unitario de accesorio por defecto de la serie
  const getAccPrice = (serie: SerieType, code: string, fallback: number): number => {
    const list = customAccessories[serie] || [];
    const found = list.find(a => a.code === code);
    return found ? found.price : fallback;
  };

  // Metrajes especiales para accesorios globales
  let totalMetersRielDoble = 0;
  let totalMetersRielTriple = 0;
  let totalMetersMarcoHoja = 0;
  let totalMetersTraslape = 0;
  let totalMetersAdaptador = 0;

  // 1. CÁLCULO DE CORTES POR ÍTEM SEGÚN SERIE
  const itemsResults: ItemCalculationResult[] = activeItems.map(item => {
    const areaM2 = (item.widthMm * item.heightMm * item.quantity) / 1000000;
    const cuts: CutPiece[] = [];
    const w = item.widthMm;
    const h = item.heightMm;
    const q = item.quantity;
    const isMampara = item.itemType === 'MAMPARA';

    if (settings.serie === 'SERIE 20') {
      // Perfiles S20: 2001 (Riel Sup), 2002 (Riel Inf), 2009 (Jamba), 2005 (Zócalo), 2004 (Cabezal), 2010 (Parante), 2011 (Traslape)
      const rielLen = w - 12;
      cuts.push({ profileCode: '2001', profileName: 'Riel Superior', cutName: 'Riel Superior', lengthMm: rielLen, quantity: 1 * q, totalMeters: (rielLen * q) / 1000 });
      cuts.push({ profileCode: '2002', profileName: 'Riel Inferior', cutName: 'Riel Inferior', lengthMm: rielLen, quantity: 1 * q, totalMeters: (rielLen * q) / 1000 });
      cuts.push({ profileCode: '2009', profileName: 'Jamba Lateral', cutName: 'Jamba Lateral', lengthMm: h, quantity: 2 * q, totalMeters: (h * 2 * q) / 1000 });

      let zocaloLen = 0;
      let leafHojasCount = 2;
      let paranteCant = 2;
      let traslapeCant = 2;

      if (item.leaves === 'DOS_HOJAS') {
        zocaloLen = Math.round(w / 2 + 7);
        leafHojasCount = 2;
        paranteCant = 2;
        traslapeCant = 2;
      } else if (item.leaves === 'TRES_HOJAS') {
        zocaloLen = Math.round(w / 3 + 18);
        leafHojasCount = 3;
        paranteCant = 2;
        traslapeCant = 4;
      } else {
        // CUATRO_HOJAS
        zocaloLen = Math.round(w / 4 + 10);
        leafHojasCount = 4;
        paranteCant = 4;
        traslapeCant = 4;
      }

      const cabezalLen = zocaloLen + 2;
      const hojaAltLen = h - 30;

      cuts.push({ profileCode: '2005', profileName: 'Zócalo', cutName: 'Zócalo', lengthMm: zocaloLen, quantity: leafHojasCount * q, totalMeters: (zocaloLen * leafHojasCount * q) / 1000 });
      cuts.push({ profileCode: '2004', profileName: 'Cabezal', cutName: 'Cabezal', lengthMm: cabezalLen, quantity: leafHojasCount * q, totalMeters: (cabezalLen * leafHojasCount * q) / 1000 });
      cuts.push({ profileCode: '2010', profileName: 'Parante Lateral Hoja', cutName: 'Parante', lengthMm: hojaAltLen, quantity: paranteCant * q, totalMeters: (hojaAltLen * paranteCant * q) / 1000 });
      cuts.push({ profileCode: '2011', profileName: 'Traslape Central', cutName: 'Traslape', lengthMm: hojaAltLen, quantity: traslapeCant * q, totalMeters: (hojaAltLen * traslapeCant * q) / 1000 });

      // Accesorios Ítem S20:
      const guiasCant = leafHojasCount * 4 * q;
      const garruchasCant = (item.leaves === 'DOS_HOJAS' ? 4 : item.leaves === 'TRES_HOJAS' ? 4 : 4) * q;
      const seguroCant = (item.leaves === 'CUATRO_HOJAS' ? 2 : 1) * 2 * q; // 2 seguros por ventana típica

      addAccessory('GUI-20', 'Guías de ventana', guiasCant, 'und', getAccPrice('SERIE 20', 'GUI-20', 1.0));
      if (isMampara) {
        addAccessory('GAR-M20', 'Garruchas mampara', garruchasCant, 'und', getAccPrice('SERIE 20', 'GAR-M20', 5.0));
      } else {
        addAccessory('GAR-V20', 'Garruchas ventana simple', garruchasCant, 'und', getAccPrice('SERIE 20', 'GAR-V20', 2.5));
      }
      addAccessory('SEG-20', 'Seguro caracol / botón', seguroCant, 'und', getAccPrice('SERIE 20', 'SEG-20', 15.0));

    } else if (settings.serie === 'SERIE 25') {
      // Perfiles S25: 2501, 2502, 2509, 2505, 2504, 2510, 2507, 2521
      const rielLen = w - 16;
      cuts.push({ profileCode: '2501', profileName: 'Riel Superior', cutName: 'Riel Superior', lengthMm: rielLen, quantity: 1 * q, totalMeters: (rielLen * q) / 1000 });
      cuts.push({ profileCode: '2502', profileName: 'Riel Inferior', cutName: 'Riel Inferior', lengthMm: rielLen, quantity: 1 * q, totalMeters: (rielLen * q) / 1000 });
      cuts.push({ profileCode: '2509', profileName: 'Jamba Lateral', cutName: 'Jamba Lateral', lengthMm: h, quantity: 2 * q, totalMeters: (h * 2 * q) / 1000 });

      let zocaloLen = 0;
      let leafHojasCount = 2;
      let paranteCant = 2;
      let traslapeCant = 2;
      let tieneAdaptador = false;

      if (item.leaves === 'DOS_HOJAS') {
        zocaloLen = Math.round(w / 2 + 1);
        leafHojasCount = 2;
        paranteCant = 2;
        traslapeCant = 2;
      } else if (item.leaves === 'TRES_HOJAS') {
        zocaloLen = Math.round(w / 3 + 15);
        leafHojasCount = 3;
        paranteCant = 2;
        traslapeCant = 4;
      } else {
        // CUATRO_HOJAS
        zocaloLen = Math.round(w / 4 + 9);
        leafHojasCount = 4;
        paranteCant = 4;
        traslapeCant = 4;
        tieneAdaptador = true;
      }

      const cabezalLen = zocaloLen + 2;
      const hojaAltLen = h - 33;

      cuts.push({ profileCode: '2505', profileName: 'Zócalo', cutName: 'Zócalo', lengthMm: zocaloLen, quantity: leafHojasCount * q, totalMeters: (zocaloLen * leafHojasCount * q) / 1000 });
      cuts.push({ profileCode: '2504', profileName: 'Cabezal', cutName: 'Cabezal', lengthMm: cabezalLen, quantity: leafHojasCount * q, totalMeters: (cabezalLen * leafHojasCount * q) / 1000 });
      cuts.push({ profileCode: '2510', profileName: 'Parante Lateral Hoja', cutName: 'Parante', lengthMm: hojaAltLen, quantity: paranteCant * q, totalMeters: (hojaAltLen * paranteCant * q) / 1000 });
      cuts.push({ profileCode: '2507', profileName: 'Traslape Central', cutName: 'Traslape', lengthMm: hojaAltLen, quantity: traslapeCant * q, totalMeters: (hojaAltLen * traslapeCant * q) / 1000 });

      if (tieneAdaptador) {
        cuts.push({ profileCode: '2521', profileName: 'Adaptador', cutName: 'Adaptador', lengthMm: hojaAltLen, quantity: 1 * q, totalMeters: (hojaAltLen * q) / 1000 });
      }

      // Accesorios Ítem S25:
      const guiasCant = leafHojasCount * 4 * q;
      const garruchasCant = (item.leaves === 'DOS_HOJAS' ? 4 : item.leaves === 'TRES_HOJAS' ? 4 : 4) * q;
      const seguroCant = (item.leaves === 'CUATRO_HOJAS' ? 2 : 1) * 2 * q;

      addAccessory('GUI-25', 'Guías de ventana', guiasCant, 'und', getAccPrice('SERIE 25', 'GUI-25', 2.0));
      if (isMampara) {
        addAccessory('GAR-M25', 'Garruchas mampara de uso rudo', garruchasCant, 'und', getAccPrice('SERIE 25', 'GAR-M25', 4.0));
      } else {
        addAccessory('GAR-V25', 'Garruchas ventana', garruchasCant, 'und', getAccPrice('SERIE 25', 'GAR-V25', 3.0));
      }
      addAccessory('SEG-25', 'Seguro caracol reforzado', seguroCant, 'und', getAccPrice('SERIE 25', 'SEG-25', 20.0));

    } else if (settings.serie === 'SERIE 42') {
      // PROYECTANTE: 4209, 4204, 4202, 4203
      const design = item.s42Design || '01 fijo 01 proyectante';
      const is01Fijo01Proy = design === '01 fijo 01 proyectante';
      const is01Proy = design === '01 proyectante';
      const is02Proy = design === '02 proyectante';

      // 4209 Marco Exterior
      cuts.push({ profileCode: '4209', profileName: 'Marco Exterior', cutName: 'Marco Horizontal', lengthMm: w, quantity: 2 * q, totalMeters: (w * 2 * q) / 1000 });
      cuts.push({ profileCode: '4209', profileName: 'Marco Exterior', cutName: 'Marco Vertical', lengthMm: h, quantity: 2 * q, totalMeters: (h * 2 * q) / 1000 });

      // 4204 Travesaño
      if (is01Fijo01Proy) {
        const travLen = w - 31;
        cuts.push({ profileCode: '4204', profileName: 'Travesaño', cutName: 'Travesaño Horizontal', lengthMm: travLen, quantity: 1 * q, totalMeters: (travLen * q) / 1000 });
      } else if (is02Proy) {
        const travLen = h - 31;
        cuts.push({ profileCode: '4204', profileName: 'Travesaño', cutName: 'Travesaño Vertical', lengthMm: travLen, quantity: 1 * q, totalMeters: (travLen * q) / 1000 });
      }

      // 4202 Marco Nave
      let naveHoriz = 0;
      let naveVert = 0;
      let naveCantHoriz = 2 * q;
      let naveCantVert = 2 * q;

      if (is01Fijo01Proy) {
        naveHoriz = w - 18;
        naveVert = Math.round((h / 2) - 15);
      } else if (is01Proy) {
        naveHoriz = w - 18;
        naveVert = h - 15;
      } else if (is02Proy) {
        naveHoriz = Math.round((w / 2) - 15);
        naveVert = h - 18;
        naveCantHoriz = 4 * q;
        naveCantVert = 4 * q;
      }

      cuts.push({ profileCode: '4202', profileName: 'Marco Nave (Proyectante)', cutName: 'Nave Horizontal', lengthMm: naveHoriz, quantity: naveCantHoriz, totalMeters: (naveHoriz * naveCantHoriz) / 1000 });
      cuts.push({ profileCode: '4202', profileName: 'Marco Nave (Proyectante)', cutName: 'Nave Vertical', lengthMm: naveVert, quantity: naveCantVert, totalMeters: (naveVert * naveCantVert) / 1000 });

      // 4203 Pisavidrio Nave
      const pisaHoriz = naveHoriz - 71;
      const pisaVert = naveVert - 71;
      cuts.push({ profileCode: '4203', profileName: 'Pisavidrio / Junquillo', cutName: 'Pisavidrio Nave Horiz', lengthMm: pisaHoriz, quantity: naveCantHoriz, totalMeters: (pisaHoriz * naveCantHoriz) / 1000 });
      cuts.push({ profileCode: '4203', profileName: 'Pisavidrio / Junquillo', cutName: 'Pisavidrio Nave Vert', lengthMm: pisaVert, quantity: naveCantVert, totalMeters: (pisaVert * naveCantVert) / 1000 });

      // 4203 Pisavidrio Fijo adicional (si es 01 fijo 01 proyectante)
      if (is01Fijo01Proy) {
        const pisaFijoHoriz = w - 31;
        const pisaFijoVert = Math.round((h / 2) - 28);
        cuts.push({ profileCode: '4203', profileName: 'Pisavidrio / Junquillo', cutName: 'Pisavidrio Fijo Horiz', lengthMm: pisaFijoHoriz, quantity: 2 * q, totalMeters: (pisaFijoHoriz * 2 * q) / 1000 });
        cuts.push({ profileCode: '4203', profileName: 'Pisavidrio / Junquillo', cutName: 'Pisavidrio Fijo Vert', lengthMm: pisaFijoVert, quantity: 2 * q, totalMeters: (pisaFijoVert * 2 * q) / 1000 });
      }

      // Accesorios Serie 42:
      const navesCount = (is02Proy ? 2 : 1) * q;
      addAccessory('MAN-42', 'Manija proyectante', navesCount, 'und', getAccPrice('SERIE 42', 'MAN-42', 13.0));

      const armsLength = item.s42Arms || '40 cm';
      if (armsLength === '60 cm') {
        addAccessory('BRZ-60', 'Brazos de fricción 60 cm', navesCount, 'und', getAccPrice('SERIE 42', 'BRZ-60', 80.0));
      } else {
        addAccessory('BRZ-40', 'Brazos de fricción 40 cm', navesCount, 'und', getAccPrice('SERIE 42', 'BRZ-40', 40.0));
      }

      // Burlete perimetral nave
      const burleteMeters = (naveHoriz * naveCantHoriz + naveVert * naveCantVert) / 1000;
      addAccessory('BUR-42', 'Burlete perimetral proyectante', burleteMeters, 'm', getAccPrice('SERIE 42', 'BUR-42', 1.0));

    } else {
      // SERIE 80 / SERIE 62 (Corrediza Pesada)
      const serieKey = settings.serie === 'SERIE 62' ? 'SERIE 62' : 'SERIE 80';
      const mod = item.modulation;
      const isTripleRiel = mod === '03 CORREDIZOS' || mod === '03 CORREDIZOS 01 FIJO';

      let numHojas = 2;
      let cantTraslapes = 2;
      let tieneAdaptador = false;

      if (mod === 'DOBLE CORREDIZO') {
        numHojas = 2;
        cantTraslapes = 2;
      } else if (mod === '02 CORREDIZAS 01 FIJO' || mod === '02 FIJAS 01 CORREDIZO' || mod === '03 CORREDIZOS') {
        numHojas = 3;
        cantTraslapes = 4;
      } else if (mod === '03 CORREDIZOS 01 FIJO') {
        numHojas = 4;
        cantTraslapes = 6;
      } else {
        // '02 FIJAS 02 CORREDIZOS' o '04 CORREDIZAS'
        numHojas = 4;
        cantTraslapes = 4;
        if (mod === '02 FIJAS 02 CORREDIZOS') tieneAdaptador = true;
      }

      // Riel Doble vs Triple
      if (!isTripleRiel) {
        // Riel Doble (80501)
        cuts.push({ profileCode: '80501', profileName: 'Riel Doble', cutName: 'Riel Doble Horiz', lengthMm: w, quantity: 2 * q, totalMeters: (w * 2 * q) / 1000 });
        cuts.push({ profileCode: '80501', profileName: 'Riel Doble', cutName: 'Lateral Riel Doble', lengthMm: h, quantity: 2 * q, totalMeters: (h * 2 * q) / 1000 });
        totalMetersRielDoble += (w * 2 + h * 2) * q / 1000;
      } else {
        // Riel Triple (80502)
        cuts.push({ profileCode: '80502', profileName: 'Riel Triple', cutName: 'Riel Triple Horiz', lengthMm: w, quantity: 2 * q, totalMeters: (w * 2 * q) / 1000 });
        cuts.push({ profileCode: '80502', profileName: 'Riel Triple', cutName: 'Lateral Riel Triple', lengthMm: h, quantity: 2 * q, totalMeters: (h * 2 * q) / 1000 });
        totalMetersRielTriple += (w * 2 + h * 2) * q / 1000;
      }

      // Marco Hoja (80503)
      const marcoHojaHorizLen = Math.round(w / numHojas + 11);
      const marcoHojaVertLen = h - 56;
      const cantMarcoHoriz = numHojas * 2 * q;
      const cantMarcoVert = numHojas * 2 * q;

      cuts.push({ profileCode: '80503', profileName: 'Marco Hoja', cutName: 'Marco Hoja Horiz', lengthMm: marcoHojaHorizLen, quantity: cantMarcoHoriz, totalMeters: (marcoHojaHorizLen * cantMarcoHoriz) / 1000 });
      cuts.push({ profileCode: '80503', profileName: 'Marco Hoja', cutName: 'Marco Hoja Vert', lengthMm: marcoHojaVertLen, quantity: cantMarcoVert, totalMeters: (marcoHojaVertLen * cantMarcoVert) / 1000 });
      totalMetersMarcoHoja += (marcoHojaHorizLen * cantMarcoHoriz + marcoHojaVertLen * cantMarcoVert) / 1000;

      // Traslape (80505)
      cuts.push({ profileCode: '80505', profileName: 'Traslape', cutName: 'Traslape', lengthMm: marcoHojaVertLen, quantity: cantTraslapes * q, totalMeters: (marcoHojaVertLen * cantTraslapes * q) / 1000 });
      totalMetersTraslape += (marcoHojaVertLen * cantTraslapes * q) / 1000;

      // Adaptador (80506)
      if (tieneAdaptador) {
        cuts.push({ profileCode: '80506', profileName: 'Adaptador', cutName: 'Adaptador', lengthMm: marcoHojaVertLen, quantity: 1 * q, totalMeters: (marcoHojaVertLen * q) / 1000 });
        totalMetersAdaptador += (marcoHojaVertLen * q) / 1000;
      }

      // Accesorios Ítem Serie 80 / 62:
      const garruchasCant = (numHojas === 2 || mod === '02 CORREDIZAS 01 FIJO' || mod === '02 FIJAS 02 CORREDIZOS' ? 4 : 6) * q;
      if (isMampara) {
        addAccessory(`GAR-M${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Garruchas mampara pesada', garruchasCant, 'und', getAccPrice(serieKey, `GAR-M${serieKey === 'SERIE 62' ? '62' : '80'}`, 5.0));
      } else {
        addAccessory(`GAR-V${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Garruchas ventana pesada', garruchasCant, 'und', getAccPrice(serieKey, `GAR-V${serieKey === 'SERIE 62' ? '62' : '80'}`, 2.5));
      }

      const manijaCant = (mod === '02 CORREDIZAS 01 FIJO' || mod === '03 CORREDIZOS 01 FIJO' ? 1 : 2) * q;
      addAccessory(`MAN-${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Set Cremona multipunto y manija', manijaCant, 'und', getAccPrice(serieKey, `MAN-${serieKey === 'SERIE 62' ? '62' : '80'}`, 70.0));

      const escAlineamientoCant = (numHojas === 2 ? 16 : numHojas === 3 ? 24 : 32) * q;
      const escEnsamblajeCant = (numHojas === 2 ? 8 : numHojas === 3 ? 12 : 16) * q;
      const guiasS80Cant = (numHojas === 2 ? 8 : numHojas === 3 ? 12 : 16) * q;

      addAccessory(`ESC-A${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Escuadras alineamiento', escAlineamientoCant, 'und', getAccPrice(serieKey, `ESC-A${serieKey === 'SERIE 62' ? '62' : '80'}`, 0.50));
      addAccessory(`ESC-E${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Escuadras ensamblaje', escEnsamblajeCant, 'und', getAccPrice(serieKey, `ESC-E${serieKey === 'SERIE 62' ? '62' : '80'}`, 5.00));
      addAccessory(`GUI-${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Guías', guiasS80Cant, 'und', getAccPrice(serieKey, `GUI-${serieKey === 'SERIE 62' ? '62' : '80'}`, 1.00));
      addAccessory(`ESC-P${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Escuadras de precisión', 4 * q, 'und', getAccPrice(serieKey, `ESC-P${serieKey === 'SERIE 62' ? '62' : '80'}`, 6.00));
    }

    // Acumular metros de cortes en el mapa de perfiles
    cuts.forEach(c => {
      addProfileMeters(c.profileCode, c.profileName, c.totalMeters);
    });

    return {
      item,
      areaM2,
      unitPrice: 0, // Se computa después al obtener precio por m2
      subtotal: 0,
      cuts,
    };
  });

  // ACCESORIOS GLOBALES / PERIMETRALES SEGÚN SERIE
  if (settings.serie === 'SERIE 20') {
    // Felpa: ~8.85m por m2 según perfiles S20
    const felpaMeters = (profileMetersMap.get('2010')?.meters || 0) * 2 + (profileMetersMap.get('2011')?.meters || 0) * 2;
    addAccessory('FEL-20', 'Felpa sellado perimetral', felpaMeters || areaTotalM2 * 8.85, 'm', getAccPrice('SERIE 20', 'FEL-20', 0.40));

    if (settings.sealing === 'SILICONA') {
      const siliconaMeters = (profileMetersMap.get('2005')?.meters || 0) * 4 + (profileMetersMap.get('2004')?.meters || 0) * 4;
      addAccessory('SIL-20', 'Silicona neutra estructural', siliconaMeters || areaTotalM2 * 9.58, 'm', getAccPrice('SERIE 20', 'SIL-20', 2.0));
    } else {
      const burleteMeters = (profileMetersMap.get('2005')?.meters || 0) * 4 + (profileMetersMap.get('2004')?.meters || 0) * 4;
      addAccessory('BUR-20', 'Burlete de jebe EPDM', burleteMeters || areaTotalM2 * 9.58, 'm', getAccPrice('SERIE 20', 'BUR-20', 2.5));
    }
    addAccessory('TOR-20', 'Tornillos autorroscantes fijación', areaTotalM2, 'm2', getAccPrice('SERIE 20', 'TOR-20', 0.50));

  } else if (settings.serie === 'SERIE 25') {
    // Felpa S25: ~6.10m por m2
    const felpaMeters = (profileMetersMap.get('2510')?.meters || 0) * 2 + (profileMetersMap.get('2507')?.meters || 0) * 2;
    addAccessory('FEL-25', 'Felpa importada', felpaMeters || areaTotalM2 * 6.10, 'm', getAccPrice('SERIE 25', 'FEL-25', 0.40));

    if (settings.sealing === 'SILICONA') {
      const silMeters = (profileMetersMap.get('2505')?.meters || 0) * 3 + (profileMetersMap.get('2504')?.meters || 0) * 3;
      addAccessory('SIL-25', 'Silicona sellado perimetral', silMeters || areaTotalM2 * 4.57, 'm', getAccPrice('SERIE 25', 'SIL-25', 1.0));
    } else {
      const burMeters = (profileMetersMap.get('2505')?.meters || 0) * 2 + (profileMetersMap.get('2504')?.meters || 0) * 2;
      addAccessory('BUR-25', 'Burlete vinílico', burMeters || areaTotalM2 * 2.82, 'm', getAccPrice('SERIE 25', 'BUR-25', 3.0));
    }
    addAccessory('TOR-25', 'Tornillos autorroscantes fijación', areaTotalM2, 'm2', getAccPrice('SERIE 25', 'TOR-25', 0.50));

  } else if (settings.serie === 'SERIE 42') {
    addAccessory('TOR-42', 'Tornillería y remaches', areaTotalM2, 'm2', getAccPrice('SERIE 42', 'TOR-42', 0.50));

  } else {
    // SERIE 80 / SERIE 62
    const serieKey = settings.serie === 'SERIE 62' ? 'SERIE 62' : 'SERIE 80';

    // Burlete en marco hoja (AP13):
    addAccessory(`BUR-${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Burlete hermético', totalMetersMarcoHoja, 'm', getAccPrice(serieKey, `BUR-${serieKey === 'SERIE 62' ? '62' : '80'}`, 2.50));

    // Felpa para hojas y traslape: (m_hoja + m_riel_doble + m_riel_triple + m_traslape + m_adaptador) * 2
    const felpaMetersHoja = (totalMetersMarcoHoja + totalMetersRielDoble + totalMetersRielTriple + totalMetersTraslape + totalMetersAdaptador) * 2;
    addAccessory(`FEL-${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Felpa para hojas y traslape', felpaMetersHoja, 'm', getAccPrice(serieKey, `FEL-${serieKey === 'SERIE 62' ? '62' : '80'}`, 0.40));

    // FIX SERIE 80 SOLICITADO:
    // Metros_Accesorios = (metros_riel_doble + metros_riel_triple) * 2
    const metrosAccesoriosRiel = (totalMetersRielDoble + totalMetersRielTriple) * 2;
    addAccessory(
      `FEL-R${serieKey === 'SERIE 62' ? '62' : '80'}`,
      'Felpa / Accesorios para riel (doble y triple)',
      metrosAccesoriosRiel,
      'm',
      getAccPrice(serieKey, `FEL-R${serieKey === 'SERIE 62' ? '62' : '80'}`, 2.00)
    );

    addAccessory(`TOR-${serieKey === 'SERIE 62' ? '62' : '80'}`, 'Tornillos y anclajes', areaTotalM2, 'm2', getAccPrice(serieKey, `TOR-${serieKey === 'SERIE 62' ? '62' : '80'}`, 0.50));
  }

  // 2. CONSTRUCCIÓN DE USOS DE PERFILES Y PRECIOS
  const profilePriceList = customProfiles[settings.serie] || [];
  const profileUsages: ProfileUsage[] = [];

  let sumProfilesCostProrated = 0;
  let sumProfilesCostInteger = 0;

  profileMetersMap.forEach(item => {
    const priceRow = profilePriceList.find(p => p.code === item.code);
    const pricePerRod = priceRow ? (priceRow.prices[settings.color] ?? priceRow.prices.NATURAL ?? 60) : 60;

    const rodsFractional = item.meters / 6;
    const rodsInteger = Math.ceil(item.meters / 6);
    const wasteMeters = (rodsInteger * 6) - item.meters;

    const costProrated = rodsFractional * pricePerRod;
    const costInteger = rodsInteger * pricePerRod;

    sumProfilesCostProrated += costProrated;
    sumProfilesCostInteger += costInteger;

    profileUsages.push({
      code: item.code,
      name: item.name,
      metersUsed: item.meters,
      pricePerRod,
      rodsFractional,
      rodsInteger,
      wasteMeters: Math.max(0, wasteMeters),
      costProrated,
      costInteger,
    });
  });

  // 3. CONSTRUCCIÓN DE USOS DE ACCESORIOS Y PRECIOS
  const accessoryUsages: AccessoryUsage[] = [];
  let sumAccessoriesCost = 0;

  accessoryQtyMap.forEach(acc => {
    const totalCost = acc.qty * acc.price;
    sumAccessoriesCost += totalCost;
    accessoryUsages.push({
      code: acc.code,
      name: acc.name,
      quantity: acc.qty,
      unit: acc.unit,
      unitPrice: acc.price,
      totalCost,
    });
  });

  // APLICACIÓN DE MERMA EN SERIE 42
  // Si es Serie 42, se aplica merma del 5% configurable sobre materiales directos
  let perfilesFinalCostDirect = sumProfilesCostProrated;
  let accessoriesFinalCostDirect = sumAccessoriesCost;

  if (settings.serie === 'SERIE 42') {
    const wasteFactor = 1 + (settings.s42ProfileWaste || 0.05);
    perfilesFinalCostDirect = sumProfilesCostProrated * wasteFactor;
    accessoriesFinalCostDirect = sumAccessoriesCost * wasteFactor;
  }

  // 4. CÁLCULO DE COSTO DE VIDRIO CON REGLA COMERCIAL EXACTA
  const glassRow = customGlass.find(g => g.type === settings.glassType);
  const isTemplado = settings.glassType === 'TEMPLADO';
  const glassBasePrice = glassRow ? (glassRow.prices[settings.glassThickness] ?? 20) : 20;

  let glassCostDirect = 0;
  let glassFormulaNote = '';

  if (isTemplado) {
    // Vidrio Templado: Área(m2) * Precio(USD) * Tipo_Cambio
    const tc = settings.exchangeRate || 3.70;
    glassCostDirect = areaTotalM2 * glassBasePrice * tc;
    glassFormulaNote = `${areaTotalM2.toFixed(2)} m² × $${glassBasePrice.toFixed(2)} USD × T.C. ${tc.toFixed(2)} = S/ ${glassCostDirect.toFixed(2)}`;
  } else {
    // Vidrio Crudo, Laminado, Reflejante: Área(m2) * 10.76 * Precio(PEN/pie2)
    glassCostDirect = areaTotalM2 * 10.76 * glassBasePrice;
    glassFormulaNote = `${areaTotalM2.toFixed(2)} m² × 10.76 × S/ ${glassBasePrice.toFixed(2)}/pie² = S/ ${glassCostDirect.toFixed(2)}`;
  }

  // 5. COSTO DE ARMADO
  const assemblyCostDirect = areaTotalM2 * (settings.assemblyPerM2 || 30);
  const otherCostDirect = settings.otherCost || 0;

  // 6. COSTO DIRECTO TOTAL
  const totalDirectCost = perfilesFinalCostDirect + accessoriesFinalCostDirect + glassCostDirect + assemblyCostDirect + otherCostDirect;

  // 7. PRECIO CON MARGEN COMERCIAL SOBRE VENTA
  // Costo_Directo / (1 - %Margen)
  const margin = Math.min(0.90, Math.max(0.01, settings.profitMargin || 0.30));
  const priceWithMargin = totalDirectCost / (1 - margin);

  // 8. INSTALACIÓN Y MOVILIDAD (NETOS SIN MARGEN)
  const installationCost = areaTotalM2 * (settings.installationPerM2 || 20);
  const mobilityCost = settings.mobilityCost ?? (settings.serie === 'SERIE 42' ? 50 : 100);

  // 9. PRECIO DE VENTA TOTAL Y PRECIO POR M2
  const salePriceTotal = priceWithMargin + installationCost + mobilityCost;
  const pricePerM2 = areaTotalM2 > 0 ? salePriceTotal / areaTotalM2 : 0;

  // Actualizar subtotales y precios unitarios por ítem
  itemsResults.forEach(res => {
    res.unitPrice = res.areaM2 * pricePerM2;
    res.subtotal = res.unitPrice;
  });

  const grossProfit = salePriceTotal - (totalDirectCost + installationCost + mobilityCost);
  const effectiveProfitMarginPct = salePriceTotal > 0 ? (grossProfit / salePriceTotal) * 100 : 0;

  return {
    areaTotalM2,
    itemsResults,
    profileUsages,
    accessoryUsages,
    profilesCostDirect: perfilesFinalCostDirect,
    profilesCostWorkshop: sumProfilesCostInteger,
    accessoriesCostDirect: accessoriesFinalCostDirect,
    glassCostDirect,
    glassFormulaNote,
    assemblyCostDirect,
    otherCostDirect,
    totalDirectCost,
    priceWithMargin,
    installationCost,
    mobilityCost,
    salePriceTotal,
    pricePerM2,
    grossProfit,
    effectiveProfitMarginPct,
  };
}
