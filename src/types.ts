export type Language = 'en' | 'hi';

export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'admin' | 'aggregator';

export type AppView = 
  | 'landing' 
  | 'input' 
  | 'recommendation' 
  | 'compare' 
  | 'farmer_dashboard' 
  | 'aggregation' 
  | 'buyer' 
  | 'trends' 
  | 'logistics' 
  | 'admin';

export type CropType = 
  | 'Wheat'
  | 'Mustard'
  | 'Potato'
  | 'Onion'
  | 'Tomato'
  | 'Soybean'
  | 'Cotton'
  | 'Paddy (Rice)';

export type QualityGrade = 'Grade A (Premium)' | 'Grade B (Fair/Avg)' | 'Grade C (Standard)';

export interface ProduceLot {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  district: string;
  state: string;
  crop: CropType;
  quantityQuintals: number; // 1 Quintal = 100 kg
  quantityKg: number;
  grade: QualityGrade;
  moisturePercent: number;
  foreignMatterPercent: number;
  harvestDate: string;
  storageAvailable: boolean;
  warehouseDistanceKm?: number;
  minAcceptablePricePerQtl?: number;
  preferredSellingDate?: string;
  status: 'draft' | 'analyzing' | 'recommended' | 'negotiating' | 'in_transit' | 'completed' | 'analyzed';
  createdAt: string;
}

export interface BuyerProfile {
  id: string;
  companyName: string;
  category: 'Food Processor' | 'Institutional Buyer' | 'Export House' | 'Large Retailer' | 'Agri Aggregator';
  contactPerson: string;
  phone: string;
  location: string;
  district: string;
  state: string;
  reliabilityScore: number; // 0 - 100
  metrics: {
    completedTransactions: number;
    avgPaymentDelayDays: number;
    cancellationRatePercent: number;
    disputeRatePercent: number;
    farmerRating: number; // out of 5
    fulfillmentHistoryPercent: number;
  };
  verified: boolean;
}

export interface BuyerOffer {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCategory: string;
  buyerLocation: string;
  distanceKm: number;
  crop: CropType;
  minQuantityQtl: number;
  maxQuantityQtl: number;
  offeredPricePerQtl: number;
  requiredGrade: QualityGrade;
  paymentTerms: 'Immediate (T+0)' | 'Next Day (T+1)' | '3 Days (T+3)' | 'Escrow Secured';
  reliabilityScore: number; // 0 - 100
  offerValidUntil: string;
  negotiationId?: string; // links to NegotiationRecord for counter-offer tracking
  counterOfferHistory?: CounterOfferRecord[]; // preserved counter-offer chain
}

export interface MandiPrice {
  id: string;
  mandiName: string;
  district: string;
  state: string;
  distanceKm: number;
  crop: CropType;
  modalPricePerQtl: number;
  minPricePerQtl: number;
  maxPricePerQtl: number;
  dailyArrivalTonnes: number;
  trend: 'up' | 'down' | 'stable';
  cessPercent: number; // Mandi tax / cess (e.g. 1.5% - 2%)
  handlingChargePerQtl: number; // Hamali / weighment (e.g. ₹25/qtl)
  lastUpdated: string;
}

export type VehicleType = 
  | 'tractor_trolley' 
  | 'pickup_bolero' 
  | 'mini_truck_4t' 
  | 'heavy_truck_16t'
  | 'Pickup (1.5T)' 
  | 'Mini Truck (3T)' 
  | 'Medium LCV (9T)' 
  | 'Multi-Axle (16T)';

export interface TransportQuote {
  vehicleType: string;
  capacityTonnes: number;
  ratePerKm: number;
  baseLoadingCharge: number;
  tollEstimate: number;
  totalCost: number;
  costPerKg: number;
  costPerQtl: number;
}

export interface StorageOption {
  id: string;
  facilityName: string;
  facilityType: 'Government Warehouse (WDRA)' | 'Cold Storage' | 'Private Silo';
  district: string;
  distanceKm: number;
  monthlyRentPerQtl: number;
  handlingChargePerQtl: number;
  maxStorageDays: number;
  shrinkageLossRatePercent: number; // e.g. 2.5% weight loss over 30 days
  holdingCostRateAnnualPercent: number; // finance holding cost e.g. 9%
}

export interface SellingOptionBreakdown {
  optionId: 'buyer' | 'mandi' | 'aggregation' | 'storage';
  optionType: 'Direct Buyer' | 'APMC Mandi' | 'Farmer Aggregation' | 'Store & Sell Later';
  title: string;
  subtitle: string;
  grossSaleValue: number; // Price x Quantity
  pricePerQtl: number;
  deductions: {
    transportCost: number;
    storageCost: number;
    handlingCost: number;
    mandiCessOrPlatformFee: number;
    qualityRiskAdjustment: number;
    totalDeductions: number;
  };
  netRealization: number; // Gross - Total Deductions
  netRealizationPerQtl: number;
  realizationPercent: number; // (Net / Gross) * 100
  reliabilityScore: number;
  logisticsEfficiencyScore: number;
  riskFactor: number;
  recommendationScore: number; // 0 - 100
  paymentTimeline: string;
  keyBenefits: string[];
  keyRisks: string[];
  entityDetails?: {
    name: string;
    distanceKm: number;
    location: string;
  };
  futureProjection?: {
    holdingDays: number;
    expectedFuturePricePerQtl: number;
    isForecastNotice: boolean;
  };
}

