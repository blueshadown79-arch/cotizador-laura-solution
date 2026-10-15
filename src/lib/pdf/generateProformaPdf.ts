import { jsPDF } from 'jspdf';
import type { ClientData, CompanyConfig, QuoteCalculationSummary, QuoteSettings } from '../calc/types';
import { LAURA_LOGO_PNG_BASE64 } from './logoBase64';

/**
 * Opacidad de la marca de agua del logotipo en el fondo del documento (0.00 a 1.00).
 * Configurado al 50% (0.50) para máxima visibilidad corporativa según solicitud.
 */
export const WATERMARK_OPACITY = 0.50;

/**
 * Formateador de moneda con separador de miles y dos decimales (ej. 1,445.65)
 */
function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateProformaPdf(
  client: ClientData,
  settings: QuoteSettings,
  summary: QuoteCalculationSummary,
  company: CompanyConfig
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  // Paleta exacta extraída del diseño de referencia
  const colorNavy = [10, 36, 62];           // #0A243E (Azul marino cabecera y tabla)
  const colorAccentBar = [183, 220, 240];   // #B7DCF0 (Celeste barra superior acento)
  const colorRightCard = [77, 99, 137];     // #4D6389 (Fondo tarjeta PROFORMA COMERCIAL)
  const colorBorder = [211, 218, 222];       // #D3DADE (Bordes grises sutiles)
  const colorPillBg = [217, 237, 250];       // #D9EDFA (Fondo pills de especificación)
  const colorPillBorder = [185, 218, 238];   // #B9DAEE (Borde pills)
  const colorSummaryCard = [80, 106, 132];   // #506A84 (Fondo azul pizarra resumen totales)
  const colorTotalInner = [14, 38, 62];      // #0E263E (Caja interior TOTAL PROFORMA)
  const colorGridLine = [226, 232, 240];     // #E2E8F0 (Líneas de grilla de tabla)
  const colorTextDark = [15, 23, 42];        // #0F172A (Texto principal oscuro)
  const colorTextMuted = [75, 95, 115];      // #4B5F73 (Títulos de bloques y etiquetas)
  const colorTextBody = [51, 65, 85];        // #334155 (Texto de condiciones)
  const colorFooterText = [100, 116, 139];   // #64748B (Texto pie de página)

  // Función para dibujar la marca de agua centrada en el fondo (50% de opacidad)
  function drawWatermark(): void {
    try {
      doc.saveGraphicsState();
      // @ts-ignore
      if (typeof doc.GState === 'function') {
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: WATERMARK_OPACITY }));
      }
      const wmW = 105;
      const wmH = (wmW * 1024) / 571; // ~188 mm manteniendo la proporción del logotipo
      const wmX = (pageWidth - wmW) / 2;
      const wmY = 65; // Posicionada directamente detrás de la tabla y resumen
      doc.addImage(LAURA_LOGO_PNG_BASE64, 'PNG', wmX, wmY, wmW, wmH, 'LAURA_LOGO', 'FAST');
      doc.restoreGraphicsState();
    } catch (e) {
      console.warn('No se pudo aplicar la marca de agua:', e);
    }
  }

  // Anchos fijos de columnas según especificación estricta (100% de 182 mm)
  // 6% + 28% + 24% + 8% + 10% + 12% + 12% = 100%
  const colItemW = contentWidth * 0.06; // 10.92 mm (Ítem / N°)
  const colDescW = contentWidth * 0.28; // 50.96 mm (Descripción y Medidas)
  const colModW  = contentWidth * 0.24; // 43.68 mm (Modulación)
  const colCantW = contentWidth * 0.08; // 14.56 mm (Cant.)
  const colAreaW = contentWidth * 0.10; // 18.20 mm (Área m²)
  const colUnitW = contentWidth * 0.12; // 21.84 mm (P. Unit. S/)
  const colTotW  = contentWidth * 0.12; // 21.84 mm (Subtotal S/)

  // Coordenadas horizontales de columnas
  const colX0 = margin;
  const colX1 = colX0 + colItemW;
  const colX2 = colX1 + colDescW;
  const colX3 = colX2 + colModW;
  const colX4 = colX3 + colCantW;
  const colX5 = colX4 + colAreaW;
  const colX6 = colX5 + colUnitW;
  const colX7 = colX6 + colTotW; // = margin + contentWidth (196 mm)

  // Cabecera de la tabla de ítems
  function renderTableHeader(yPos: number): number {
    const tableHeaderH = 8.5;
    doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.rect(margin, yPos, contentWidth, tableHeaderH, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);

    const textY = yPos + 5.6;
    doc.text('ÍTEM', colX0 + colItemW / 2, textY, { align: 'center' });
    doc.text('DESCRIPCIÓN Y MEDIDAS', colX1 + 3.0, textY);
    doc.text('MODULACIÓN', colX2 + colModW / 2, textY, { align: 'center' });
    doc.text('CANT.', colX3 + colCantW / 2, textY, { align: 'center' });
    doc.text('ÁREA (m²)', colX4 + colAreaW / 2, textY, { align: 'center' });
    doc.text('P. UNIT. (S/)', colX6 - 2.5, textY, { align: 'right' });
    doc.text('SUBTOTAL (S/)', colX7 - 2.5, textY, { align: 'right' });

    return yPos + tableHeaderH;
  }

  // Mini cabecera corporativa para páginas 2 en adelante
  function renderPageHeaderMini(yPos: number): number {
    const miniH = 12;
    doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.roundedRect(margin, yPos, contentWidth, miniH, 1.5, 1.5, 'F');

    doc.setFillColor(colorAccentBar[0], colorAccentBar[1], colorAccentBar[2]);
    doc.rect(margin, yPos, contentWidth, 1.4, 'F');

    const miniLogoW = 5.5;
    const miniLogoH = (miniLogoW * 1024) / 571;
    doc.addImage(LAURA_LOGO_PNG_BASE64, 'PNG', margin + 3, yPos + 1.2, miniLogoW, miniLogoH, 'LAURA_LOGO', 'FAST');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('LAURA SOLUTION  —  PROFORMA COMERCIAL', margin + 11, yPos + 7.8);

    doc.setTextColor(colorAccentBar[0], colorAccentBar[1], colorAccentBar[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    const codeDisplay = client.quoteNumber?.startsWith('N°') ? client.quoteNumber : `N° ${client.quoteNumber || 'PRO-0001'}`;
    doc.text(`${codeDisplay}   |   Cliente: ${client.clientName || 'Particular'}`, margin + contentWidth - 3, yPos + 7.8, { align: 'right' });

    return yPos + miniH + 3.5;
  }

  // 1. DIBUJAR MARCA DE AGUA EN PÁGINA 1
  drawWatermark();

  let currentY = 12;

  // 2. ENCABEZADO CORPORATIVO (IDÉNTICO A LA FOTO)
  const headerH = 28;
  doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.roundedRect(margin, currentY, contentWidth, headerH, 2.5, 2.5, 'F');

  // Barra superior de acento en celeste
  doc.setFillColor(colorAccentBar[0], colorAccentBar[1], colorAccentBar[2]);
  doc.roundedRect(margin, currentY, contentWidth, 2.2, 1.5, 1.5, 'F');

  // Logotipo de la empresa (Icono de ventana)
  const logoW = 12.0;
  const logoH = (logoW * 1024) / 571; // ~21.5 mm
  const logoX = margin + 5;
  const logoY = currentY + 4.0;
  doc.addImage(LAURA_LOGO_PNG_BASE64, 'PNG', logoX, logoY, logoW, logoH, 'LAURA_LOGO', 'FAST');

  // Textos de la empresa
  const textLeftX = logoX + logoW + 4.5;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAURA SOLUTION', textLeftX, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(230, 243, 250);
  doc.text('CARPINTERÍA EN ALUMINIO & VIDRIO TEMPLADO', textLeftX, currentY + 16.5);

  const rucStr = company.ruc || '10743370924';
  const phoneStr = (company.phones && company.phones.length > 0) ? company.phones[0] : '912 791 992';
  const igStr = company.instagram || '@serviciolauraglass';
  const addressStr = company.address || 'Lima, Perú';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(215, 230, 245);
  doc.text(`RUC: ${rucStr} | Tel: ${phoneStr} | IG: ${igStr} | ${addressStr}`, textLeftX, currentY + 22.2);

  // Tarjeta integrada a la derecha: PROFORMA COMERCIAL (3 líneas oficiales)
  const cardW = 54;
  const cardH = 21.5;
  const cardX = pageWidth - margin - cardW - 4;
  const cardY = currentY + 3.2;
  const cardCenterX = cardX + cardW / 2;

  doc.setFillColor(colorRightCard[0], colorRightCard[1], colorRightCard[2]);
  doc.roundedRect(cardX, cardY, cardW, cardH, 2.0, 2.0, 'F');

  // Línea 1: R.U.C. 10743370924 (en negrita, 9.5pt)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`R.U.C. ${rucStr}`, cardCenterX, cardY + 5.5, { align: 'center' });

  // Línea 2: PROFORMA COMERCIAL (en negrita, 7.5pt)
  doc.setTextColor(220, 235, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PROFORMA COMERCIAL', cardCenterX, cardY + 11.2, { align: 'center' });

  // Línea 3: Código correlativo en grande (ej. PRO-0001)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  const quoteCode = client.quoteNumber || 'PRO-0001';
  doc.text(quoteCode, cardCenterX, cardY + 17.5, { align: 'center' });

  currentY += headerH + 3.5;

  // 3. FICHA DE CLIENTE Y ESPECIFICACIONES TÉCNICAS (BLOQUE UNIFICADO CON BORDES REDONDEADOS)
  const clientBoxH = 34;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, currentY, contentWidth, clientBoxH, 2.0, 2.0, 'FD');

  // Columna Izquierda: DATOS DEL CLIENTE (50%)
  const leftColX = margin + 6;
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('DATOS DEL CLIENTE', leftColX, currentY + 6.0);

  doc.setFontSize(8.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text('Cliente: ', leftColX, currentY + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.text(client.clientName || 'Particular', leftColX + 11, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  const addressDisplay = client.clientAddress ? `Obra: ${client.clientAddress}` : 'Obra: Carabayllo';
  doc.text(addressDisplay, leftColX, currentY + 16.5);

  const phoneDisplay = client.clientPhone ? `Tel: ${client.clientPhone}` : 'Tel: Sin registrar';
  doc.text(phoneDisplay, leftColX, currentY + 21.5);

  // Línea divisoria vertical entre clientes y emisión
  const midX = margin + contentWidth / 2;
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.line(midX, currentY + 3.0, midX, currentY + 23.0);

  // Columna Derecha: DETALLES DE EMISIÓN (50%)
  const rightColX = midX + 6;
  doc.setTextColor(colorTextMuted[0], colorTextMuted[1], colorTextMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('DETALLES DE EMISIÓN', rightColX, currentY + 6.0);

  const formattedDate = client.quoteDate
    ? (client.quoteDate.includes('-') ? client.quoteDate.split('-').reverse().join('/') : client.quoteDate)
    : new Date().toLocaleDateString('es-PE');

  doc.setFontSize(8.0);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`Fecha: ${formattedDate}`, rightColX, currentY + 11.5);
  doc.text(`Validez de oferta: ${client.validityDays || 15} días calendario`, rightColX, currentY + 16.5);

  // Línea divisoria horizontal interna
  doc.line(margin, currentY + 24.0, margin + contentWidth, currentY + 24.0);

  // Píldoras inferiores de especificaciones técnicas (4 pills horizontales)
  const pillY = currentY + 26.0;
  const pillH = 6.2;
  const pillGap = 3.0;
  const totalPillsWidth = contentWidth - 10;
  const pillW = (totalPillsWidth - 3 * pillGap) / 4; // ~40.75 mm

  const pillsData = [
    `SISTEMA: ${settings.serie}`,
    `COLOR: ${settings.color}`,
    `VIDRIO: ${settings.glassType} ${settings.glassThickness}`,
    `SELLADO: ${settings.sealing}`,
  ];

  pillsData.forEach((pillText, i) => {
    const pX = margin + 5 + i * (pillW + pillGap);
    doc.setFillColor(colorPillBg[0], colorPillBg[1], colorPillBg[2]);
    doc.setDrawColor(colorPillBorder[0], colorPillBorder[1], colorPillBorder[2]);
    doc.roundedRect(pX, pillY, pillW, pillH, 1.8, 1.8, 'FD');

    doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(pillText, pX + pillW / 2, pillY + 4.3, { align: 'center' });
  });

  currentY += clientBoxH + 4.0;

  // 4. TABLA DE ÍTEMS CON GRID COMPLETO Y TEXTO SIN SUPERPOSICIONES
  currentY = renderTableHeader(currentY);

  summary.itemsResults.forEach((res, idx) => {
    const it = res.item;

    // Número de ítem con cero inicial (ej. 01, 02)
    const itemNumStr = String(idx + 1).padStart(2, '0');

    // Descripción de medidas
    const descText = `${it.itemType} ${it.widthMm} × ${it.heightMm} mm`;

    // Modulación
    const modDesc = settings.serie === 'SERIE 42'
      ? (it.s42Design || 'Proyectante')
      : `${it.leaves.replace(/_/g, ' ')} • ${it.modulation}`;

    // Text wrap con splitTextToSize
    const descLines = doc.splitTextToSize(descText, colDescW - 6);
    const modLines = doc.splitTextToSize(modDesc, colModW - 6);
    const maxLines = Math.max(descLines.length, modLines.length);

    const lineHeight = 3.8;
    const paddingY = 2.8;
    const rowH = Math.max(9.5, (maxLines * lineHeight) + (paddingY * 2));

    // Salto de página automático si es necesario
    if (currentY + rowH > pageHeight - 65) {
      doc.addPage();
      drawWatermark();
      currentY = renderPageHeaderMini(12);
      currentY = renderTableHeader(currentY);
    }

    // Fondo blanco para que la marca de agua sea visible con opacidad
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, contentWidth, rowH, 'F');

    // Líneas verticales de grilla entre columnas
    doc.setDrawColor(colorGridLine[0], colorGridLine[1], colorGridLine[2]);
    doc.line(colX1, currentY, colX1, currentY + rowH);
    doc.line(colX2, currentY, colX2, currentY + rowH);
    doc.line(colX3, currentY, colX3, currentY + rowH);
    doc.line(colX4, currentY, colX4, currentY + rowH);
    doc.line(colX5, currentY, colX5, currentY + rowH);
    doc.line(colX6, currentY, colX6, currentY + rowH);

    // Borde exterior izquierdo y derecho
    doc.line(margin, currentY, margin, currentY + rowH);
    doc.line(margin + contentWidth, currentY, margin + contentWidth, currentY + rowH);

    // Línea inferior de la fila
    doc.line(margin, currentY + rowH, margin + contentWidth, currentY + rowH);

    const singleLineY = currentY + (rowH / 2) + 1.2;

    // Columna 1: ÍTEM (Centrado)
    doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.text(itemNumStr, colX0 + colItemW / 2, singleLineY, { align: 'center' });

    // Columna 2: DESCRIPCIÓN Y MEDIDAS (Izquierda)
    const descStartY = currentY + (rowH - (descLines.length * lineHeight)) / 2 + 2.8;
    doc.text(descLines, colX1 + 3.0, descStartY);

    // Columna 3: MODULACIÓN (Centrado)
    const modStartY = currentY + (rowH - (modLines.length * lineHeight)) / 2 + 2.8;
    doc.setFontSize(7.2);
    doc.text(modLines, colX2 + colModW / 2, modStartY, { align: 'center' });

    // Columna 4: CANTIDAD (Centrado)
    doc.setFontSize(7.8);
    doc.text(String(it.quantity), colX3 + colCantW / 2, singleLineY, { align: 'center' });

    // Columna 5: ÁREA m² (Centrado)
    doc.text(res.areaM2.toFixed(2), colX4 + colAreaW / 2, singleLineY, { align: 'center' });

    // Columna 6: P. UNIT. S/ (Derecha con separador de miles)
    doc.text(`S/ ${formatMoney(res.unitPrice)}`, colX6 - 2.5, singleLineY, { align: 'right' });

    // Columna 7: SUBTOTAL S/ (Derecha en negrita)
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${formatMoney(res.subtotal)}`, colX7 - 2.5, singleLineY, { align: 'right' });

    currentY += rowH;
  });

  currentY += 6.0;

  // 5. BLOQUE INFERIOR: CONDICIONES (55%) Y TARJETA RESUMEN AZUL (40%)
  const bottomH = 38;
  if (currentY + bottomH > pageHeight - 16) {
    doc.addPage();
    drawWatermark();
    currentY = 16;
  }

  const conditionsW = contentWidth * 0.55; // 100.1 mm
  const summaryW = contentWidth * 0.40;    // 72.8 mm
  const bottomGap = contentWidth - conditionsW - summaryW; // ~9.1 mm
  const summaryX = margin + conditionsW + bottomGap;

  // A la izquierda: CONDICIONES COMERCIALES Y GARANTÍA (Fondo blanco y borde redondeado)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, currentY, conditionsW, bottomH, 2.0, 2.0, 'FD');

  doc.setTextColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('CONDICIONES COMERCIALES Y GARANTÍA', margin + 6, currentY + 6.5);

  const bulletPoints = [
    '• Precios expresados en Soles (S/). Incluyen perfiles, vidrios y accesorios.',
    '• 60% de adelanto para habilitación y fabricación en taller.',
    '• 40% saldo contra entrega e instalación conforme en obra.',
    '• Plazo de entrega estimado: 5 a 8 días hábiles tras toma de medidas.',
    '• Garantía de 1 año en perfiles de aluminio y hermeticidad de sellado.',
  ];

  doc.setTextColor(colorTextBody[0], colorTextBody[1], colorTextBody[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  let bY = currentY + 12.0;
  bulletPoints.forEach((bp) => {
    doc.text(bp, margin + 6, bY);
    bY += 5.2;
  });

  // A la derecha: TARJETA DE RESUMEN EN AZUL PIZARRA (#506A84)
  doc.setFillColor(colorSummaryCard[0], colorSummaryCard[1], colorSummaryCard[2]);
  doc.roundedRect(summaryX, currentY, summaryW, bottomH, 2.5, 2.5, 'F');

  // Área Total Fabricada
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text('Área Total Fabricada:', summaryX + 6, currentY + 7.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.text(`${summary.areaTotalM2.toFixed(2)} m²`, summaryX + summaryW - 6, currentY + 7.5, { align: 'right' });

  // Precio Promedio por m²
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text('Precio Promedio por m²:', summaryX + 6, currentY + 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.text(`S/ ${formatMoney(summary.pricePerM2)}`, summaryX + summaryW - 6, currentY + 14.5, { align: 'right' });

  // Recuadro interior oscuro para TOTAL PROFORMA
  const totalBoxH = 15;
  const totalBoxY = currentY + bottomH - totalBoxH - 3;
  const totalBoxW = summaryW - 6;
  const totalBoxX = summaryX + 3;
  doc.setFillColor(colorTotalInner[0], colorTotalInner[1], colorTotalInner[2]);
  doc.roundedRect(totalBoxX, totalBoxY, totalBoxW, totalBoxH, 2.0, 2.0, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.text('TOTAL PROFORMA: ', totalBoxX + 4.5, totalBoxY + 9.5);

  doc.setFontSize(11.5);
  doc.text(`S/ ${formatMoney(summary.salePriceTotal)}`, totalBoxX + totalBoxW - 4.5, totalBoxY + 9.8, { align: 'right' });

  // 6. PIE DE PÁGINA (SIN FIRMAS, DOCUMENTO INFORMATIVO CENTRADO)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setTextColor(colorFooterText[0], colorFooterText[1], colorFooterText[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);

    const rucVal = company.ruc || '10743370924';
    const phoneVal = (company.phones && company.phones.length > 0) ? company.phones[0] : '912 791 992';
    const igVal = company.instagram || '@serviciolauraglass';
    const addressVal = company.address || 'Lima, Perú';

    const footerLine1 = 'Documento informativo de cotización (Proforma). Precios sujetos a verificación técnica de medidas en obra.';
    const footerLine2 = `LAURA SOLUTION - RUC: ${rucVal} | Tel: ${phoneVal} | IG: ${igVal} - ${addressVal}`;

    doc.text(footerLine1, pageWidth / 2, pageHeight - 10.5, { align: 'center' });
    doc.text(footerLine2, pageWidth / 2, pageHeight - 6.8, { align: 'center' });
  }

  // Descargar archivo PDF con nombre intuitivo
  const safeClient = (client.clientName || 'Cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
  const filename = `${client.quoteNumber || 'PRO-0001'}_${safeClient}_LauraSolution.pdf`;
  doc.save(filename);
}
