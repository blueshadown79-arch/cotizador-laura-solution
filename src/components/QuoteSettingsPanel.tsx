import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, DollarSign, Percent, Sparkles } from 'lucide-react';
import type { GlassThickness, GlassType, ProfileColor, QuoteSettings, SealingType } from '../lib/calc/types';

interface QuoteSettingsPanelProps {
  settings: QuoteSettings;
  onChangeSettings: (updated: Partial<QuoteSettings>) => void;
}

const COLORS: ProfileColor[] = ['NATURAL', 'BLANCO', 'NEGRO', 'MADERA', 'CHAMPAGNE'];
const GLASS_TYPES: GlassType[] = ['CRUDO', 'LAMINADO', 'REFLEJANTE', 'TEMPLADO'];
const THICKNESSES: GlassThickness[] = ['6 mm', '8 mm', '10 mm'];
const SEALING_OPTIONS: SealingType[] = ['SILICONA', 'BURLETE'];

export const QuoteSettingsPanel: React.FC<QuoteSettingsPanelProps> = ({
  settings,
  onChangeSettings,
}) => {
  const [isOpenAdvanced, setIsOpenAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            3. Ajustes de Materiales & Acabados
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsOpenAdvanced(!isOpenAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/80 px-2.5 py-1 rounded-lg transition"
        >
          <span>{isOpenAdvanced ? 'Ocultar Parámetros Financieros' : 'Ajustes Financieros / Costos'}</span>
          {isOpenAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Parámetros esenciales rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Color de Perfil */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Color de Perfil
          </label>
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg">
            {COLORS.map(c => {
              const active = settings.color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeSettings({ color: c })}
                  className={`py-1.5 text-[11px] font-bold rounded transition text-center truncate ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                  title={c}
                >
                  {c.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block mt-1 text-center">
            Seleccionado: <strong className="text-slate-700">{settings.color}</strong>
          </span>
        </div>

        {/* Tipo de Vidrio */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tipo de Vidrio
          </label>
          <select
            value={settings.glassType}
            onChange={(e) => onChangeSettings({ glassType: e.target.value as GlassType })}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
          >
            {GLASS_TYPES.map(g => (
              <option key={g} value={g}>
                {g} {g === 'TEMPLADO' ? '(Cotizado en USD)' : '(S/ x pie²)'}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">
            {settings.glassType === 'TEMPLADO'
              ? 'Multiplica por USD/m² y Tipo de Cambio'
              : 'Multiplica por S/ pie² × 10.76 (sin T.C.)'}
          </span>
        </div>

        {/* Espesor de Vidrio */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Espesor
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {THICKNESSES.map(t => {
              const active = settings.glassThickness === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChangeSettings({ glassThickness: t })}
                  className={`py-2 text-xs font-bold rounded-lg transition border ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sellado */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tipo de Sellado
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SEALING_OPTIONS.map(s => {
              const active = settings.sealing === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeSettings({ sealing: s })}
                  className={`py-2 text-xs font-bold rounded-lg transition border ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PANEL PLEGABLE: AJUSTES FINANCIEROS Y AVANZADOS */}
      {isOpenAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Parámetros Financieros & Costos de Taller</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Tipo de Cambio */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tipo de Cambio (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="3.0"
                  max="4.5"
                  value={settings.exchangeRate}
                  onChange={(e) => onChangeSettings({ exchangeRate: parseFloat(e.target.value) || 3.70 })}
                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold text-slate-800"
                />
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-1.5 top-2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-500">Defecto: 3.70</span>
            </div>

            {/* Ganancia (% Margen sobre Venta) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Ganancia Comercial
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="80"
                  value={Math.round(settings.profitMargin * 100)}
                  onChange={(e) => onChangeSettings({ profitMargin: (parseFloat(e.target.value) || 30) / 100 })}
                  className="w-full pl-2 pr-6 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold text-slate-800"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-500">Sobre precio de venta</span>
            </div>

            {/* Instalación x m2 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Instalación (S/ x m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={settings.installationPerM2}
                  onChange={(e) => onChangeSettings({ installationPerM2: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-500">Neto sin margen</span>
            </div>

            {/* Armado x m2 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Armado (S/ x m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={settings.assemblyPerM2}
                  onChange={(e) => onChangeSettings({ assemblyPerM2: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-500">Costo directo</span>
            </div>

            {/* Movilidad */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Movilidad Fija (S/)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5"
                  value={settings.mobilityCost}
                  onChange={(e) => onChangeSettings({ mobilityCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-500">Neto sin margen</span>
            </div>

            {/* Merma Serie 42 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Merma S42 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  value={Math.round((settings.s42ProfileWaste || 0.05) * 100)}
                  onChange={(e) => onChangeSettings({ s42ProfileWaste: (parseFloat(e.target.value) || 5) / 100 })}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-500">5% proyectante</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
