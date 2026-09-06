import { CropType, QualityGrade, ProduceLot, BuyerOffer, BuyerProfile } from '../types';
import { CROP_CONFIGS } from '../data/mockData';

/** Match factor contributing to the total match score */
export interface MatchFactor {
  name: string;
  score: number; // 0-100
  weight: number; // percentage contribution to total (e.g., 30 for 30%)
  description: string;
}

/**
 * Score a farmer's produce lot against a buyer's offer.
 * Returns a match score (0-100) and breakdown of contributing factors.
 */
export function scoreMatch(
  lot: ProduceLot,
  offer: BuyerOffer
): { totalScore: number; factors: MatchFactor[] } {
  const factors: MatchFactor[] = [];

  // 1. Commodity match (weight: 30%)
  const commodityMatch = lot.crop === offer.crop ? 100 : 0;
  factors.push({
    name: 'Commodity Match',
    score: commodityMatch,
    weight: 30,
    description: lot.crop === offer.crop
      ? 'Crop type matches buyer requirement'
      : 'Crop type does not match buyer requirement',
  });

  // 2. Quantity proximity (weight: 25%)
  const minQty = offer.minQuantityQtl;
  const maxQty = offer.maxQuantityQtl;
  const lotQtl = lot.quantityQuintals;
  let quantityScore = 0;

  if (lotQtl >= minQty && lotQtl <= maxQty) {
    // Exact fit within range
    quantityScore = 100;
    factors.push({
      name: 'Quantity Range',
      score: 100,
      weight: 25,
      description: `Lot quantity (${lotQtl} qtl) falls within buyer range (${minQty}-${maxQty} qtl)`,
    });
  } else if (lotQtl < minQty) {
    // Below minimum - partial match based on proportion
    const proportion = lotQtl / minQty;
    quantityScore = Math.round(proportion * 100);
    factors.push({
      name: 'Quantity Range',
      score: quantityScore,
      weight: 25,
      description: `Lot quantity (${lotQtl} qtl) is below minimum (${minQty} qtl). Proportion: ${proportion.toFixed(1)}`,
    });
  } else {
    // Above maximum - partial match based on proportion
    const proportion = maxQty / lotQtl;
    quantityScore = Math.round(proportion * 100);
    factors.push({
      name: 'Quantity Range',
      score: quantityScore,
      weight: 25,
      description: `Lot quantity (${lotQtl} qtl) exceeds maximum (${maxQty} qtl). Utilization: ${proportion.toFixed(1)}`,
    });
  }

  // 3. Location distance (weight: 20%)
  const distance = offer.distanceKm;
  let distanceScore = 100;

  if (distance <= 10) {
    distanceScore = 100;
  } else if (distance <= 25) {
    distanceScore = 80;
  } else if (distance <= 50) {
    distanceScore = 60;
  } else if (distance <= 100) {
    distanceScore = 30;
  } else {
    distanceScore = 10;
  }

  factors.push({
    name: 'Location Distance',
    score: distanceScore,
    weight: 20,
    description: `Buyer is ${distance} km away from farmer`,
  });

  // 4. Quality grade compatibility (weight: 15%)
  const gradePriority: QualityGrade[] = [
    'Grade A (Premium)',
    'Grade B (Fair/Avg)',
    'Grade C (Standard)',
  ];
  const lotGradeIndex = gradePriority.indexOf(lot.grade);
  const offerGradeIndex = gradePriority.indexOf(offer.requiredGrade);

  let qualityScore = 50; // default neutral
  if (lotGradeIndex !== -1 && offerGradeIndex !== -1) {
    if (lotGradeIndex <= offerGradeIndex) {
      // Lot quality meets or exceeds requirement
      const gradeDiff = offerGradeIndex - lotGradeIndex;
      qualityScore = 100 - gradeDiff * 20;
      if (qualityScore < 0) qualityScore = 0;
    } else {
      // Lot quality below requirement
      const gradeDiff = lotGradeIndex - offerGradeIndex;
      qualityScore = Math.max(0, 100 - gradeDiff * 15);
    }
  }

  factors.push({
    name: 'Quality Grade',
    score: qualityScore,
    weight: 15,
    description: `Lot grade: ${lot.grade}, Buyer requirement: ${offer.requiredGrade}`,
  });

  // 5. Price expectation alignment (weight: 10%)
  const lotAvgPrice = CROP_CONFIGS[lot.crop]?.avgModalPrice || 2500;
  const offerPrice = offer.offeredPricePerQtl;
  let priceScore = 50;

  if (offerPrice >= lotAvgPrice * 0.9 && offerPrice <= lotAvgPrice * 1.1) {
    // Offer is within 10% of modal price
    priceScore = 100;
  } else if (offerPrice < lotAvgPrice * 0.9) {
    // Offer below modal price
    const deficitPercent = ((lotAvgPrice - offerPrice) / lotAvgPrice) * 100;
    priceScore = Math.max(0, 100 - deficitPercent);
  } else {
    // Offer above modal price
    const premiumPercent = ((offerPrice - lotAvgPrice) / lotAvgPrice) * 100;
    priceScore = Math.min(100, 100 - premiumPercent * 0.5);
  }

  factors.push({
    name: 'Price Alignment',
    score: priceScore,
    weight: 10,
    description: `Offer ₹${offerPrice}/qtl vs modal ₹${lotAvgPrice}/qtl`,
  });

  // Calculate weighted total
  const totalScore = factors.reduce(
    (sum, factor) => sum + factor.score * (factor.weight / 100),
    0
  );

  return { totalScore: Math.round(totalScore), factors };
}

/**
 * Match a produce lot against multiple buyer offers.
 * Returns matched offers sorted by match score, with explanations.
 */
export function matchLotWithOffers(
  lot: ProduceLot,
  offers: BuyerOffer[],
  buyerProfiles: BuyerProfile[] = []
) {
  const matches = offers.map((offer) => {
    const { totalScore, factors } = scoreMatch(lot, offer);
    const buyerProfile = buyerProfiles.find((bp) => bp.id === offer.buyerId);

    return {
      offer,
      totalScore,
      factors,
      buyerInfo: buyerProfile
        ? {
            name: buyerProfile.companyName,
            category: buyerProfile.category,
            reliability: buyerProfile.reliabilityScore,
            distance: offer.distanceKm,
          }
        : null,
    };
  });

  // Sort by total score descending
  matches.sort((a, b) => b.totalScore - a.totalScore);

  return matches;
}

/**
 * Get matching explanation text for display in UI.
 */
export function getMatchExplanation(matches: ReturnType<typeof matchLotWithOffers>[0]): string {
  const topFactors = matches.factors
    .filter((f) => f.score > 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (topFactors.length === 0) {
    return 'This lot has limited matching factors with this buyer. Consider adjusting quantity, quality, or exploring other buyers.';
  }

  const descriptions = topFactors.map((f) => f.description);
  return descriptions.join('. ');
}

/** Default export with all matching functions */
export default {
  scoreMatch,
  matchLotWithOffers,
  getMatchExplanation,
};