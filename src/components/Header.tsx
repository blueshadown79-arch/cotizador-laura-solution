import { Bookmark, RotateCcw, Settings, Phone } from 'lucide-react';
import type { CompanyConfig } from '../lib/calc/types';

interface HeaderProps {
  company: CompanyConfig;
  savedQuotesCount: number;
  onOpenSavedQuotes: () => void;
  onOpenAdmin: () => void;
  onNewQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  savedQuotesCount,
  onOpenSavedQuotes,
  onOpenAdmin,
  onNewQuote,
}) => {
  return (
    <header className="bg-[#0f2744] text-white shadow-lg sticky top-0 z-40 border-b border-sky-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={onNewQuote}>
            <div className="h-11 w-11 rounded-lg bg-sky-950/60 p-1 border border-sky-500/30 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src="/logo.jpg"
                alt="Laura Solution Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback icon si no carga la imagen
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
                  LAURA SOLUTION
                </span>
                <span className="text-[10px] font-semibold uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30">
                  Cotizador Pro
                </span>
              </div>
              <p className="text-xs text-sky-200/80 font-normal">
                Carpintería en Aluminio & Vidrio Templado • Lima, Perú
              </p>
            </div>
          </div>

          {/* Contacto rápido y Acciones */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Teléfonos & Instagram */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-sky-200/90 mr-2 border-r border-sky-800/60 pr-3">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Tel: {company.phones?.[0] || '912 791 992'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-pink-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>{company.instagram || '@serviciolauraglass'}</span>
              </div>
            </div>

            {/* Nueva Cotización */}
            <button
              type="button"
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700 shadow-sm"
              title="Limpiar y empezar nueva cotización"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              <span>Nueva</span>
            </button>

            {/* Cotizaciones Guardadas */}
            <button
              type="button"
              onClick={onOpenSavedQuotes}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-xs font-medium text-sky-200 transition border border-sky-700/50 shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Guardadas</span>
              {savedQuotesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-sky-500 text-white rounded-full text-[10px] font-bold">
                  {savedQuotesCount}
                </span>
              )}
            </button>

            {/* Configuración & Precios (PIN) */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700 shadow-sm"
              title="Editar precios de perfiles, accesorios y parámetros"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Precios / PIN</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
