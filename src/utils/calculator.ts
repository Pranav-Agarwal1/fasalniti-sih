import { 
  ProduceLot, 
  CropType, 
  SellingOptionBreakdown, 
  RecommendationResult, 
  TransportQuote 
} from '../types';
import { 
  CROP_CONFIGS, 
  MOCK_BUYER_OFFERS, 
  MOCK_MANDIS, 
  MOCK_STORAGE_OPTIONS, 
  MOCK_AGGREGATION_GROUPS 
} from '../data/mockData';

const DEFAULT_ADMIN_WEIGHTS = {
  netRealizationWeight: 0.45,
  buyerReliabilityWeight: 0.25,
  logisticsEfficiencyWeight: 0.15,
  marketOpportunityWeight: 0.15,
  riskPenaltyFactor: 0.10,
};

function resolveWeights(rawWeights: any): typeof DEFAULT_ADMIN_WEIGHTS {
  const isPercentageFormat = rawWeights.netRealizationWeight > 1;
  if (isPercentageFormat) {
    return {
      netRealizationWeight: rawWeights.netRealizationWeight / 100,
      buyerReliabilityWeight: (rawWeights.buyerReliabilityWeight || 25) / 100,
      logisticsEfficiencyWeight: (rawWeights.logisticsEfficiencyWeight || 15) / 100,
      marketOpportunityWeight: (rawWeights.marketOpportunityWeight || 15) / 100,
      riskPenaltyFactor: 0.10,
    };
  }
  return {
    netRealizationWeight: rawWeights.netRealizationWeight || 0.45,
    buyerReliabilityWeight: (rawWeights.buyerReliabilityWeight || 0.25),
    logisticsEfficiencyWeight: (rawWeights.logisticsEfficiencyWeight || 0.15),
    marketOpportunityWeight: (rawWeights.marketOpportunityWeight || 0.15),
    riskPenaltyFactor: rawWeights.riskPenaltyFactor ?? 0.10,
  };
}

// Calculate realistic vehicle logistics cost
export function calculateLogisticsCost(
  quantityQtl: number,
  distanceKm: number,
  crop: CropType,
  isPooled: boolean = false
): TransportQuote {
  const quantityTonnes = quantityQtl / 10;
  
  let vehicleType: TransportQuote['vehicleType'] = 'Pickup (1.5T)';
  let capacityTonnes = 1.5;
  let ratePerKm = 22;
  let baseLoadingCharge = 450;

  if (isPooled || quantityTonnes > 9) {
    vehicleType = 'Multi-Axle (16T)';
    capacityTonnes = 16.0;
    ratePerKm = 52;
    baseLoadingCharge = 1200;
  } else if (quantityTonnes > 3) {
    vehicleType = 'Medium LCV (9T)';
    capacityTonnes = 9.0;
    ratePerKm = 36;
    baseLoadingCharge = 850;
  } else if (quantityTonnes > 1.5) {
    vehicleType = 'Mini Truck (3T)';
    capacityTonnes = 3.0;
    ratePerKm = 28;
    baseLoadingCharge = 600;
  }

  const tollEstimate = Math.max(0, Math.floor(distanceKm / 40) * 120);
  
  let totalCost: number;
  if (isPooled) {
    const totalTripCost = (ratePerKm * distanceKm) + baseLoadingCharge + tollEstimate;
    const shareRatio = Math.min(1, quantityTonnes / 12);
    totalCost = Math.round(totalTripCost * shareRatio);
  } else {
    totalCost = Math.round((ratePerKm * distanceKm) + baseLoadingCharge + tollEstimate);
  }

  const totalKg = quantityQtl * 100;
  const costPerKg = Number((totalCost / Math.max(1, totalKg)).toFixed(2));
  const costPerQtl = Math.round(costPerKg * 100);

  return {
    vehicleType,
    capacityTonnes,
    ratePerKm,
    baseLoadingCharge,
    tollEstimate,
    totalCost,
    costPerKg,
    costPerQtl,
  };
}

