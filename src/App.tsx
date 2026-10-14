import { useState, useMemo, useEffect } from 'react';
import type {
  ClientData,
  CompanyConfig,
  QuoteItem,
  QuoteSettings,
  SerieType,
} from './lib/calc/types';
import {
  DEFAULT_ACCESSORIES_BY_SERIE,
  DEFAULT_GLASS_PRICES,
  DEFAULT_PROFILES_BY_SERIE,
} from './lib/calc/defaultPrices';
import { calculateQuote } from './lib/calc/engine';
import { Header } from './components/Header';
import { SeriesSelector } from './components/SeriesSelector';
import { ClientInfoCard } from './components/ClientInfoCard';
import { QuoteSettingsPanel } from './components/QuoteSettingsPanel';
import { ItemsTable } from './components/ItemsTable';
import { StickySummaryBar } from './components/StickySummaryBar';
import { InternalDetailModal } from './components/InternalDetailModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { SavedQuotesModal } from './components/SavedQuotesModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { generateProformaPdf } from './lib/pdf/generateProformaPdf';
import { generateWhatsAppMessage } from './lib/whatsapp/generateWhatsAppMessage';
import {
  getSavedQuotes,
  getStoredCompanyConfig,
  saveQuoteRecord,
  deleteQuoteRecord,
  saveStoredCompanyConfig,
  type SavedQuoteRecord,
} from './lib/storage/quotesStorage';

