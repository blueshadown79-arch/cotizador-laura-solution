import type { ClientData, CompanyConfig, QuoteCalculationSummary, QuoteSettings } from '../calc/types';

export function generateWhatsAppMessage(
  client: ClientData,
  settings: QuoteSettings,
  summary: QuoteCalculationSummary,
  company: CompanyConfig
): string {
  const lineSeparator = '━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  let msg = `*LAURA SOLUTION - COTIZACIÓN OFICIAL*\n`;
  msg += `_Carpintería en Aluminio & Vidrio Templado_\n`;
  msg += `${lineSeparator}\n`;
  msg += `📋 *Cotización:* ${client.quoteNumber}\n`;
  msg += `👤 *Cliente:* ${client.clientName || 'Cliente'}\n`;
  if (client.clientPhone) msg += `📱 *Teléfono:* ${client.clientPhone}\n`;
  if (client.clientAddress) msg += `📍 *Obra / Dirección:* ${client.clientAddress}\n`;
  msg += `📅 *Fecha:* ${client.quoteDate || new Date().toLocaleDateString('es-PE')}\n`;
  msg += `${lineSeparator}\n\n`;

  msg += `⚙️ *ESPECIFICACIONES TÉCNICAS:*\n`;
  msg += `• *Sistema:* ${settings.serie}\n`;
  msg += `• *Color Perfil:* ${settings.color}\n`;
  msg += `• *Tipo de Vidrio:* ${settings.glassType} (${settings.glassThickness})\n`;
  msg += `• *Sellado:* ${settings.sealing}\n\n`;

  msg += `📦 *DETALLE DE ELEMENTOS:*\n`;
  summary.itemsResults.forEach((res, idx) => {
    const it = res.item;
    const desc = settings.serie === 'SERIE 42' 
      ? (it.s42Design || 'Proyectante') 
      : `${it.leaves.replace('_', ' ')} (${it.modulation})`;

    msg += `*${idx + 1}.* ${it.itemType} ${it.widthMm} x ${it.heightMm} mm\n`;
    msg += `   └ Cant: ${it.quantity} und | ${desc}\n`;
    msg += `   └ Área: ${res.areaM2.toFixed(2)} m² | *Subtotal: S/ ${res.subtotal.toFixed(2)}*\n\n`;
  });

  msg += `${lineSeparator}\n`;
  msg += `📐 *Área Total:* ${summary.areaTotalM2.toFixed(2)} m²\n`;
  msg += `🏷️ *Precio Promedio:* S/ ${summary.pricePerM2.toFixed(2)} / m²\n`;
  msg += `💰 *TOTAL GENERAL: S/ ${summary.salePriceTotal.toFixed(2)} Soles*\n`;
  msg += `${lineSeparator}\n\n`;

  msg += `📌 *CONDICIONES COMERCIALES:*\n`;
  msg += `• Validez: ${client.validityDays} días calendario.\n`;
  msg += `• 60% adelanto al confirmar / 40% contra entrega e instalación.\n`;
  msg += `• Fabricación e instalación en 5 a 8 días hábiles.\n\n`;

  const phoneStr = (company.phones && company.phones.length > 0) ? company.phones[0] : '912 791 992';
  const igStr = company.instagram || '@serviciolauraglass';
  msg += `📞 *Tel:* ${phoneStr}\n`;
  msg += `📸 *Instagram:* ${igStr}\n`;
  msg += `_¡Gracias por confiar en Laura Solution!_`;

  return msg;
}
