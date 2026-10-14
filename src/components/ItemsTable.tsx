import React, { useState } from 'react';
import { Plus, Copy, Trash2, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import type {
  ItemCalculationResult,
  ItemType,
  LeafCount,
  ModulationType,
  QuoteItem,
  S42Arms,
  S42Design,
  SerieType,
} from '../lib/calc/types';
import { WindowSvgPreview } from './WindowSvgPreview';

interface ItemsTableProps {
  serie: SerieType;
  items: QuoteItem[];
  itemsResults: ItemCalculationResult[];
  onAddItem: () => void;
  onDuplicateItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updated: Partial<QuoteItem>) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  serie,
  items,
  itemsResults,
  onAddItem,
  onDuplicateItem,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [showPreviews, setShowPreviews] = useState<Record<string, boolean>>({});

  const togglePreview = (id: string) => {
    setShowPreviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isS42 = serie === 'SERIE 42';

  // Opciones de modulación según cantidad de hojas
  const getModulationOptions = (leaves: LeafCount): ModulationType[] => {
    if (serie === 'SERIE 80') {
      if (leaves === 'DOS_HOJAS') return ['DOBLE CORREDIZO'];
      if (leaves === 'TRES_HOJAS') return ['03 CORREDIZOS', '02 CORREDIZAS 01 FIJO', '02 FIJAS 01 CORREDIZO'];
      return ['03 CORREDIZOS 01 FIJO', '02 FIJAS 02 CORREDIZOS', '04 CORREDIZAS'];
    }
    // Serie 20, 25, 62
    if (leaves === 'DOS_HOJAS') return ['DOBLE CORREDIZO'];
    if (leaves === 'TRES_HOJAS') return ['02 CORREDIZAS 01 FIJO', '02 FIJAS 01 CORREDIZO'];
    return ['02 FIJAS 02 CORREDIZOS', '04 CORREDIZAS'];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            4. Elementos a Cotizar (Medidas & Modulación)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Ítem</span>
          </button>
        </div>
      </div>

      {/* Tabla Responsiva tipo planilla */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">N°</th>
              <th className="py-2.5 px-3 w-28">Ancho (mm)</th>
              <th className="py-2.5 px-3 w-28">Alto (mm)</th>
              <th className="py-2.5 px-2 w-20 text-center">Cant.</th>
              <th className="py-2.5 px-3 w-28">Tipo</th>
              {isS42 ? (
                <>
                  <th className="py-2.5 px-3 w-48">Diseño Proyectante</th>
                  <th className="py-2.5 px-3 w-28">Brazos</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-3 w-28">Hojas</th>
                  <th className="py-2.5 px-3 w-48">Modulación</th>
                </>
              )}
              <th className="py-2.5 px-3 w-24 text-center">Área (m²)</th>
              <th className="py-2.5 px-3 w-28 text-right">P. Unitario</th>
              <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
              <th className="py-2.5 px-2 w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {items.map((it, idx) => {
              const res = itemsResults.find(r => r.item.id === it.id);
              const area = res ? res.areaM2 : (it.widthMm * it.heightMm * it.quantity) / 1000000;
              const unitPrice = res ? res.unitPrice : 0;
              const subtotal = res ? res.subtotal : 0;
              const isPreviewOpen = !!showPreviews[it.id];

              return (
                <React.Fragment key={it.id}>
                  <tr className="hover:bg-sky-50/40 transition">
                    {/* N° */}
                    <td className="py-2 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Ancho */}
                    <td className="py-2 px-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="10"
                          min="100"
                          max="6000"
                          value={it.widthMm || ''}
                          onChange={(e) => onUpdateItem(it.id, { widthMm: parseInt(e.target.value) || 0 })}
                          placeholder="Ancho"
                          className="w-full px-2.5 py-1.5 font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none">mm</span>
                      </div>
                    </td>

                    {/* Alto */}
                    <td className="py-2 px-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="10"
                          min="100"
                          max="4000"
                          value={it.heightMm || ''}
                          onChange={(e) => onUpdateItem(it.id, { heightMm: parseInt(e.target.value) || 0 })}
                          placeholder="Alto"
                          className="w-full px-2.5 py-1.5 font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none">mm</span>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        value={it.quantity || ''}
                        onChange={(e) => onUpdateItem(it.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1.5 text-center font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </td>

                    {/* Tipo: Ventana / Mampara */}
                    <td className="py-2 px-2">
                      <select
                        value={it.itemType}
                        onChange={(e) => onUpdateItem(it.id, { itemType: e.target.value as ItemType })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
                      >
                        <option value="VENTANA">VENTANA</option>
                        <option value="MAMPARA">MAMPARA</option>
                      </select>
                    </td>

                    {/* Especificaciones según Serie */}
                    {isS42 ? (
                      <>
                        {/* Diseño S42 */}
                        <td className="py-2 px-2">
                          <select
                            value={it.s42Design || '01 fijo 01 proyectante'}
                            onChange={(e) => onUpdateItem(it.id, { s42Design: e.target.value as S42Design })}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
                          >
                            <option value="01 fijo 01 proyectante">01 fijo 01 proyectante</option>
                            <option value="01 proyectante">01 proyectante</option>
                            <option value="02 proyectante">02 proyectante</option>
                          </select>
                        </td>
                        {/* Brazos S42 */}
                        <td className="py-2 px-2">
                          <select
                            value={it.s42Arms || '40 cm'}
                            onChange={(e) => onUpdateItem(it.id, { s42Arms: e.target.value as S42Arms })}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
                          >
                            <option value="40 cm">40 cm (S/ 40)</option>
                            <option value="60 cm">60 cm (S/ 80)</option>
                          </select>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Hojas */}
                        <td className="py-2 px-2">
                          <select
                            value={it.leaves}
                            onChange={(e) => {
                              const newLeaves = e.target.value as LeafCount;
                              const availableMods = getModulationOptions(newLeaves);
                              onUpdateItem(it.id, {
                                leaves: newLeaves,
                                modulation: availableMods[0],
                              });
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
                          >
                            <option value="DOS_HOJAS">DOS (2H)</option>
                            <option value="TRES_HOJAS">TRES (3H)</option>
                            <option value="CUATRO_HOJAS">CUATRO (4H)</option>
                          </select>
                        </td>
                        {/* Modulación filtrada */}
                        <td className="py-2 px-2">
                          <select
                            value={it.modulation}
                            onChange={(e) => onUpdateItem(it.id, { modulation: e.target.value as ModulationType })}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
                          >
                            {getModulationOptions(it.leaves).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </td>
                      </>
                    )}

                    {/* Área calculada */}
                    <td className="py-2 px-3 text-center font-bold text-slate-700">
                      {area > 0 ? `${area.toFixed(2)} m²` : '-'}
                    </td>

                    {/* Precio Unitario */}
                    <td className="py-2 px-3 text-right font-semibold text-slate-600">
                      {unitPrice > 0 ? `S/ ${unitPrice.toFixed(2)}` : '-'}
                    </td>

                    {/* Subtotal */}
                    <td className="py-2 px-3 text-right font-bold text-sky-900">
                      {subtotal > 0 ? `S/ ${subtotal.toFixed(2)}` : '-'}
                    </td>

                    {/* Acciones */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePreview(it.id)}
                          className={`p-1.5 rounded transition ${
                            isPreviewOpen
                              ? 'bg-sky-100 text-sky-700'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Vista previa arquitectónica de la ventana"
                        >
                          {isPreviewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateItem(it.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                          title="Duplicar este ítem"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(it.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Eliminar este ítem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Fila desplegable de vista previa gráfica */}
                  {isPreviewOpen && (
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <td colSpan={isS42 ? 11 : 11} className="py-3 px-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                          <WindowSvgPreview item={it} serie={serie} width={220} height={140} />
                          <div className="text-xs text-slate-600">
                            <p className="font-bold text-slate-800 text-sm mb-1">
                              Ítem #{idx + 1}: {it.itemType} {it.widthMm} × {it.heightMm} mm
                            </p>
                            <p className="mb-0.5">
                              <strong>Sistema:</strong> {serie} • <strong>Hojas:</strong> {it.leaves.replace('_', ' ')}
                            </p>
                            <p className="mb-0.5">
                              <strong>Modulación:</strong> {it.modulation}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-1">
                              Los paños marcados con <strong>[FIJO]</strong> representan hojas fijas. Las flechas indican deslizamiento corredizo.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón inferior para agregar ítem */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4 text-sky-600" />
          <span>Agregar otra ventana o mampara</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Total de elementos: <strong className="text-slate-800">{items.reduce((s, it) => s + it.quantity, 0)} unidades</strong>
        </span>
      </div>
    </div>
  );
};