export interface RecommendationResult {
  lotId: string;
  crop: CropType;
  quantityQuintals: number;
  generatedAt: string;
  recommendedOption: SellingOptionBreakdown;
  allOptions: SellingOptionBreakdown[];
  recommendationExplanation: {
    en: string;
    hi: string;
  };
  netAdvantageOverMandi: number;
  netAdvantagePercent: number;
  dataSources: {
    mandiPrice: { source: string; date: string | null };
    buyerPrice: { source: string };
    historicalPrices: { date: string; source: string }[];
  };
}

export interface AggregationParticipant {
  farmerId: string;
  farmerName: string;
  village: string;
  phone: string;
  quantityKg: number;
  quantityQtl: number;
  distanceFromClusterHubKm: number;
}

export interface AggregationGroup {
  id: string;
  clusterName: string;
  district: string;
  crop: CropType;
  grade: QualityGrade;
  targetQuantityTonnes: number;
  currentQuantityTonnes: number;
  participants: AggregationParticipant[];
  targetBuyerName: string;
  unlockedPricePerQtl: number;
  individualPricePerQtl: number;
  pooledLogisticsRatePerKg: number;
  individualLogisticsRatePerKg: number;
  status: 'forming' | 'locked' | 'dispatched' | 'settled';
  daysLeftToLock: number;
}

export interface TransactionRecord {
  id: string;
  lotId?: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  buyerOrEntityName: string;
  optionType?: 'Direct Buyer' | 'APMC Mandi' | 'Farmer Aggregation' | 'Store & Sell Later';
  crop: CropType;
  quantityQtl: number;
  pricePerQtlAgreed?: number;
  agreedPricePerQtl?: number;
  totalGrossValue?: number;
  grossAmount?: number;
  totalDeductions?: number;
  deductionsAmount?: number;
  netPayableToFarmer: number;
  status: 'initiated' | 'contract_signed' | 'vehicle_assigned' | 'weighed_inspected' | 'payment_released' | 'completed' | 'confirmed';
  paymentStatus: 'Escrow Held' | 'Settled to Bank' | 'Pending Mandi Slip' | 'escrow_locked';
  date: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  paymentRef?: string;
  logisticsDetails?: {
    vehicleType: string;
    driverName: string;
    driverPhone: string;
    pickupScheduledAt: string;
    status: string;
  };
}

// negotiation history - preserves original offer, counter-offers, timestamps
export interface NegotiationRecord {
  id: string;
  lotId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  originalOffer: {
    pricePerQtl: number;
    quantityQtl: number;
    message: string;
  };
  counterOffers: CounterOfferRecord[];
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  lastUpdated: string;
}

export interface CounterOfferRecord {
  id: string;
  offerId: string;
  pricePerQtl: number;
  quantityQtl: number;
  message?: string;
  sender: 'farmer' | 'buyer';
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ScoringWeights {
  netRealizationWeight: number; // percentage, e.g., 45
  reliabilityWeight: number; // percentage, e.g., 25
  paymentSpeedWeight: number; // percentage, e.g., 15
  distanceConvenienceWeight: number; // percentage, e.g., 15
}

export interface AdminScoringWeights {
  netRealizationWeight: number; // default 0.45
  buyerReliabilityWeight: number; // default 0.25
  logisticsEfficiencyWeight: number; // default 0.15
  marketOpportunityWeight: number; // default 0.15
  riskPenaltyFactor: number; // default 0.10
}

export interface PlatformMetrics {
  totalFarmers: number;
  activeFarmers: number;
  newFarmersThisMonth: number;
  activeBuyers: number;
  buyerOffersCount: number;
  totalTransactionsCount: number;
  gmvTotalInr: number;
  platformRevenueInr: number;
  successfulTransactionRatePercent: number;
  activeAggregationGroups: number;
  totalAggregatedTonnes: number;
  avgFarmerIncomeGainPercent: number;
  unitEconomics: {
    cacInr: number;
    ltvInr: number;
    takeRatePercent: number;
    avgRevenuePerTransactionInr: number;
    contributionMarginPercent: number;
  };
}

export interface PriceTrendPoint {
  date: string;
  dayLabel: string;
  mandiPrice: number;
  buyerDirectPrice: number;
  mspPrice: number;
  arrivalVolumeTonnes: number;
}

export interface HistoricalPricePoint {
  date: string;
  mandiModalPrice: number;
  institutionalBuyerAvg: number;
  volumeQuintals: number;
}

export interface AiAdvisorResponse {
  summary: string;
  recommendedOption: string;
  explanation: string;
  keyFactors: string[];
  suggestedActions: string[];
}
