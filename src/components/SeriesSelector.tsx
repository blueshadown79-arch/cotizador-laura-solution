import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import type { SerieType } from '../lib/calc/types';

interface SeriesSelectorProps {
  selectedSerie: SerieType;
  onSelectSerie: (serie: SerieType) => void;
}

interface SerieOption {
  id: SerieType;
  title: string;
  category: string;
  desc: string;
  tag: string;
  features: string[];
}

const SERIES_INFO: SerieOption[] = [
  {
    id: 'SERIE 20',
    title: 'Serie 20',
    category: 'Corrediza Estándar',
    desc: 'Línea ligera y económica. Ideal para ventanas de dormitorios y departamentos.',
    tag: 'Económica',
    features: ['2, 3 o 4 hojas', 'Garruchas 2.5 S/', 'Zócalo 2005'],
  },
  {
    id: 'SERIE 25',
    title: 'Serie 25',
    category: 'Corrediza Intermedia',
    desc: 'La más comercial y solicitada en Lima. Gran rigidez para ventanas y mamparas medianas.',
    tag: 'Más Vendida',
    features: ['Hermética', 'Garruchas reforzadas', 'Perfiles 2501-2510'],
  },
  {
    id: 'SERIE 42',
    title: 'Serie 42',
    category: 'Proyectante / Fija',
    desc: 'Apertura hacia el exterior con brazos de fricción o paños fijos. Máxima ventilación.',
    tag: 'Proyectante',
    features: ['Brazos 40 / 60 cm', 'Manija de empuje', '5% Merma perfiles'],
  },
  {
    id: 'SERIE 62',
    title: 'Serie 62',
    category: 'Corrediza Semipesada',
    desc: 'Estructura robusta para mamparas amplias y ventanales de sala/comedor.',
    tag: 'Semipesada',
    features: ['Marco 80501-80502', 'Alta resistencia', 'Cremona / Manija'],
  },
  {
    id: 'SERIE 80',
    title: 'Serie 80',
    category: 'Corrediza Pesada / Hermética',
    desc: 'Línea de alta gama. Soporta hojas pesadas con opción de Riel Doble o Riel Triple.',
    tag: 'Alta Gama',
    features: ['Riel Triple 3H', 'Cremona multipunto', 'Felpa reforzada en riel'],
  },
];

export const SeriesSelector: React.FC<SeriesSelectorProps> = ({
  selectedSerie,
  onSelectSerie,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            1. Selecciona el Sistema de Carpintería
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500">
          Fuente de verdad: <strong className="text-slate-700">COTIZADOR.xlsx</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SERIES_INFO.map(s => {
          const isSelected = selectedSerie === s.id;
          return (
            <div
              key={s.id}
              onClick={() => onSelectSerie(s.id)}
              className={`relative cursor-pointer rounded-xl p-3.5 transition-all text-left flex flex-col justify-between border ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-sky-600">
                  <CheckCircle2 className="w-4 h-4 fill-sky-100" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {s.tag}
                  </span>
                </div>
                <h3 className={`text-base font-bold tracking-tight ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                  {s.title}
                </h3>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">
                  {s.category}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {s.features.map((f, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
