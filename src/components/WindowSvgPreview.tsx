import React from 'react';
import type { QuoteItem, SerieType } from '../lib/calc/types';

interface WindowSvgPreviewProps {
  item: QuoteItem;
  serie: SerieType;
  width?: number;
  height?: number;
  showDimensions?: boolean;
}

export const WindowSvgPreview: React.FC<WindowSvgPreviewProps> = ({
  item,
  serie,
  width = 180,
  height = 120,
  showDimensions = true,
}) => {
  const isS42 = serie === 'SERIE 42';
  const designS42 = item.s42Design || '01 fijo 01 proyectante';
  const leaves = item.leaves;
  const mod = item.modulation;

  // Aspect ratio clamp
  const wRatio = Math.max(0.6, Math.min(2.5, item.widthMm / (item.heightMm || 1000)));
  const svgW = 160;
  const svgH = Math.round(svgW / wRatio);
  const clampedH = Math.max(70, Math.min(140, svgH));

  const frameThickness = 6;
  const innerX = frameThickness;
  const innerY = frameThickness;
  const innerW = svgW - frameThickness * 2;
  const innerH = clampedH - frameThickness * 2;

  // Render para Serie 42 Proyectante
  if (isS42) {
    if (designS42 === '01 proyectante') {
      return (
        <div className="flex flex-col items-center justify-center p-2 bg-slate-100/80 rounded-lg border border-slate-200">
          <svg width={width} height={height} viewBox={`0 0 ${svgW} ${clampedH}`} className="overflow-visible">
            {/* Marco Exterior */}
            <rect x="0" y="0" width={svgW} height={clampedH} fill="#0f2744" rx="2" />
            <rect x={innerX} y={innerY} width={innerW} height={innerH} fill="#e0f2fe" rx="1" />
            
            {/* Nave Proyectante con bisel */}
            <rect x={innerX + 4} y={innerY + 4} width={innerW - 8} height={innerH - 8} fill="#bae6fd" stroke="#0369a1" strokeWidth="2" />
            
            {/* Líneas proyectantes arquitectónicas (apertura hacia abajo) */}
            <line x1={innerX + 4} y1={innerY + 4} x2={innerX + innerW / 2} y2={innerY + innerH - 4} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={innerX + innerW - 4} y1={innerY + 4} x2={innerX + innerW / 2} y2={innerY + innerH - 4} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Manija proyectante */}
            <circle cx={innerX + innerW / 2} cy={innerY + innerH - 8} r="2.5" fill="#0f2744" />
          </svg>
          {showDimensions && (
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {item.widthMm} × {item.heightMm} mm • 1 Nave Proyectante
            </span>
          )}
        </div>
      );
    }

    if (designS42 === '01 fijo 01 proyectante') {
      const halfH = innerH / 2;
      return (
        <div className="flex flex-col items-center justify-center p-2 bg-slate-100/80 rounded-lg border border-slate-200">
          <svg width={width} height={height} viewBox={`0 0 ${svgW} ${clampedH}`} className="overflow-visible">
            {/* Marco Exterior */}
            <rect x="0" y="0" width={svgW} height={clampedH} fill="#0f2744" rx="2" />
            
            {/* Travesaño horizontal */}
            <rect x={innerX} y={innerY + halfH - 2} width={innerW} height="4" fill="#0f2744" />

            {/* Paño Superior: Fijo (con X arquitectónica) */}
            <rect x={innerX} y={innerY} width={innerW} height={halfH - 2} fill="#f0f9ff" />
            <line x1={innerX + 8} y1={innerY + 4} x2={innerX + innerW - 8} y2={innerY + halfH - 6} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={innerX + innerW - 8} y1={innerY + 4} x2={innerX + 8} y2={innerY + halfH - 6} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <text x={innerX + innerW / 2} y={innerY + halfH / 2 + 3} textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="bold">FIJO</text>

            {/* Paño Inferior: Proyectante */}
            <rect x={innerX} y={innerY + halfH + 2} width={innerW} height={halfH - 2} fill="#bae6fd" />
            <rect x={innerX + 3} y={innerY + halfH + 5} width={innerW - 6} height={halfH - 8} fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
            <line x1={innerX + 3} y1={innerY + halfH + 5} x2={innerX + innerW / 2} y2={innerY + innerH - 3} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1={innerX + innerW - 3} y1={innerY + halfH + 5} x2={innerX + innerW / 2} y2={innerY + innerH - 3} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx={innerX + innerW / 2} cy={innerY + innerH - 6} r="2.5" fill="#0f2744" />
          </svg>
          {showDimensions && (
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              {item.widthMm} × {item.heightMm} mm • 1 Fijo + 1 Proy.
            </span>
          )}
        </div>
      );
    }
  }

  // Render para Sistemas Corredizos (Serie 20, 25, 62, 80)
  let numPanels = 2;
  if (leaves === 'TRES_HOJAS' || mod === '03 CORREDIZOS' || mod === '02 CORREDIZAS 01 FIJO' || mod === '02 FIJAS 01 CORREDIZO') {
    numPanels = 3;
  } else if (leaves === 'CUATRO_HOJAS' || mod === '04 CORREDIZAS' || mod === '02 FIJAS 02 CORREDIZOS' || mod === '03 CORREDIZOS 01 FIJO') {
    numPanels = 4;
  }

  const panelW = (innerW - (numPanels - 1) * 2) / numPanels;

  // Determinación de cuáles son fijas y cuáles corredizas
  const isPanelFixed = (idx: number): boolean => {
    if (mod === 'DOBLE CORREDIZO' || mod === '03 CORREDIZOS' || mod === '04 CORREDIZAS') {
      return false; // Todos corredizos
    }
    if (mod === '02 CORREDIZAS 01 FIJO') {
      return idx === 1; // Centro fijo
    }
    if (mod === '02 FIJAS 01 CORREDIZO') {
      return idx === 0 || idx === 2; // Extremos fijos, centro corredizo
    }
    if (mod === '02 FIJAS 02 CORREDIZOS') {
      return idx === 0 || idx === 3; // Laterales fijos, centro corredizo
    }
    if (mod === '03 CORREDIZOS 01 FIJO') {
      return idx === 0; // Primer paño fijo
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-100/80 rounded-lg border border-slate-200">
      <svg width={width} height={height} viewBox={`0 0 ${svgW} ${clampedH}`} className="overflow-visible">
        {/* Marco Principal Exterior */}
        <rect x="0" y="0" width={svgW} height={clampedH} fill="#0f2744" rx="2" />

        {/* Paneles de Hojas */}
        {Array.from({ length: numPanels }).map((_, i) => {
          const px = innerX + i * (panelW + 2);
          const fixed = isPanelFixed(i);
          return (
            <g key={i}>
              {/* Vidrio */}
              <rect
                x={px}
                y={innerY}
                width={panelW}
                height={innerH}
                fill={fixed ? '#f0f9ff' : '#bae6fd'}
                stroke="#0f2744"
                strokeWidth="1.5"
              />

              {/* Bisel interior de hoja */}
              <rect
                x={px + 2}
                y={innerY + 2}
                width={panelW - 4}
                height={innerH - 4}
                fill="none"
                stroke="#64748b"
                strokeWidth="0.75"
              />

              {fixed ? (
                // Paño FIJO: Marca 'X' clásica
                <g opacity="0.45">
                  <line x1={px + 4} y1={innerY + 4} x2={px + panelW - 4} y2={innerY + innerH - 4} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={px + panelW - 4} y1={innerY + 4} x2={px + 4} y2={innerY + innerH - 4} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={px + panelW / 2} y={innerY + innerH / 2 + 3} textAnchor="middle" fontSize="7" fill="#0f2744" fontWeight="bold">FIJO</text>
                </g>
              ) : (
                // Paño CORREDIZO: Flecha indicadora de deslizamiento
                <g>
                  {i % 2 === 0 ? (
                    // Flecha hacia la derecha ->
                    <path
                      d={`M ${px + panelW / 2 - 8} ${innerY + innerH / 2} L ${px + panelW / 2 + 8} ${innerY + innerH / 2} M ${px + panelW / 2 + 4} ${innerY + innerH / 2 - 4} L ${px + panelW / 2 + 8} ${innerY + innerH / 2} L ${px + panelW / 2 + 4} ${innerY + innerH / 2 + 4}`}
                      stroke="#0284c7"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ) : (
                    // Flecha hacia la izquierda <-
                    <path
                      d={`M ${px + panelW / 2 + 8} ${innerY + innerH / 2} L ${px + panelW / 2 - 8} ${innerY + innerH / 2} M ${px + panelW / 2 - 4} ${innerY + innerH / 2 - 4} L ${px + panelW / 2 - 8} ${innerY + innerH / 2} L ${px + panelW / 2 - 4} ${innerY + innerH / 2 + 4}`}
                      stroke="#0284c7"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Tirador / Manija en el borde */}
                  <rect
                    x={i % 2 === 0 ? px + panelW - 5 : px + 2}
                    y={innerY + innerH / 2 - 8}
                    width="3"
                    height="16"
                    rx="1"
                    fill="#0f2744"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {showDimensions && (
        <span className="text-[10px] text-slate-500 font-medium mt-1">
          {item.widthMm} × {item.heightMm} mm • {numPanels} Hojas ({mod})
        </span>
      )}
    </div>
  );
};
