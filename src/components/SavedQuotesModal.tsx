import React from 'react';
import { X, Bookmark, FolderOpen, Trash2, Calendar, User, ArrowRight } from 'lucide-react';
import type { SavedQuoteRecord } from '../lib/storage/quotesStorage';

interface SavedQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: SavedQuoteRecord[];
  onLoadQuote: (quote: SavedQuoteRecord) => void;
  onDeleteQuote: (id: string) => void;
}

export const SavedQuotesModal: React.FC<SavedQuotesModalProps> = ({
  isOpen,
  onClose,
  savedQuotes,
  onLoadQuote,
  onDeleteQuote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-[#0f2744] text-white px-6 py-4 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold">Cotizaciones Guardadas</h2>
              <p className="text-xs text-sky-200/80">Historial de proformas creadas en este navegador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)] space-y-3">
          {savedQuotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
              <p className="text-sm font-semibold text-slate-600">No hay cotizaciones guardadas aún</p>
              <p className="text-xs text-slate-400 mt-1">
                Al cotizar, haz clic en el botón de guardar o descargar PDF para almacenarlas automáticamente.
              </p>
            </div>
          ) : (
            savedQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-slate-50 hover:bg-sky-50/50 p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-sky-950">{q.client.quoteNumber || 'PRO-0001'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                      {q.settings.serie}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {q.settings.color} • {q.settings.glassType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{q.client.clientName || 'Cliente Particular'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(q.savedAt).toLocaleDateString('es-PE')}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {q.items.length} elemento(s) • Área: <strong>{q.totalAreaM2.toFixed(2)} m²</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="text-base font-black text-sky-900">
                      S/ {q.totalSalePrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDeleteQuote(q.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadQuote(q)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <span>Cargar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total guardadas: <strong>{savedQuotes.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