export default function App() {
  // Configuración de la empresa y listas de precios
  const [company, setCompany] = useState<CompanyConfig>(() => getStoredCompanyConfig());
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES_BY_SERIE);
  const [accessories, setAccessories] = useState(DEFAULT_ACCESSORIES_BY_SERIE);
  const [glass, setGlass] = useState(DEFAULT_GLASS_PRICES);

  // Lista de cotizaciones guardadas
  const [savedQuotes, setSavedQuotes] = useState<SavedQuoteRecord[]>(() => getSavedQuotes());

  // Modales
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInternalDetailOpen, setIsInternalDetailOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Datos del Cliente
  const [client, setClient] = useState<ClientData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    quoteNumber: 'PRO-0001',
    quoteDate: new Date().toLocaleDateString('es-PE'),
    validityDays: 15,
  });

  // Ajustes de la cotización actual
  const [settings, setSettings] = useState<QuoteSettings>({
    serie: 'SERIE 25', // La más vendida por defecto
    color: 'BLANCO',
    glassType: 'TEMPLADO',
    glassThickness: '6 mm',
    sealing: 'BURLETE',
    exchangeRate: 3.70, // REGLA COMERCIAL: 3.70 por defecto
    profitMargin: 0.30, // 30% ganancia
    installationPerM2: 20,
    assemblyPerM2: 30,
    mobilityCost: 100,
    otherCost: 0,
    s42ProfileWaste: 0.05, // 5% merma proyectante
  });

  // Ítems de la cotización (inicia con un ítem de muestra listo para editar)
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: 'item-1',
      itemNumber: 1,
      widthMm: 1500,
      heightMm: 1400,
      quantity: 1,
      itemType: 'VENTANA',
      leaves: 'DOS_HOJAS',
      modulation: 'DOBLE CORREDIZO',
      handleType: 'MANIJA',
      s42Design: '01 fijo 01 proyectante',
      s42Arms: '40 cm',
    },
  ]);

  // CÁLCULO EN VIVO EN CADA PULSACIÓN DE TECLA
  const summary = useMemo(() => {
    return calculateQuote(items, settings, profiles, accessories, glass);
  }, [items, settings, profiles, accessories, glass]);

  // Guardar en Storage cuando cambia la configuración de empresa
  useEffect(() => {
    saveStoredCompanyConfig(company);
  }, [company]);

  // Manejo de Ítems
  const handleAddItem = () => {
    const nextNum = items.length + 1;
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemNumber: nextNum,
      widthMm: 1200,
      heightMm: 1200,
      quantity: 1,
      itemType: 'VENTANA',
      leaves: 'DOS_HOJAS',
      modulation: 'DOBLE CORREDIZO',
      handleType: 'MANIJA',
      s42Design: '01 fijo 01 proyectante',
      s42Arms: '40 cm',
    };
    setItems([...items, newItem]);
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDup = items.find(it => it.id === id);
    if (!itemToDup) return;
    const duplicated: QuoteItem = {
      ...itemToDup,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemNumber: items.length + 1,
    };
    setItems([...items, duplicated]);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) return;
    const filtered = items.filter(it => it.id !== id);
    setItems(filtered.map((it, idx) => ({ ...it, itemNumber: idx + 1 })));
  };

  const handleUpdateItem = (id: string, updated: Partial<QuoteItem>) => {
    setItems(items.map(it => (it.id === id ? { ...it, ...updated } : it)));
  };

  const handleSelectSerie = (serie: SerieType) => {
    // Si cambia de serie, ajustar valores específicos de esa serie
    const newMobility = serie === 'SERIE 42' ? 50 : 100;
    setSettings(prev => ({
      ...prev,
      serie,
      mobilityCost: newMobility,
    }));

    // Actualizar modulaciones de ítems existentes para que sean válidas
    setItems(items.map(it => {
      if (serie === 'SERIE 42') {
        return {
          ...it,
          s42Design: it.s42Design || '01 fijo 01 proyectante',
          s42Arms: it.s42Arms || '40 cm',
        };
      }
      return {
        ...it,
        modulation: 'DOBLE CORREDIZO',
      };
    }));
  };

  // Nueva Cotización
  const handleNewQuote = () => {
    const currentNum = parseInt(client.quoteNumber.replace(/\D/g, '')) || 1;
    const nextQuoteNum = `PRO-${String(currentNum + 1).padStart(4, '0')}`;

    setClient({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      quoteNumber: nextQuoteNum,
      quoteDate: new Date().toLocaleDateString('es-PE'),
      validityDays: 15,
    });

    setItems([
      {
        id: `item-${Date.now()}`,
        itemNumber: 1,
        widthMm: 1500,
        heightMm: 1400,
        quantity: 1,
        itemType: 'VENTANA',
        leaves: 'DOS_HOJAS',
        modulation: 'DOBLE CORREDIZO',
        handleType: 'MANIJA',
        s42Design: '01 fijo 01 proyectante',
        s42Arms: '40 cm',
      },
    ]);
  };

  // Guardar Cotización
  const autoSaveCurrentQuote = () => {
    const record: SavedQuoteRecord = {
      id: client.quoteNumber || `QUOTE-${Date.now()}`,
      savedAt: new Date().toISOString(),
      client,
      settings,
      items,
      totalSalePrice: summary.salePriceTotal,
      totalAreaM2: summary.areaTotalM2,
    };
    saveQuoteRecord(record);
    setSavedQuotes(getSavedQuotes());
  };

  // Descargar PDF
  const handleDownloadPdf = () => {
    generateProformaPdf(client, settings, summary, company);
    autoSaveCurrentQuote();
  };

  // Compartir WhatsApp
  const handleShareWhatsApp = () => {
    setIsWhatsAppOpen(true);
    autoSaveCurrentQuote();
  };

  // Cargar Cotización Guardada
  const handleLoadQuote = (record: SavedQuoteRecord) => {
    setClient(record.client);
    setSettings(record.settings);
    setItems(record.items);
    setIsSavedQuotesOpen(false);
  };

  // Eliminar Cotización Guardada
  const handleDeleteQuote = (id: string) => {
    deleteQuoteRecord(id);
    setSavedQuotes(getSavedQuotes());
  };

  const whatsAppMessageText = useMemo(() => {
    return generateWhatsAppMessage(client, settings, summary, company);
  }, [client, settings, summary, company]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Encabezado Principal */}
      <Header
        company={company}
        savedQuotesCount={savedQuotes.length}
        onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNewQuote={handleNewQuote}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Selector de Serie */}
        <SeriesSelector
          selectedSerie={settings.serie}
          onSelectSerie={handleSelectSerie}
        />

        {/* Datos del Cliente & Obra */}
        <ClientInfoCard
          client={client}
          onChangeClient={(updated) => setClient(prev => ({ ...prev, ...updated }))}
        />

        {/* Ajustes de Materiales, Vidrio y Ganancia */}
        <QuoteSettingsPanel
          settings={settings}
          onChangeSettings={(updated) => setSettings(prev => ({ ...prev, ...updated }))}
        />

        {/* Tabla de Medidas & Modulación */}
        <ItemsTable
          serie={settings.serie}
          items={items}
          itemsResults={summary.itemsResults}
          onAddItem={handleAddItem}
          onDuplicateItem={handleDuplicateItem}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
        />
      </main>

      {/* Barra Inferior Fija de Totales */}
      <StickySummaryBar
        summary={summary}
        onDownloadPdf={handleDownloadPdf}
        onShareWhatsApp={handleShareWhatsApp}
        onOpenInternalDetail={() => setIsInternalDetailOpen(true)}
      />

      {/* Modales */}
      <InternalDetailModal
        isOpen={isInternalDetailOpen}
        onClose={() => setIsInternalDetailOpen(false)}
        summary={summary}
        settings={settings}
        companyPin={company.defaultPin}
      />

      <AdminSettingsModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        company={company}
        onSaveCompany={setCompany}
        profiles={profiles}
        onSaveProfiles={setProfiles}
        accessories={accessories}
        onSaveAccessories={setAccessories}
        glass={glass}
        onSaveGlass={setGlass}
      />

      <SavedQuotesModal
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        savedQuotes={savedQuotes}
        onLoadQuote={handleLoadQuote}
        onDeleteQuote={handleDeleteQuote}
      />

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        messageText={whatsAppMessageText}
        clientPhone={client.clientPhone}
      />
    </div>
  );
}
