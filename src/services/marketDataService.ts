import { HistoricalPricePoint, MandiPrice, CropType } from '../types';

export interface MarketDataSource {
  source: 'government' | 'calculated' | 'user' | 'mock';
  sourceDate: string | null;
  fetchedAt?: string; // Made optional to allow extension with MandiPrice
}

export interface IngestedMandiPrice extends MandiPrice, MarketDataSource {}

export interface IngestedHistoricalPoint extends HistoricalPricePoint, MarketDataSource {}

export const GOVERNMENT_DATA_API_BASE = '/api/market-prices';

export const MOCK_DATA_MARKER = 'MOCK';

export function isMockPriceRecord(record: any): boolean {
  return record?.id === MOCK_DATA_MARKER;
}

export function createMockMandiPrice(overrides: Partial<MandiPrice>): MandiPrice {
  const base: MandiPrice = {
    id: MOCK_DATA_MARKER,
    mandiName: 'Mock APMC Mandi',
    district: 'Alwar',
    state: 'Rajasthan',
    distanceKm: 32,
    crop: 'Wheat',
    modalPricePerQtl: 0,
    minPricePerQtl: 0,
    maxPricePerQtl: 0,
    dailyArrivalTonnes: 0,
    trend: 'stable',
    cessPercent: 1.6,
    handlingChargePerQtl: 28,
    lastUpdated: 'Mock Data',
  };
  return { ...base, ...overrides };
}

export function createMockHistoricalPoint(date: string): HistoricalPricePoint {
  const base: HistoricalPricePoint = {
    date,
    mandiModalPrice: 0,
    institutionalBuyerAvg: 0,
    volumeQuintals: 0,
  };
  return { ...base, ...MARKET_DATA_SOURCES_MOCK };
}

export const MARKET_DATA_SOURCES_MOCK: MarketDataSource = {
  source: 'mock',
  sourceDate: null,
  fetchedAt: new Date().toISOString(),
};

export const MARKET_DATA_SOURCES_GOV_INDICATIVE: MarketDataSource = {
  source: 'government',
  sourceDate: new Date().toISOString().split('T')[0],
  fetchedAt: new Date().toISOString(),
};

export const MARKET_DATA_SOURCES_CALCULATED: MarketDataSource = {
  source: 'calculated',
  sourceDate: null,
  fetchedAt: new Date().toISOString(),
};

/**
 * Normalize a government AGMARKNET mandi price record into our schema.
 * Returns null if the record is invalid or incomplete.
 */
export function normalizeGovernmentMandiPrice(record: any): IngestedMandiPrice | null {
  if (!record || typeof record !== 'object') return null;

  const {
    state,
    district,
    market,
    commodity,
    variety,
    arrival_date,
    min_price,
    max_price,
    modal_price,
    arrival_volume,
  } = record;

  // Validate required fields
  if (
    !state ||
    !district ||
    !commodity ||
    modal_price === undefined ||
    modal_price === null
  ) {
    console.warn('Invalid government mandi record: missing required fields', record);
    return null;
  }

  const normalized: IngestedMandiPrice = {
    id: `mandi-${state.toLowerCase()}-${commodity.toLowerCase()}-${arrival_date || Date.now()}`,
    mandiName: market || `${commodity} Mandi`,
    district,
    state,
    crop: commodity as CropType,
    modalPricePerQtl: Number(modal_price),
    minPricePerQtl: min_price !== undefined ? Number(min_price) : undefined,
    maxPricePerQtl: max_price !== undefined ? Number(max_price) : undefined,
    dailyArrivalTonnes: arrival_volume !== undefined ? Number(arrival_volume) : undefined,
    trend: 'stable',
    handlingChargePerQtl: 25,
    cessPercent: 1.6,
    lastUpdated: arrival_date || new Date().toISOString(),
    distanceKm: 32,
    source: 'government' as const,
    sourceDate: arrival_date || new Date().toISOString().split('T')[0],
    fetchedAt: new Date().toISOString(),
  };

  return normalized;
}

/**
 * Normalize a government AGMARKNET historical price point.
 * Returns null if the record is invalid or incomplete.
 */
export function normalizeGovernmentHistoricalPoint(record: any): IngestedHistoricalPoint | null {
  if (!record || typeof record !== 'object') return null;

  const {
    date,
    mandi_price,
    buyer_price,
    volume,
  } = record;

  if (!date || mandi_price === undefined || mandi_price === null) {
    console.warn('Invalid government historical record: missing required fields', record);
    return null;
  }

  const normalized: IngestedHistoricalPoint = {
    date,
    mandiModalPrice: Number(mandi_price),
    institutionalBuyerAvg: buyer_price !== undefined ? Number(buyer_price) : undefined,
    volumeQuintals: volume !== undefined ? Number(volume) : undefined,
    source: 'government' as const,
    sourceDate: date,
    fetchedAt: new Date().toISOString(),
  };

  return normalized;
}

/**
 * Fetch market prices from government API.
 * Currently this is a placeholder - integrate with actual AGMARKNET API when available.
 */
export async function fetchGovernmentMarketPrices(
  commodity: CropType,
  state?: string,
  district?: string
): Promise<IngestedMandiPrice[]> {
  // TODO: Integrate with actual GOI AGMARKNET API at data.gov.in
  // Endpoint pattern: https://api.data.gov.in/resource/.../?filters[commodity]=Wheat&filters[state]=Rajasthan
  
  // For now, return indicative government sample data (clearly marked as indicative)
  // In production, this would make a real API call with proper auth
  console.info('Government API fetch placeholder - returning indicative data');

  // Return empty array - frontend will fall back to calculated/mock data
  return [];
}

