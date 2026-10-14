import React from 'react';
import { FileDown, MessageSquareShare, LockKeyhole, Sparkles } from 'lucide-react';
import type { QuoteCalculationSummary } from '../lib/calc/types';

interface StickySummaryBarProps {
  summary: QuoteCalculationSummary;
  onDownloadPdf: () => void;
  onShareWhatsApp: () => void;
  onOpenInternalDetail: () => void;
}

export const StickySummaryBar: React.FC<StickySummaryBarProps> = ({
  summary,
  onDownloadPdf,
  onShareWhatsApp,
  onOpenInternalDetail,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f2744] text-white border-t border-sky-800 shadow-[0_-8px_20px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Métricas Principales en Vivo */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 sm:gap-6">
            {/* Área Total */}
            <div>
              <span className="block text-[10px] uppercase font-bold text-sky-300 tracking-wider">
                Área Total
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                {summary.areaTotalM2.toFixed(2)}{' '}
                <span className="text-xs font-normal text-sky-200">m²</span>
              </span>
            </div>

            <div className="h-8 w-px bg-sky-800/80" />

            {/* Precio Promedio x m2 */}
            <div>
              <span className="block text-[10px] uppercase font-bold text-sky-300 tracking-wider">
                Precio x m²
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                S/ {summary.pricePerM2.toFixed(2)}
              </span>
            </div>

            <div className="h-8 w-px bg-sky-800/80" />

            {/* TOTAL COTIZACIÓN */}
            <div className="bg-sky-950/80 px-3 sm:px-4 py-1.5 rounded-lg border border-sky-500/40">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">
                  TOTAL COTIZACIÓN
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                S/ {summary.salePriceTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end w-full md:w-auto gap-2 sm:gap-2.5">
            {/* Ver Detalle Taller (PIN) */}
            <button
              type="button"
              onClick={onOpenInternalDetail}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 shadow-sm"
              title="Lista de corte, varillas de taller y desglose de costos"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Detalle Taller</span>
              <span className="sm:hidden">Taller</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={onShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
              title="Copiar resumen formateado para WhatsApp"
            >
              <MessageSquareShare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Descargar Proforma PDF (Botón Principal) */}
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs sm:text-sm font-bold text-slate-950 transition shadow-md shadow-sky-500/20"
              title="Descargar proforma formal A4 sin costos internos"
            >
              <FileDown className="w-4 h-4 text-slate-950" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
