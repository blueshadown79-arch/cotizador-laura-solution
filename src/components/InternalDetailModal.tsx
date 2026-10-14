import React, { useState } from 'react';
import { X, Lock, Unlock, Scissors, Package, Coins, AlertCircle } from 'lucide-react';
import type { QuoteCalculationSummary, QuoteSettings } from '../lib/calc/types';

interface InternalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: QuoteCalculationSummary;
  settings: QuoteSettings;
  companyPin: string;
}

export const InternalDetailModal: React.FC<InternalDetailModalProps> = ({
  isOpen,
  onClose,
  summary,
  settings,
  companyPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  const [activeTab, setActiveTab] = useState<'costos' | 'varillas' | 'cortes'>('costos');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === companyPin || pinInput === '1234') {
      setIsUnlocked(true);
      setErrorPin(false);
    } else {
      setErrorPin(true);
    }
  };

  // Recopilar lista completa de cortes agrupados por perfil
  const allCutsGrouped = new Map<string, { profileCode: string; profileName: string; cuts: { name: string; len: number; cant: number; totalMeters: number }[] }>();

  summary.itemsResults.forEach(res => {
    res.cuts.forEach(c => {
      const current = allCutsGrouped.get(c.profileCode) || {
        profileCode: c.profileCode,
        profileName: c.profileName,
        cuts: [],
      };
      current.cuts.push({
        name: c.cutName,
        len: c.lengthMm,
        cant: c.quantity,
        totalMeters: c.totalMeters,
      });
      allCutsGrouped.set(c.profileCode, current);
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera del Modal */}
        <div className="bg-[#0f2744] text-white px-6 py-4 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-2.5">
            {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            <div>
              <h2 className="text-base font-bold">Detalle Interno de Taller & Costos (Solo Dueño)</h2>
              <p className="text-xs text-sky-200/80">
                Información confidencial de insumos, compras de varillas y margen comercial
              </p>
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

        {/* Si no está desbloqueado: Formulario de PIN */}
        {!isUnlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso Protegido por PIN</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6">
              Ingresa el código PIN para consultar los costos reales de fabricación, varillas enteras y lista de corte. (PIN por defecto: <strong>1234</strong>)
            </p>

            <form onSubmit={handleUnlock} className="flex flex-col items-center gap-3 w-full max-w-xs">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorPin(false);
                }}
                placeholder="PIN de 4 dígitos"
                autoFocus
                className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              {errorPin && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>PIN incorrecto. Intenta con 1234.</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Desbloquear Panel
              </button>
            </form>
          </div>
        ) : (
          /* Panel Desbloqueado */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Pestañas */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('costos')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'costos'
                    ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Desglose Financiero & Margen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('varillas')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'varillas'
                    ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Compra de Varillas (Taller)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cortes')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                  activeTab === 'cortes'
                    ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Lista Técnica de Corte</span>
              </button>
            </div>

            {/* Contenido de la pestaña */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* TAB 1: DESGLOSE FINANCIERO */}
              {activeTab === 'costos' && (
                <div className="space-y-6">
                  {/* Tarjetas Resumen */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Costo Directo Real</span>
                      <p className="text-lg font-black text-slate-800">S/ {summary.totalDirectCost.toFixed(2)}</p>
                      <span className="text-[10px] text-slate-400">Materiales + Vidrio + Armado</span>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-700">Ganancia Bruta</span>
                      <p className="text-lg font-black text-emerald-800">S/ {summary.grossProfit.toFixed(2)}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{summary.effectiveProfitMarginPct.toFixed(1)}% margen sobre venta</span>
                    </div>

                    <div className="bg-sky-50 p-3 rounded-xl border border-sky-200">
                      <span className="text-[10px] uppercase font-bold text-sky-700">Precio Venta Total</span>
                      <p className="text-lg font-black text-sky-900">S/ {summary.salePriceTotal.toFixed(2)}</p>
                      <span className="text-[10px] text-sky-600 font-semibold">S/ {summary.pricePerM2.toFixed(2)} / m²</span>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-700">Diferencia Varillas</span>
                      <p className="text-lg font-black text-amber-900">
                        S/ {(summary.profilesCostWorkshop - summary.profilesCostDirect).toFixed(2)}
                      </p>
                      <span className="text-[10px] text-amber-600">Enteras vs Prorrateadas</span>
                    </div>
                  </div>

                  {/* Tabla Detallada de Costos Directos */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase">
                      Componentes del Costo de Fabricación
                    </div>
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">Perfiles de Aluminio ({settings.color})</td>
                          <td className="py-2 px-4 text-slate-500">Prorrateado comercial</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.profilesCostDirect.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">Accesorios & Herrajes</td>
                          <td className="py-2 px-4 text-slate-500">Garruchas, cremonas, felpa, burlete, tornillos</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.accessoriesCostDirect.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">
                            Vidrio {settings.glassType} ({settings.glassThickness})
                          </td>
                          <td className="py-2 px-4 text-slate-500 text-[11px]">{summary.glassFormulaNote}</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.glassCostDirect.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">Costo de Armado en Taller</td>
                          <td className="py-2 px-4 text-slate-500">{summary.areaTotalM2.toFixed(2)} m² × S/ {settings.assemblyPerM2}</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.assemblyCostDirect.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-2 px-4 text-slate-800">SUBTOTAL COSTO DIRECTO</td>
                          <td className="py-2 px-4 text-slate-500">Base para margen</td>
                          <td className="py-2 px-4 text-right text-slate-900">S/ {summary.totalDirectCost.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-sky-800">Precio con Margen ({Math.round(settings.profitMargin * 100)}%)</td>
                          <td className="py-2 px-4 text-slate-500">Costo Directo / (1 - {settings.profitMargin})</td>
                          <td className="py-2 px-4 text-right font-bold text-sky-900">S/ {summary.priceWithMargin.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">Instalación en Obra (Neta)</td>
                          <td className="py-2 px-4 text-slate-500">{summary.areaTotalM2.toFixed(2)} m² × S/ {settings.installationPerM2}</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.installationCost.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-700">Movilidad / Flete (Neto)</td>
                          <td className="py-2 px-4 text-slate-500">Costo fijo de transporte</td>
                          <td className="py-2 px-4 text-right font-bold text-slate-800">S/ {summary.mobilityCost.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-sky-900 text-white font-black text-sm">
                          <td className="py-3 px-4">PRECIO DE VENTA FINAL</td>
                          <td className="py-3 px-4 text-sky-200 text-xs font-normal">Precio con margen + Instalación + Flete</td>
                          <td className="py-3 px-4 text-right">S/ {summary.salePriceTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPRA DE VARILLAS */}
              {activeTab === 'varillas' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
                    <strong>Nota operativa de taller:</strong> Para el cliente se prorratea el metraje exacto. Para comprar en distribuidora (Aluminios/Corporación) se redondea a varillas enteras de 6 metros (Math.ceil).
                  </div>

                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Nombre del Perfil</th>
                        <th className="py-2.5 px-3 text-center">Metros Usados</th>
                        <th className="py-2.5 px-3 text-center">Varillas Prorrat.</th>
                        <th className="py-2.5 px-3 text-center bg-amber-100/60 text-amber-900"># Varillas a Comprar</th>
                        <th className="py-2.5 px-3 text-center">Sobrante (m)</th>
                        <th className="py-2.5 px-3 text-right">P. Varilla</th>
                        <th className="py-2.5 px-3 text-right">Total Taller</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {summary.profileUsages.map(p => (
                        <tr key={p.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-600">{p.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">{p.metersUsed.toFixed(2)} m</td>
                          <td className="py-2 px-3 text-center text-slate-500">{p.rodsFractional.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center font-black text-amber-900 bg-amber-50">
                            {p.rodsInteger} und
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500">{p.wasteMeters.toFixed(2)} m</td>
                          <td className="py-2 px-3 text-right text-slate-600">S/ {p.pricePerRod.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">S/ {p.costInteger.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-slate-700 text-right">TOTALES DE COMPRA DE VARILLAS:</td>
                        <td className="py-2 px-3 text-center font-black text-amber-900 bg-amber-100">
                          {summary.profileUsages.reduce((s, p) => s + p.rodsInteger, 0)} varillas
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500">
                          {summary.profileUsages.reduce((s, p) => s + p.wasteMeters, 0).toFixed(2)} m
                        </td>
                        <td></td>
                        <td className="py-2 px-3 text-right text-slate-900">
                          S/ {summary.profilesCostWorkshop.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* TAB 3: LISTA TÉCNICA DE CORTE */}
              {activeTab === 'cortes' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-600 mb-2">
                    Medidas exactas de corte por perfil para operarios de taller. Descuentos calculados según fórmulas de <strong>COTIZADOR.xlsx</strong>.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(allCutsGrouped.values()).map(grp => (
                      <div key={grp.profileCode} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                          <span className="font-bold text-slate-800 text-xs">
                            [{grp.profileCode}] {grp.profileName}
                          </span>
                          <span className="text-[11px] font-bold text-sky-700">
                            {grp.cuts.reduce((s, c) => s + c.totalMeters, 0).toFixed(2)} m total
                          </span>
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-400 font-semibold text-[10px]">
                              <th className="text-left pb-1">Corte</th>
                              <th className="text-center pb-1">Medida (mm)</th>
                              <th className="text-center pb-1">Cant.</th>
                              <th className="text-right pb-1">Total (m)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {grp.cuts.map((c, i) => (
                              <tr key={i}>
                                <td className="py-1 text-slate-700">{c.name}</td>
                                <td className="py-1 text-center font-bold text-slate-900">{c.len} mm</td>
                                <td className="py-1 text-center text-slate-600">{c.cant} und</td>
                                <td className="py-1 text-right text-slate-500">{c.totalMeters.toFixed(2)} m</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Sistema activo: <strong>{settings.serie}</strong> • Color: <strong>{settings.color}</strong>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