/**
 * Fetch 30-day historical prices from government API.
 * Currently this is a placeholder - integrate with actual AGMARKNET API when available.
 */
export async function fetchGovernmentHistoricalPrices(
  commodity: CropType,
  state?: string,
  district?: string
): Promise<IngestedHistoricalPoint[]> {
  // TODO: Integrate with actual AGMARKNET historical data API
  // Endpoint pattern with date range filters
  
  console.info('Government historical API fetch placeholder - returning empty, fallback to mock data');
  return [];
}

/**
 * Ingest and validate a government dataset file (CSV/JSON download from data.gov.in).
 * Meant to be called after downloading official AGMARKNET dataset.
 */
export function ingestGovernmentDataset(
  rawData: any[],
  format: 'csv' | 'json' = 'json'
): { valid: IngestedMandiPrice[]; invalid: any[]; stats: { total: number; valid: number; invalid: number } } {
  const valid: IngestedMandiPrice[] = [];
  const invalid: any[] = [];

  for (const record of rawData) {
    const normalized = normalizeGovernmentMandiPrice(record);
    if (normalized) {
      valid.push(normalized);
    } else {
      invalid.push(record);
    }
  }

  const stats = {
    total: rawData.length,
    valid: valid.length,
    invalid: invalid.length,
  };

  console.info(`Dataset ingestion complete: ${stats.valid}/${stats.total} records valid`, stats);
  return { valid, invalid, stats };
}

/**
 * Get the effective mandi price for a crop, preferring government data over calculated/mock.
 * This is the key decision function for the market intelligence layer.
 */
export function getEffectiveMandiPrice(
  crop: CropType,
  state: string,
  district: string,
  governmentPrices: IngestedMandiPrice[] = [],
  calculatedPrice?: number
): { price: number; source: MarketDataSource; record: IngestedMandiPrice | null } {
  // Priority 1: Government data matching state+crop
  const govMatch = governmentPrices.find(
    p => p.state === state && (p.crop as CropType) === crop && p.modalPricePerQtl != null
  );

  if (govMatch && govMatch.modalPricePerQtl != null) {
    // Construct a proper MarketDataSource from the matched government record
    const govSource: MarketDataSource = {
      source: govMatch.source,
      sourceDate: govMatch.sourceDate,
      fetchedAt: govMatch.fetchedAt,
    };
    return {
      price: govMatch.modalPricePerQtl,
      source: govSource,
      record: govMatch,
    };
  }

  // Priority 2: Calculated price (from FasalNiti engine)
  if (calculatedPrice != null && calculatedPrice > 0) {
    return {
      price: calculatedPrice,
      source: MARKET_DATA_SOURCES_CALCULATED,
      record: null,
    };
  }

  // Priority 3: Fallback to mock data
  const mockRecord: IngestedMandiPrice = {
    id: MOCK_DATA_MARKER,
    mandiName: 'Mock APMC Mandi',
    district,
    state,
    crop,
    modalPricePerQtl: 2520,
    minPricePerQtl: 2380,
    maxPricePerQtl: 2590,
    dailyArrivalTonnes: 450,
    trend: 'up',
    cessPercent: 1.6,
    handlingChargePerQtl: 28,
    lastUpdated: 'Mock Data',
    distanceKm: 32,
    source: 'mock' as const,
    sourceDate: null,
    fetchedAt: new Date().toISOString(),
  };

  // Construct source from mock record
  const mockSource: MarketDataSource = {
    source: mockRecord.source,
    sourceDate: mockRecord.sourceDate,
    fetchedAt: mockRecord.fetchedAt,
  };

  return {
    price: mockRecord.modalPricePerQtl,
    source: mockSource,
    record: mockRecord,
  };
}

/**
 * Get the effective historical price point for a crop and date.
 */
export function getEffectiveHistoricalPrice(
  crop: CropType,
  date: string,
  governmentPoints: IngestedHistoricalPoint[] = [],
  calculatedPoints: HistoricalPricePoint[] = []
): { point: IngestedHistoricalPoint | HistoricalPricePoint | null; source: MarketDataSource } {
  // Priority 1: Government data matching exact date
  const govMatch = governmentPoints.find(p => p.date === date);

  if (govMatch) {
    // Construct a proper MarketDataSource from the matched government record
    const govSource: MarketDataSource = {
      source: govMatch.source,
      sourceDate: govMatch.sourceDate,
      fetchedAt: govMatch.fetchedAt,
    };
    return {
      point: govMatch,
      source: govSource,
    };
  }

  // Priority 2: Calculated points
  const calcMatch = calculatedPoints.find(p => p.date === date);

  if (calcMatch) {
    return {
      point: calcMatch,
      source: MARKET_DATA_SOURCES_CALCULATED,
    };
  }

  // Priority 3: No data available
  const fallbackSource: MarketDataSource = {
    source: 'mock' as const,
    sourceDate: null,
    fetchedAt: new Date().toISOString(),
  };
  return {
    point: null,
    source: fallbackSource,
  };
}

export default {
  normalizeGovernmentMandiPrice,
  normalizeGovernmentHistoricalPoint,
  fetchGovernmentMarketPrices,
  fetchGovernmentHistoricalPrices,
  ingestGovernmentDataset,
  getEffectiveMandiPrice,
  getEffectiveHistoricalPrice,
  MARKET_DATA_SOURCES_MOCK,
  MARKET_DATA_SOURCES_GOV_INDICATIVE,
  MARKET_DATA_SOURCES_CALCULATED,
  isMockPriceRecord,
};