// Net Realization Calculation Engine
// Government price data is optional - when not provided, system uses calculated estimates and mock data as fallback
export function computeSellingOptions(
  lot: ProduceLot,
  rawWeights: any = DEFAULT_ADMIN_WEIGHTS,
  governmentMandiPrice?: { modalPricePerQtl: number; source: string; sourceDate: string | null },
  governmentHistoricalPrices?: { date: string; modalPricePerQtl: number; source: string }[]
): RecommendationResult {
  const weights = resolveWeights(rawWeights);
  const cropConfig = CROP_CONFIGS[lot.crop] || CROP_CONFIGS['Wheat'];
  const qtyQtl = lot.quantityQuintals;
  const qtyKg = qtyQtl * 100;

  // Quality / Moisture penalty adjustment
  const excessMoisture = Math.max(0, lot.moisturePercent - cropConfig.standardMoisture);
  const moistureDiscountRate = excessMoisture * 0.012;

  // Determine effective mandi price with source tracking
  let effectiveMandiPrice = cropConfig.avgModalPrice; // fallback to config
  let effectiveMandiSource: { source: string; date: string | null } = { source: 'calculated', date: null };

  if (governmentMandiPrice && governmentMandiPrice.modalPricePerQtl != null) {
    effectiveMandiPrice = governmentMandiPrice.modalPricePerQtl;
    effectiveMandiSource = { source: governmentMandiPrice.source, date: governmentMandiPrice.sourceDate };
  } else if (MOCK_MANDIS[0]?.id !== 'MOCK_DATA_MARKER') {
    // Use mock mandi data only if explicitly marked
    effectiveMandiPrice = MOCK_MANDIS.find(m => m.crop === lot.crop)?.modalPricePerQtl || cropConfig.avgModalPrice;
    effectiveMandiSource = { source: 'mock', date: null };
  }

  // Determine effective buyer price source
  let buyerSource: { source: string } = { source: 'calculated' };

  // 1. OPTION 1: DIRECT BUYER
  const matchingOffers = MOCK_BUYER_OFFERS.filter(o => o.crop === lot.crop);
  const bestBuyerOffer = matchingOffers[0] || {
    id: 'generic-buyer',
    buyerId: 'buyer-abc',
    buyerName: 'ABC Agro Foods Ltd',
    buyerCategory: 'Food Processor',
    buyerLocation: 'Nearby Industrial Hub (20 km)',
    distanceKm: 20,
    crop: lot.crop,
    minQuantityQtl: 10,
    maxQuantityQtl: 300,
    offeredPricePerQtl: Math.round(cropConfig.avgModalPrice * 1.02),
    requiredGrade: lot.grade,
    paymentTerms: 'Next Day (T+1)',
    reliabilityScore: 96,
    offerValidUntil: '2026-08-30',
  };

  const buyerGross = bestBuyerOffer.offeredPricePerQtl * qtyQtl;
  const buyerTransport = calculateLogisticsCost(qtyQtl, bestBuyerOffer.distanceKm, lot.crop, false).totalCost;
  const buyerHandling = Math.round(qtyQtl * 12);
  const buyerQualityDeduction = Math.round(buyerGross * moistureDiscountRate);
  const buyerTotalDeductions = buyerTransport + buyerHandling + buyerQualityDeduction;
  const buyerNet = Math.max(0, buyerGross - buyerTotalDeductions);
  const buyerNetPerQtl = Math.round(buyerNet / qtyQtl);

  const buyerScore = Math.min(100, Math.round(
    (buyerNet / (cropConfig.avgModalPrice * qtyQtl)) * 50 * weights.netRealizationWeight +
    (bestBuyerOffer.reliabilityScore * weights.buyerReliabilityWeight) +
    (88 * weights.logisticsEfficiencyWeight) +
    (80 * weights.marketOpportunityWeight) -
    (5 * weights.riskPenaltyFactor)
  ));

  const optionBuyer: SellingOptionBreakdown = {
    optionId: 'buyer',
    optionType: 'Direct Buyer',
    title: `Sell to ${bestBuyerOffer.buyerName}`,
    subtitle: `${bestBuyerOffer.buyerCategory} • ${bestBuyerOffer.distanceKm} km away • ${bestBuyerOffer.paymentTerms}`,
    grossSaleValue: buyerGross,
    pricePerQtl: bestBuyerOffer.offeredPricePerQtl,
    deductions: {
      transportCost: buyerTransport,
      storageCost: 0,
      handlingCost: buyerHandling,
      mandiCessOrPlatformFee: 0,
      qualityRiskAdjustment: buyerQualityDeduction,
      totalDeductions: buyerTotalDeductions,
    },
    netRealization: buyerNet,
    netRealizationPerQtl: buyerNetPerQtl,
    realizationPercent: Number(((buyerNet / buyerGross) * 100).toFixed(1)),
    reliabilityScore: bestBuyerOffer.reliabilityScore,
    logisticsEfficiencyScore: 88,
    riskFactor: 5,
    recommendationScore: buyerScore,
    paymentTimeline: bestBuyerOffer.paymentTerms,
    keyBenefits: [
      `Direct farmgate pickup saves ₹${Math.round(buyerTransport * 0.4)} in local transit`,
      'Zero Mandi Cess / Tax deduction (Saves ~1.6%)',
      `${bestBuyerOffer.paymentTerms} settlement with 96% buyer reliability`,
      'Digital weighbridge receipt with instant confirmation',
    ],
    keyRisks: [
      'Moisture deduction applied if above standard limit',
      'Strict quality grading on delivery inspection',
    ],
    entityDetails: {
      name: bestBuyerOffer.buyerName,
      distanceKm: bestBuyerOffer.distanceKm,
      location: bestBuyerOffer.buyerLocation,
    },
  };

  // 2. OPTION 2: APMC MANDI AUCTION
  const matchingMandi = governmentMandiPrice && governmentMandiPrice.modalPricePerQtl != null
  ? {
      id: 'gov-mandi',
      mandiName: 'Government Recorded Mandi',
      district: lot.district || 'Alwar',
      state: lot.state || 'Rajasthan',
      distanceKm: 32,
      crop: lot.crop,
      modalPricePerQtl: governmentMandiPrice.modalPricePerQtl,
      minPricePerQtl: governmentMandiPrice.modalPricePerQtl * 0.95,
      maxPricePerQtl: governmentMandiPrice.modalPricePerQtl * 1.05,
      dailyArrivalTonnes: 520,
      trend: 'stable',
      cessPercent: 1.6,
      handlingChargePerQtl: 28,
      lastUpdated: governmentMandiPrice.sourceDate || 'Today 09:00 AM',
    }
  : (MOCK_MANDIS.find(m => m.crop === lot.crop) || {
      id: 'mandi-generic',
      mandiName: `${lot.district || 'Regional'} APMC Mandi`,
      district: lot.district || 'Alwar',
      state: lot.state || 'Rajasthan',
      distanceKm: 32,
      crop: lot.crop,
      modalPricePerQtl: Math.round(cropConfig.avgModalPrice * 1.04),
      minPricePerQtl: cropConfig.avgModalPrice,
      maxPricePerQtl: Math.round(cropConfig.avgModalPrice * 1.08),
      dailyArrivalTonnes: 520,
      trend: 'up',
      cessPercent: 1.6,
      handlingChargePerQtl: 28,
      lastUpdated: 'Today 09:00 AM',
    });

  const mandiGross = matchingMandi.modalPricePerQtl * qtyQtl;
  const mandiTransport = calculateLogisticsCost(qtyQtl, matchingMandi.distanceKm, lot.crop, false).totalCost;
  const mandiHandling = Math.round(qtyQtl * matchingMandi.handlingChargePerQtl);
  const mandiCess = Math.round(mandiGross * (matchingMandi.cessPercent / 100));
  const mandiQualityDeduction = Math.round(mandiGross * (moistureDiscountRate + 0.015));
  const mandiTotalDeductions = mandiTransport + mandiHandling + mandiCess + mandiQualityDeduction;
  const mandiNet = Math.max(0, mandiGross - mandiTotalDeductions);
  const mandiNetPerQtl = Math.round(mandiNet / qtyQtl);

  const mandiScore = Math.min(100, Math.round(
    (mandiNet / (cropConfig.avgModalPrice * qtyQtl)) * 50 * weights.netRealizationWeight +
    (75 * weights.buyerReliabilityWeight) +
    (65 * weights.logisticsEfficiencyWeight) +
    (70 * weights.marketOpportunityWeight) -
    (20 * weights.riskPenaltyFactor)
  ));

  const optionMandi: SellingOptionBreakdown = {
    optionId: 'mandi',
    optionType: 'APMC Mandi',
    title: `Auction at ${matchingMandi.mandiName}`,
    subtitle: `${matchingMandi.distanceKm} km away • Open Auction • Daily arrival ${matchingMandi.dailyArrivalTonnes}T`,
    grossSaleValue: mandiGross,
    pricePerQtl: matchingMandi.modalPricePerQtl,
    deductions: {
      transportCost: mandiTransport,
      storageCost: 0,
      handlingCost: mandiHandling,
      mandiCessOrPlatformFee: mandiCess,
      qualityRiskAdjustment: mandiQualityDeduction,
      totalDeductions: mandiTotalDeductions,
    },
    netRealization: mandiNet,
    netRealizationPerQtl: mandiNetPerQtl,
    realizationPercent: Number(((mandiNet / mandiGross) * 100).toFixed(1)),
    reliabilityScore: 75,
    logisticsEfficiencyScore: 65,
    riskFactor: 20,
    recommendationScore: mandiScore,
    paymentTimeline: '3-7 Days (Arhatiya / Commission Agent Slip)',
    keyBenefits: [
      'Visible headline auction price can spike on high demand days',
      'Immediate physical unloading at yard',
    ],
    keyRisks: [
      `High cumulative deductions: ₹${mandiHandling} hamali + ₹${mandiCess} mandi cess`,
      'Long waiting queue at yard gate (6-12 hours)',
      'Price volatility risk during open bidding down-rounds',
      'Delayed payment settlement by middleman / commission agent',
    ],
    entityDetails: {
      name: matchingMandi.mandiName,
      distanceKm: matchingMandi.distanceKm,
      location: `${matchingMandi.district}, ${matchingMandi.state}`,
    },
  };

  // 3. OPTION 3: FARMER AGGREGATION (FPO / CLUSTER POOL)
  const pool = MOCK_AGGREGATION_GROUPS.find(g => g.crop === lot.crop) || MOCK_AGGREGATION_GROUPS[0];
  const unlockedPrice = Math.round(cropConfig.avgModalPrice * 1.055);
  const aggGross = unlockedPrice * qtyQtl;
  const aggTransport = calculateLogisticsCost(qtyQtl, 24, lot.crop, true).totalCost;
  const aggHandling = Math.round(qtyQtl * 10);
  const aggQualityDeduction = Math.round(aggGross * (moistureDiscountRate * 0.8));
  const aggTotalDeductions = aggTransport + aggHandling + aggQualityDeduction;
  const aggNet = Math.max(0, aggGross - aggTotalDeductions);
  const aggNetPerQtl = Math.round(aggNet / qtyQtl);

  const aggScore = Math.min(100, Math.round(
    (aggNet / (cropConfig.avgModalPrice * qtyQtl)) * 50 * weights.netRealizationWeight +
    (92 * weights.buyerReliabilityWeight) +
    (95 * weights.logisticsEfficiencyWeight) +
    (90 * weights.marketOpportunityWeight) -
    (8 * weights.riskPenaltyFactor)
  ));

  const optionAggregation: SellingOptionBreakdown = {
    optionId: 'aggregation',
    optionType: 'Farmer Aggregation',
    title: `Aggregate with ${pool.clusterName}`,
    subtitle: `Combine with ${pool.participants.length} farmers • Target 10T Bulk Institutional Lot`,
    grossSaleValue: aggGross,
    pricePerQtl: unlockedPrice,
    deductions: {
      transportCost: aggTransport,
      storageCost: 0,
      handlingCost: aggHandling,
      mandiCessOrPlatformFee: 0,
      qualityRiskAdjustment: aggQualityDeduction,
      totalDeductions: aggTotalDeductions,
    },
    netRealization: aggNet,
    netRealizationPerQtl: aggNetPerQtl,
    realizationPercent: Number(((aggNet / aggGross) * 100).toFixed(1)),
    reliabilityScore: 92,
    logisticsEfficiencyScore: 95,
    riskFactor: 8,
    recommendationScore: aggScore,
    paymentTimeline: 'T+2 via FPO Escrow Account',
    keyBenefits: [
      `Saves ₹${Math.round(matchingMandi?.modalPricePerQtl * qtyQtl / 100 * 0.45)} on freight via shared 16-tonne truck`,
      `Unlocks ₹${unlockedPrice - cropConfig.avgModalPrice}/qtl bulk premium from institutional mills`,
      'Fair digital batch quality testing & transparent weight slips',
    ],
    keyRisks: [
      `Requires waiting ${pool.daysLeftToLock} days for full pool lot lock`,
      'Batch uniformity requirements across participating farmers',
    ],
    entityDetails: {
      name: pool.targetBuyerName,
      distanceKm: 24,
      location: pool.district,
    },
  };

  // 4. OPTION 4: STORE & SELL LATER (WAREHOUSE / COLD STORAGE)
  const storageFacility = MOCK_STORAGE_OPTIONS[0];
  const holdingDays = cropConfig.perishable ? 25 : 45;
  const expectedPriceRisePercent = cropConfig.perishable ? 0.09 : 0.07;
  const expectedFuturePricePerQtl = Math.round(cropConfig.avgModalPrice * (1 + expectedPriceRisePercent));
  const storageGross = expectedFuturePricePerQtl * qtyQtl;
  
  const storageRent = Math.round((storageFacility.monthlyRentPerQtl * (holdingDays / 30)) * qtyQtl);
  const storageHandling = Math.round(storageFacility.handlingChargePerQtl * qtyQtl);
  const storageTransport = calculateLogisticsCost(qtyQtl, storageFacility.distanceKm, lot.crop, false).totalCost * 1.5;
  const storageShrinkageLoss = Math.round(storageGross * (storageFacility.shrinkageLossRatePercent / 100));
  const financeHoldingCost = Math.round(storageGross * ((storageFacility.holdingCostRateAnnualPercent / 100) * (holdingDays / 365)));
  
  const storageTotalDeductions = storageRent + storageHandling + storageTransport + storageShrinkageLoss + financeHoldingCost;
  const storageNet = Math.max(0, storageGross - storageTotalDeductions);
  const storageNetPerQtl = Math.round(storageNet / qtyQtl);

  const storageScore = Math.min(100, Math.round(
    (storageNet / (cropConfig.avgModalPrice * qtyQtl)) * 50 * weights.netRealizationWeight +
    (85 * weights.buyerReliabilityWeight) +
    (60 * weights.logisticsEfficiencyWeight) +
    (85 * weights.marketOpportunityWeight) -
    (25 * weights.riskPenaltyFactor)
  ));

  const optionStorage: SellingOptionBreakdown = {
    optionId: 'storage',
    optionType: 'Store & Sell Later',
    title: `Store for ${holdingDays} Days at ${storageFacility.facilityName}`,
    subtitle: `WDRA Certified Silo • Estimated future price ₹${expectedFuturePricePerQtl}/qtl`,
    grossSaleValue: storageGross,
    pricePerQtl: expectedFuturePricePerQtl,
    deductions: {
      transportCost: storageTransport,
      storageCost: storageRent + financeHoldingCost,
      handlingCost: storageHandling,
      mandiCessOrPlatformFee: 0,
      qualityRiskAdjustment: storageShrinkageLoss,
      totalDeductions: storageTotalDeductions,
    },
    netRealization: storageNet,
    netRealizationPerQtl: storageNetPerQtl,
    realizationPercent: Number(((storageNet / storageGross) * 100).toFixed(1)),
    reliabilityScore: 85,
    logisticsEfficiencyScore: 60,
    riskFactor: 25,
    recommendationScore: storageScore,
    paymentTimeline: 'After Sale upon Warehouse Receipt Liquidation',
    keyBenefits: [
      `Captures projected off-season price rise (+₹${expectedFuturePricePerQtl - cropConfig.avgModalPrice}/qtl)`,
      'Eligible for e-NWR Warehouse Receipt Bank Loan (up to 70% value)',
    ],
    keyRisks: [
      'Future price estimates are statistical forecasts, not guarantees',
      `Accumulating storage rent (₹${storageRent}) + shrinkage loss (₹${storageShrinkageLoss})`,
      'Delayed cash flow liquidity for next sowing cycle',
    ],
    futureProjection: {
      holdingDays,
      expectedFuturePricePerQtl,
      isForecastNotice: true,
    },
  };

  // Compile all options and sort by Recommendation Score
  const allOptions = [optionBuyer, optionMandi, optionAggregation, optionStorage]
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  const recommendedOption = allOptions[0];
  const netAdvantageOverMandi = Math.max(0, recommendedOption.netRealization - optionMandi.netRealization);
  const netAdvantagePercent = Number(((netAdvantageOverMandi / Math.max(1, optionMandi.netRealization)) * 100).toFixed(1));

  // Generate trusted, nuanced explanation in English and Hindi
  const explanationEn = `${recommendedOption.title} is recommended as it maximizes your expected net realization at ₹${recommendedOption.netRealization.toLocaleString('en-IN')} (₹${recommendedOption.netRealizationPerQtl}/qtl). Although ${optionMandi.title} shows a visible headline price of ₹${optionMandi.pricePerQtl}/qtl, mandi deductions (₹${mandiTransport} freight + ₹${mandiHandling} hamali + ₹${mandiCess} cess) reduce your take-home pay by ₹${netAdvantageOverMandi.toLocaleString('en-IN')}. ${recommendedOption.title} delivers ${recommendedOption.paymentTimeline} with ${recommendedOption.reliabilityScore}% reliability score.`;

  const explanationHi = `${recommendedOption.title} की सिफारिश की जाती है क्योंकि यह आपको बैंक खाते में सर्वाधिक ₹${recommendedOption.netRealization.toLocaleString('en-IN')} (₹${recommendedOption.netRealizationPerQtl}/क्विंटल) की शुद्ध प्राप्ति (Net Realization) दिलाता है। यद्यपि मंडी में दिखने वाला भाव ₹${optionMandi.pricePerQtl}/क्विंटल है, लेकिन मंडी के भारी खर्चे (₹${mandiTransport} भाड़ा + ₹${mandiHandling} पल्लेदारी + ₹${mandiCess} मंडी टैक्स) आपकी कमाई में से ₹${netAdvantageOverMandi.toLocaleString('en-IN')} काट लेते हैं। यह विकल्प ${recommendedOption.paymentTimeline} व ${recommendedOption.reliabilityScore}% विश्वसनीयता के साथ सुरक्षित है।`;

  return {
    lotId: lot.id,
    crop: lot.crop,
    quantityQuintals: qtyQtl,
    generatedAt: new Date().toISOString(),
    recommendedOption,
    allOptions,
    recommendationExplanation: {
      en: explanationEn,
      hi: explanationHi,
    },
    netAdvantageOverMandi,
    netAdvantagePercent,
    dataSources: {
      mandiPrice: effectiveMandiSource,
      buyerPrice: buyerSource,
      historicalPrices: (governmentHistoricalPrices || [])
        .filter(p => p.source !== 'mock')
        .map(p => ({ date: p.date, source: p.source })),
    },
  };
}