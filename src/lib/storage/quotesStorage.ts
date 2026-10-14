import type { ClientData, CompanyConfig, QuoteItem, QuoteSettings } from '../calc/types';
import { DEFAULT_COMPANY_CONFIG } from '../calc/defaultPrices';

export interface SavedQuoteRecord {
  id: string;
  savedAt: string;
  client: ClientData;
  settings: QuoteSettings;
  items: QuoteItem[];
  totalSalePrice: number;
  totalAreaM2: number;
}

const STORAGE_KEY_QUOTES = 'laura_solution_saved_quotes_v1';
const STORAGE_KEY_COMPANY = 'laura_solution_company_config_v1';
const STORAGE_KEY_LAST_SETTINGS = 'laura_solution_last_settings_v1';

export function getSavedQuotes(): SavedQuoteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading saved quotes:', e);
    return [];
  }
}

export function saveQuoteRecord(record: SavedQuoteRecord): void {
  try {
    const quotes = getSavedQuotes();
    const existingIndex = quotes.findIndex(q => q.id === record.id);
    if (existingIndex >= 0) {
      quotes[existingIndex] = record;
    } else {
      quotes.unshift(record);
    }
    localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Error saving quote:', e);
  }
}

export function deleteQuoteRecord(id: string): void {
  try {
    const quotes = getSavedQuotes().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Error deleting quote:', e);
  }
}

export function getStoredCompanyConfig(): CompanyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    return raw ? { ...DEFAULT_COMPANY_CONFIG, ...JSON.parse(raw) } : DEFAULT_COMPANY_CONFIG;
  } catch (e) {
    return DEFAULT_COMPANY_CONFIG;
  }
}

export function saveStoredCompanyConfig(config: CompanyConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving company config:', e);
  }
}

export function getStoredLastSettings(defaultSettings: QuoteSettings): QuoteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

export function saveStoredLastSettings(settings: QuoteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving last settings:', e);
  }
}
