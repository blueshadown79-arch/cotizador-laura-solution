import React from 'react';
import { User, Phone, MapPin, Hash, Calendar } from 'lucide-react';
import type { ClientData } from '../lib/calc/types';

interface ClientInfoCardProps {
  client: ClientData;
  onChangeClient: (updated: Partial<ClientData>) => void;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  client,
  onChangeClient,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            2. Datos del Cliente & Obra
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Aparecerán impresos en la proforma PDF y WhatsApp
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Nombre Cliente */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Nombre del Cliente *
          </label>
          <div className="relative">
            <input
              type="text"
              value={client.clientName}
              onChange={(e) => onChangeClient({ clientName: e.target.value })}
              placeholder="Ej. Ing. Carlos Mendoza"
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 font-medium"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Teléfono / WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Teléfono / WhatsApp
          </label>
          <div className="relative">
            <input
              type="text"
              value={client.clientPhone}
              onChange={(e) => onChangeClient({ clientPhone: e.target.value })}
              placeholder="Ej. 987 654 321"
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Obra / Dirección */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Obra / Dirección
          </label>
          <div className="relative">
            <input
              type="text"
              value={client.clientAddress || ''}
              onChange={(e) => onChangeClient({ clientAddress: e.target.value })}
              placeholder="Ej. Miraflores - Dpto 402"
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* N° Proforma & Fecha */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              N° Cotización
            </label>
            <div className="relative">
              <input
                type="text"
                value={client.quoteNumber}
                onChange={(e) => onChangeClient({ quoteNumber: e.target.value })}
                className="w-full pl-7 pr-2 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 font-bold"
              />
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha
            </label>
            <div className="relative">
              <input
                type="text"
                value={client.quoteDate}
                onChange={(e) => onChangeClient({ quoteDate: e.target.value })}
                className="w-full pl-7 pr-2 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
