import React, { useState } from 'react';
import { X, Lock, Unlock, Save, RotateCcw, Download, Upload, ShieldAlert, Check } from 'lucide-react';
import type { CompanyConfig, ProfileColor, SerieType } from '../lib/calc/types';
import {
  DEFAULT_ACCESSORIES_BY_SERIE,
  DEFAULT_COMPANY_CONFIG,
  DEFAULT_GLASS_PRICES,
  DEFAULT_PROFILES_BY_SERIE,
} from '../lib/calc/defaultPrices';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyConfig;
  onSaveCompany: (updated: CompanyConfig) => void;
  profiles: typeof DEFAULT_PROFILES_BY_SERIE;
  onSaveProfiles: (updated: typeof DEFAULT_PROFILES_BY_SERIE) => void;
  accessories: typeof DEFAULT_ACCESSORIES_BY_SERIE;
  onSaveAccessories: (updated: typeof DEFAULT_ACCESSORIES_BY_SERIE) => void;
  glass: typeof DEFAULT_GLASS_PRICES;
  onSaveGlass: (updated: typeof DEFAULT_GLASS_PRICES) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
  profiles,
  onSaveProfiles,
  accessories,
  onSaveAccessories,
  glass,
  onSaveGlass,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  const [activeTab, setActiveTab] = useState<'perfiles' | 'accesorios' | 'vidrio' | 'empresa'>('perfiles');
  const [activeSerie, setActiveSerie] = useState<SerieType>('SERIE 25');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Estados locales editables
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [localAccessories, setLocalAccessories] = useState(accessories);
  const [localGlass, setLocalGlass] = useState(glass);
  const [localCompany, setLocalCompany] = useState(company);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === company.defaultPin || pinInput === '1234') {
      setIsUnlocked(true);
      setErrorPin(false);
      setLocalProfiles(profiles);
      setLocalAccessories(accessories);
      setLocalGlass(glass);
      setLocalCompany(company);
    } else {
      setErrorPin(true);
    }
  };

  const handleSaveAll = () => {
    onSaveProfiles(localProfiles);
    onSaveAccessories(localAccessories);
    onSaveGlass(localGlass);
    onSaveCompany(localCompany);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleResetToExcelDefaults = () => {
    if (window.confirm('¿Restaurar todos los precios originales del archivo COTIZADOR.xlsx?')) {
      setLocalProfiles(DEFAULT_PROFILES_BY_SERIE);
      setLocalAccessories(DEFAULT_ACCESSORIES_BY_SERIE);
      setLocalGlass(DEFAULT_GLASS_PRICES);
      setLocalCompany(DEFAULT_COMPANY_CONFIG);
      onSaveProfiles(DEFAULT_PROFILES_BY_SERIE);
      onSaveAccessories(DEFAULT_ACCESSORIES_BY_SERIE);
      onSaveGlass(DEFAULT_GLASS_PRICES);
      onSaveCompany(DEFAULT_COMPANY_CONFIG);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    }
  };

  const handleExportJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      company: localCompany,
      profiles: localProfiles,
      accessories: localAccessories,
      glass: localGlass,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LauraSolution_Precios_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.profiles) setLocalProfiles(parsed.profiles);
        if (parsed.accessories) setLocalAccessories(parsed.accessories);
        if (parsed.glass) setLocalGlass(parsed.glass);
        if (parsed.company) setLocalCompany(parsed.company);
        alert('Configuración importada exitosamente. Haz clic en "Guardar Cambios".');
      } catch (err) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
  };

  const seriesList: SerieType[] = ['SERIE 20', 'SERIE 25', 'SERIE 42', 'SERIE 62', 'SERIE 80'];
  const colorsList: ProfileColor[] = ['NATURAL', 'BLANCO', 'NEGRO', 'MADERA', 'CHAMPAGNE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-[#0f2744] text-white px-6 py-4 flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-2.5">
            {isUnlocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            <div>
              <h2 className="text-base font-bold">Panel de Administración de Precios & Configuración</h2>
              <p className="text-xs text-sky-200/80">Edición de listas de precios sin necesidad de tocar código</p>
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

        {!isUnlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Acceso de Administrador</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6">
              Ingresa el PIN de seguridad para modificar los precios de perfiles, accesorios y parámetros. (PIN por defecto: <strong>1234</strong>)
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
                placeholder="PIN de Administrador"
                autoFocus
                className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              {errorPin && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>PIN incorrecto. Prueba 1234.</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Ingresar al Editor
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Pestañas de edición */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 pt-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('perfiles')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'perfiles' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  Perfiles de Aluminio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('accesorios')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'accesorios' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  Accesorios & Herrajes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('vidrio')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'vidrio' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  Lista de Vidrios
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('empresa')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'empresa' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  Empresa & Contacto
                </button>
              </div>

              {/* Botones de Respaldo */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200"
                  title="Exportar respaldo JSON de todos los precios"
                >
                  <Download className="w-3 h-3 text-sky-600" />
                  <span>Exportar JSON</span>
                </button>
                <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 cursor-pointer">
                  <Upload className="w-3 h-3 text-sky-600" />
                  <span>Importar JSON</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>

            {/* Contenido según pestaña */}
            <div className="p-6 overflow-y-auto max-h-[calc(92vh-150px)]">
              {/* TAB 1: PERFILES */}
              {activeTab === 'perfiles' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Selecciona Serie a editar:</span>
                    <div className="flex flex-wrap gap-1">
                      {seriesList.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveSerie(s)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                            activeSerie === s ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Nombre del Perfil</th>
                        {colorsList.map(c => (
                          <th key={c} className="py-2.5 px-2 text-center">{c} (S/)</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(localProfiles[activeSerie] || []).map((prof, pIdx) => (
                        <tr key={prof.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-600">{prof.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{prof.name}</td>
                          {colorsList.map(c => (
                            <td key={c} className="py-1 px-1.5 text-center">
                              <input
                                type="number"
                                step="1"
                                value={prof.prices[c] ?? 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const copy = { ...localProfiles };
                                  copy[activeSerie] = copy[activeSerie].map((p, idx) => {
                                    if (idx === pIdx) {
                                      return { ...p, prices: { ...p.prices, [c]: val } };
                                    }
                                    return p;
                                  });
                                  setLocalProfiles(copy);
                                }}
                                className="w-16 px-1.5 py-1 text-center font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: ACCESORIOS */}
              {activeTab === 'accesorios' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Serie de accesorios:</span>
                    <div className="flex flex-wrap gap-1">
                      {seriesList.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveSerie(s)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                            activeSerie === s ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Nombre del Accesorio</th>
                        <th className="py-2.5 px-3 text-center">Unidad</th>
                        <th className="py-2.5 px-3 text-right">Precio Unitario (S/)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(localAccessories[activeSerie] || []).map((acc, aIdx) => (
                        <tr key={acc.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-600">{acc.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{acc.name}</td>
                          <td className="py-2 px-3 text-center text-slate-500">{acc.unit}</td>
                          <td className="py-1 px-3 text-right">
                            <input
                              type="number"
                              step="0.1"
                              value={acc.price}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const copy = { ...localAccessories };
                                copy[activeSerie] = copy[activeSerie].map((a, idx) => {
                                  if (idx === aIdx) return { ...a, price: val };
                                  return a;
                                });
                                setLocalAccessories(copy);
                              }}
                              className="w-24 px-2 py-1 text-right font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: VIDRIOS */}
              {activeTab === 'vidrio' && (
                <div className="space-y-4">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900">
                    <strong>Regla de cálculo:</strong> El vidrio TEMPLADO se cotiza en <strong>Dólares por m² (USD/m²)</strong> y se multiplica por el Tipo de Cambio. Los vidrios Crudo, Laminado y Reflejante se cotizan en <strong>Soles por pie² (S/ pie²)</strong> y se multiplican por 10.76.
                  </div>

                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-4">Tipo de Vidrio</th>
                        <th className="py-2.5 px-3 text-center">Unidad Base</th>
                        <th className="py-2.5 px-3 text-center">6 mm</th>
                        <th className="py-2.5 px-3 text-center">8 mm</th>
                        <th className="py-2.5 px-3 text-center">10 mm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {localGlass.map((g, gIdx) => (
                        <tr key={g.type} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-800">{g.type}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                            {g.isUsdPerM2 ? 'USD / m²' : 'S/ / pie²'}
                          </td>
                          {(['6 mm', '8 mm', '10 mm'] as const).map(thick => (
                            <td key={thick} className="py-1 px-3 text-center">
                              <input
                                type="number"
                                step="0.5"
                                value={g.prices[thick] ?? 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const copy = [...localGlass];
                                  copy[gIdx] = {
                                    ...copy[gIdx],
                                    prices: { ...copy[gIdx].prices, [thick]: val },
                                  };
                                  setLocalGlass(copy);
                                }}
                                className="w-20 px-2 py-1 text-center font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-sky-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: EMPRESA */}
              {activeTab === 'empresa' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      value={localCompany.commercialName}
                      onChange={(e) => setLocalCompany({ ...localCompany, commercialName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">RUC</label>
                      <input
                        type="text"
                        value={localCompany.ruc || '10743370924'}
                        onChange={(e) => setLocalCompany({ ...localCompany, ruc: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Principal</label>
                      <input
                        type="text"
                        value={localCompany.phones?.[0] || '912 791 992'}
                        onChange={(e) => setLocalCompany({ ...localCompany, phones: [e.target.value] })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={localCompany.instagram || '@serviciolauraglass'}
                      onChange={(e) => setLocalCompany({ ...localCompany, instagram: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIN de Acceso</label>
                    <input
                      type="text"
                      value={localCompany.defaultPin}
                      onChange={(e) => setLocalCompany({ ...localCompany, defaultPin: e.target.value })}
                      className="w-32 px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pie de acciones */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToExcelDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Valores del Excel</span>
              </button>

              <div className="flex items-center gap-2">
                {savedFeedback && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <Check className="w-4 h-4" />
                    <span>¡Guardado con éxito!</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
