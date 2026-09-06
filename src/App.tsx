import React, { useState } from 'react';
import { Plant } from '@phosphor-icons/react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { FarmerInputForm } from './components/FarmerInputForm';
import { RecommendationEngineView } from './components/RecommendationEngineView';
import { SellingOptionsCompare } from './components/SellingOptionsCompare';
import { AggregationModule } from './components/AggregationModule';
import { BuyerDashboard } from './components/BuyerDashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { MarketIntelligence } from './components/MarketIntelligence';
import { LogisticsModule } from './components/LogisticsModule';
import { AdminDashboard } from './components/AdminDashboard';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { TransactionModal } from './components/TransactionModal';

import {
  AppView,
  UserRole,
  Language,
  ProduceLot,
  CropType,
  RecommendationResult,
  SellingOptionBreakdown,
  TransactionRecord,
  ScoringWeights
} from './types';
import { computeSellingOptions } from './utils/calculator';
import { DEFAULT_SCORING_WEIGHTS, MOCK_TRANSACTIONS } from './data/mockData';

const DEFAULT_INITIAL_LOT: ProduceLot = {
  id: 'LOT-WHEAT-45Q',
  farmerId: 'farmer-001',
  farmerName: 'Devender Choudhary',
  farmerPhone: '+91 98290 12345',
  farmerVillage: 'Shahjahanpur',
  district: 'Alwar',
  state: 'Rajasthan',
  crop: 'Wheat',
  quantityQuintals: 45,
  quantityKg: 4500,
  grade: 'Grade A (Premium)',
  moisturePercent: 11.5,
  foreignMatterPercent: 0.8,
  harvestDate: new Date().toISOString().split('T')[0],
  storageAvailable: true,
  warehouseDistanceKm: 12,
  status: 'analyzed',
  createdAt: new Date().toISOString(),
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [language, setLanguage] = useState<Language>('en');

  const [currentLot, setCurrentLot] = useState<ProduceLot>(DEFAULT_INITIAL_LOT);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);
  const [recommendation, setRecommendation] = useState<RecommendationResult>(() =>
    computeSellingOptions(DEFAULT_INITIAL_LOT, DEFAULT_SCORING_WEIGHTS)
  );

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [selectedOptionForTxn, setSelectedOptionForTxn] = useState<SellingOptionBreakdown | null>(null);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(MOCK_TRANSACTIONS);
  const [negotiationRefreshKey, setNegotiationRefreshKey] = useState(0);

  const handleStartAnalysis = (crop: CropType = 'Wheat', quantityQtl: number = 45) => {
    const updatedLot: ProduceLot = {
      ...currentLot,
      crop,
      quantityQuintals: quantityQtl,
      quantityKg: quantityQtl * 100,
      moisturePercent: crop === 'Mustard' ? 8.5 : crop === 'Potato' ? 78 : 12,
    };
    setCurrentLot(updatedLot);
    setRecommendation(computeSellingOptions(updatedLot, scoringWeights));
    setCurrentView('input');
  };

  const handleLotSubmitted = (lot: ProduceLot) => {
    setCurrentLot(lot);
    setRecommendation(computeSellingOptions(lot, scoringWeights));
    setCurrentView('recommendation');
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'buyer') setCurrentView('buyer');
    else if (role === 'admin') setCurrentView('admin');
    else if (role === 'aggregator') setCurrentView('aggregation');
    else setCurrentView('farmer_dashboard');
  };

  const handleAcceptOption = (option: SellingOptionBreakdown) => {
    setSelectedOptionForTxn(option);
    setIsTxnModalOpen(true);
  };

  const handleConfirmTransaction = (record: TransactionRecord) => {
    setTransactions([record, ...transactions]);
  };

  const handleUpdateWeights = (newWeights: ScoringWeights) => {
    setScoringWeights(newWeights);
    setRecommendation(computeSellingOptions(currentLot, newWeights));
  };

  const readApiError = async (response: Response, fallback: string) => {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    return payload?.error || fallback;
  };

  const handleInitiateNegotiation = async (
    lot: ProduceLot,
    buyerId: string,
    buyerName: string,
    offeredPrice = lot.minAcceptablePricePerQtl || recommendation.recommendedOption.pricePerQtl,
    quantity = lot.quantityQuintals,
  ) => {
    const response = await fetch('/api/negotiations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lotId: lot.id,
        farmerId: lot.farmerId,
        farmerName: lot.farmerName,
        buyerId,
        buyerName,
        offeredPrice,
        quantity,
      }),
    });
    if (!response.ok) throw new Error(await readApiError(response, 'Could not start this negotiation.'));
    setNegotiationRefreshKey((key) => key + 1);
    setCurrentView('farmer_dashboard');
  };

  const handleMakeCounterOffer = async (negId: string, price: number, message: string, sender: 'farmer' | 'buyer' = 'buyer') => {
    const response = await fetch(`/api/negotiations/${negId}/counter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePerQtl: price, message, sender }),
    });
    if (!response.ok) throw new Error(await readApiError(response, 'Could not submit the counter-offer.'));
    setNegotiationRefreshKey((key) => key + 1);
  };

  const handleAcceptOffer = async (negId: string) => {
    const response = await fetch(`/api/negotiations/${negId}/accept`, { method: 'POST' });
    if (!response.ok) throw new Error(await readApiError(response, 'Could not accept the offer.'));
    const data = await response.json();
    const session = data.session;
    const quantityQtl = data.finalOffer?.quantityQtl || session.originalOffer?.quantityQtl || currentLot.quantityQuintals;
    const agreedPricePerQtl = data.finalOffer?.pricePerQtl || session.originalOffer?.pricePerQtl || 0;
    const txnRecord: TransactionRecord = {
      id: `TXN-${Date.now()}`,
      lotId: session.lotId,
      farmerId: session.farmerId,
      farmerName: session.farmerName,
      buyerOrEntityName: session.buyerName,
      optionType: 'Direct Buyer',
      crop: currentLot.crop,
      quantityQtl,
      agreedPricePerQtl,
      totalGrossValue: agreedPricePerQtl * quantityQtl,
      deductionsAmount: 0,
      netPayableToFarmer: agreedPricePerQtl * quantityQtl,
      status: 'confirmed',
      paymentStatus: 'Escrow Held',
      date: new Date().toISOString(),
    };
    handleConfirmTransaction(txnRecord);
    setNegotiationRefreshKey((key) => key + 1);
    setCurrentView('farmer_dashboard');
  };

  const handleRejectOffer = async (negId: string) => {
    const response = await fetch(`/api/negotiations/${negId}/reject`, { method: 'POST' });
    if (!response.ok) throw new Error(await readApiError(response, 'Could not close the negotiation.'));
    setNegotiationRefreshKey((key) => key + 1);
    setCurrentView('farmer_dashboard');
  };

  const navigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F5F9] font-sans text-[#0F172A] antialiased">
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageToggle={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
        onStartNewAnalysis={() => handleStartAnalysis('Wheat', 45)}
      />

      <main className="flex-1 pb-20 pt-2">
        {currentView === 'landing' && (
          <LandingHero
            language={language}
            onStartAnalysis={handleStartAnalysis}
            onNavigateToBuyer={() => {
              setUserRole('buyer');
              setCurrentView('buyer');
            }}
            onNavigateToAggregation={() => {
              setUserRole('aggregator');
              setCurrentView('aggregation');
            }}
          />
        )}
        {currentView === 'input' && (
          <FarmerInputForm
            language={language}
            initialCrop={currentLot.crop}
            initialQuantity={currentLot.quantityQuintals}
            onSubmit={handleLotSubmitted}
          />
        )}
        {currentView === 'recommendation' && (
          <RecommendationEngineView
            language={language}
            lot={currentLot}
            recommendation={recommendation}
            onAcceptOption={handleAcceptOption}
            onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
            onOpenComparison={() => setCurrentView('compare')}
            onEditLot={() => setCurrentView('input')}
          />
        )}
        {currentView === 'compare' && (
          <SellingOptionsCompare
            language={language}
            lot={currentLot}
            recommendation={recommendation}
            onAcceptOption={handleAcceptOption}
            onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
            onBack={() => setCurrentView('recommendation')}
          />
        )}
        {currentView === 'farmer_dashboard' && (
          <FarmerDashboard
            language={language}
            currentLot={currentLot}
            recommendation={recommendation}
            transactions={transactions}
            onAddNewProduce={() => setCurrentView('input')}
            onViewRecommendation={() => setCurrentView('recommendation')}
            onViewOption={() => setCurrentView('recommendation')}
            onViewTransaction={() => {
              setSelectedOptionForTxn(recommendation.recommendedOption);
              setIsTxnModalOpen(true);
            }}
            onInitiateNegotiation={handleInitiateNegotiation}
            negotiationRefreshKey={negotiationRefreshKey}
            onMakeCounterOffer={(negId, price, message) => handleMakeCounterOffer(negId, price, message, 'farmer')}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
          />
        )}
        {currentView === 'aggregation' && (
          <AggregationModule
            language={language}
            currentLot={currentLot}
            onJoinPool={() => setCurrentView('farmer_dashboard')}
            onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
          />
        )}
        {currentView === 'buyer' && (
          <BuyerDashboard
            language={language}
            activeLot={currentLot}
            onInitiateBidOnLot={(_lot, price) => {
              alert(`Bid of ₹${price}/qtl recorded for ${_lot.farmerName}'s ${_lot.crop} lot.`);
            }}
            onInitiateNegotiation={handleInitiateNegotiation}
            onMakeCounterOffer={(negId, price, message) => handleMakeCounterOffer(negId, price, message, 'buyer')}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            negotiationRefreshKey={negotiationRefreshKey}
          />
        )}
        {currentView === 'trends' && (
          <MarketIntelligence
            language={language}
            onSelectCropForAnalysis={(crop) => handleStartAnalysis(crop, 45)}
            onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
          />
        )}
        {currentView === 'logistics' && <LogisticsModule language={language} />}
        {currentView === 'admin' && (
          <AdminDashboard
            language={language}
            scoringWeights={scoringWeights}
            onUpdateWeights={handleUpdateWeights}
          />
        )}
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#047857] text-white">
              <Plant size={15} weight="fill" />
            </span>
            <div className="min-w-0 leading-relaxed">
              <p className="text-[13px] font-bold tracking-tight">FASALNITI</p>
              <p className="mt-0.5 max-w-[52ch] text-[12px] leading-relaxed break-words text-[#64748B]">
                {language === 'en' ? "Don't just know the price. Know the best way to sell." : 'सिर्फ भाव नहीं, बेचने का सही तरीका जानें।'}
              </p>
            </div>
          </div>
          <p className="font-mono-num text-[11px] uppercase leading-relaxed tracking-[0.14em] break-words text-[#94A3B8] sm:text-right">
            Net realization · Buyer · Mandi · Pool · Store
          </p>
        </div>
      </footer>

      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        language={language}
        lot={currentLot}
        recommendation={recommendation}
      />

      {isTxnModalOpen && selectedOptionForTxn && (
        <TransactionModal
          isOpen={isTxnModalOpen}
          onClose={() => setIsTxnModalOpen(false)}
          language={language}
          lot={currentLot}
          option={selectedOptionForTxn}
          onConfirmTransaction={handleConfirmTransaction}
        />
      )}
    </div>
  );
}
