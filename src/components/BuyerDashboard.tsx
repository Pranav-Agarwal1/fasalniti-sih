import React, { useCallback, useEffect, useState } from 'react';
import { Plus, ShieldCheck, Buildings } from '@phosphor-icons/react';
import { BuyerProfile, BuyerOffer, CropType, QualityGrade, Language, ProduceLot, NegotiationRecord } from '../types';
import { MOCK_BUYERS, MOCK_BUYER_OFFERS } from '../data/mockData';
import { fetchNegotiation } from '../services/negotiationService';
import { Container, Reveal, Badge, PageHead, ModalShell, FieldLabel, inr } from './ui';
import { NegotiationPanel } from './NegotiationPanel';

interface BuyerDashboardProps {
  language: Language;
  activeLot?: ProduceLot;
  onInitiateBidOnLot?: (lot: ProduceLot, pricePerQtl: number) => void;
  onInitiateNegotiation?: (lot: ProduceLot, buyerId: string, buyerName: string, offeredPrice: number, quantity: number) => Promise<void> | void;
  onMakeCounterOffer?: (negId: string, price: number, message: string) => Promise<void> | void;
  onAcceptOffer?: (negId: string) => Promise<void> | void;
  onRejectOffer?: (negId: string) => Promise<void> | void;
  negotiationRefreshKey?: number;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  language, activeLot, onInitiateBidOnLot, onInitiateNegotiation,
  onMakeCounterOffer, onAcceptOffer, onRejectOffer, negotiationRefreshKey,
}) => {
  const en = language === 'en';
  const [currentBuyer, setCurrentBuyer] = useState<BuyerProfile>(MOCK_BUYERS[0]);
  const [offers, setOffers] = useState<BuyerOffer[]>(MOCK_BUYER_OFFERS);
  const [showNew, setShowNew] = useState(false);
  const [bidPrice, setBidPrice] = useState<number>(activeLot ? 2450 : 2450);

  const [newCrop, setNewCrop] = useState<CropType>('Wheat');
  const [newPrice, setNewPrice] = useState(2480);
  const [newMin, setNewMin] = useState(20);
  const [newMax, setNewMax] = useState(250);
  const [newGrade, setNewGrade] = useState<QualityGrade>('Grade A (Premium)');
  const [startingNegotiation, setStartingNegotiation] = useState(false);
  const [negotiationStartError, setNegotiationStartError] = useState<string | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationRecord | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const [negotiationError, setNegotiationError] = useState<string | null>(null);

  const loadNegotiation = useCallback(async () => {
    if (!activeLot) {
      setNegotiation(null);
      setNegotiationLoading(false);
      setNegotiationError(null);
      return;
    }
    setNegotiationLoading(true);
    setNegotiationError(null);
    try {
      setNegotiation(await fetchNegotiation(activeLot.id));
    } catch (error) {
      setNegotiationError(error instanceof Error ? error.message : (en ? 'Unable to load this thread.' : 'बातचीत लोड नहीं हो सकी।'));
    } finally {
      setNegotiationLoading(false);
    }
  }, [activeLot, en]);

  useEffect(() => {
    void loadNegotiation();
  }, [loadNegotiation, negotiationRefreshKey]);

  const handleOpenNegotiation = async () => {
    if (!activeLot || !onInitiateNegotiation || startingNegotiation) return;
    setStartingNegotiation(true);
    setNegotiationStartError(null);
    try {
      await onInitiateNegotiation(activeLot, currentBuyer.id, currentBuyer.companyName, bidPrice, activeLot.quantityQuintals);
    } catch (error) {
      setNegotiationStartError(error instanceof Error ? error.message : (en ? 'Could not open this thread.' : 'बातचीत शुरू नहीं हो सकी।'));
    } finally {
      setStartingNegotiation(false);
    }
  };

  const createOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const created: BuyerOffer = {
      id: `offer-${Date.now()}`, buyerId: currentBuyer.id, buyerName: currentBuyer.companyName,
      buyerCategory: currentBuyer.category, buyerLocation: `${currentBuyer.district} Hub`,
      distanceKm: 22, crop: newCrop, minQuantityQtl: Number(newMin), maxQuantityQtl: Number(newMax),
      offeredPricePerQtl: Number(newPrice), requiredGrade: newGrade,
      paymentTerms: 'Next Day (T+1)', reliabilityScore: currentBuyer.reliabilityScore,
      offerValidUntil: new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0],
    };
    setOffers([created, ...offers]);
    setShowNew(false);
  };

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Buyer desk' : 'खरीदार डेस्क'}
        title={en ? 'Procure verified lots.' : 'सत्यापित लॉट खरीदें।'}
        lede="Post demand, bid on live farmer lots, and settle through escrow with full reliability history."
        right={
          <button onClick={() => setShowNew(true)} className="btn-ink inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-normal break-words px-4 py-2.5 text-[13px] min-[480px]:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
            <Plus size={15} weight="bold" /> {en ? 'Post demand' : 'मांग दर्ज करें'}
          </button>
        }
      />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="card-flat h-full p-6 sm:p-8">
            <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] break-words text-[#64748B]">{en ? 'Acting as' : 'खरीदार'}</p>
            <div className="mt-3 space-y-2.5">
              {MOCK_BUYERS.slice(0, 3).map((b) => (
                <button key={b.id} onClick={() => setCurrentBuyer(b)}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-[8px] border px-4 py-3 text-left break-words transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${currentBuyer.id === b.id ? 'border-[#047857] bg-[#F8FAFC]' : 'border-[#E2E8F0] hover:border-[#047857]'}`}>
                  <span className="min-w-0 flex-1">
                    <span className="block whitespace-normal break-words text-[13.5px] font-bold leading-snug">{b.companyName}</span>
                    <span className="mt-0.5 block whitespace-normal break-words text-[11.5px] leading-relaxed text-[#64748B]">{b.category} · {b.district}</span>
                  </span>
                  <span className="font-mono-num tnum shrink-0 text-[12px] font-semibold">{b.reliabilityScore}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 whitespace-normal break-words rounded-[8px] bg-[#F8FAFC] px-4 py-3 text-[12.5px] leading-relaxed text-[#1E293B]">
              <ShieldCheck size={15} weight="bold" className="shrink-0 text-[#047857]" />
              {en ? `${currentBuyer.metrics.completedTransactions} settled · T+${currentBuyer.metrics.avgPaymentDelayDays} avg payout` : `${currentBuyer.metrics.completedTransactions} लेनदेन पूर्ण`}
            </div>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="card-flat h-full p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] break-words text-[#64748B]">{en ? 'Live lot' : 'लाइव लॉट'}</p>
              {activeLot && <Badge tone="blue">{activeLot.crop} · {activeLot.quantityQuintals} qtl</Badge>}
            </div>
            {activeLot ? (
              <>
                <p className="mt-3 whitespace-normal break-words text-[14px] font-bold leading-snug">{activeLot.farmerName} — {activeLot.farmerVillage}, {activeLot.district}</p>
                <p className="mt-1 whitespace-normal break-words text-[12.5px] leading-relaxed text-[#64748B]">{activeLot.grade} · {en ? 'Moisture' : 'नमी'} {activeLot.moisturePercent}%</p>
                <div className="mt-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <input type="number" value={bidPrice} onChange={(e) => setBidPrice(Number(e.target.value))} className="field-input font-mono-num tnum min-h-[44px] min-w-[120px] flex-1" aria-label="Bid price per quintal" />
                    <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#64748B]">₹/qtl</span>
                  </div>
                  <button onClick={() => onInitiateBidOnLot?.(activeLot, bidPrice)} className="btn-ink min-h-[44px] w-full shrink-0 whitespace-normal break-words px-4 py-2.5 text-[13px] min-[480px]:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">{en ? 'Place bid' : 'बोली'}</button>
                </div>
                <button onClick={handleOpenNegotiation} disabled={startingNegotiation}
                  className="mt-3 w-full min-h-[44px] whitespace-normal break-words rounded-[6px] border border-[#E2E8F0] px-4 py-3 text-[12.5px] font-semibold leading-relaxed text-[#1E293B] hover:border-[#047857] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  {startingNegotiation ? (en ? 'Opening thread…' : 'बातचीत शुरू हो रही है…') : (en ? 'Open negotiation thread instead' : 'बातचीत शुरू करें')}
                </button>
                {negotiationStartError && <p className="mt-2 text-[12px] leading-relaxed text-[#9F2F2D]" role="alert">{negotiationStartError}</p>}
              </>
            ) : (
              <p className="mt-2 text-[13px] text-[#64748B]">{en ? 'No lot in context. Analyse a lot first.' : 'पहले लॉट का विश्लेषण करें।'}</p>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal index={2}>
        <div className="card-flat mt-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">{en ? 'Negotiation thread' : 'बातचीत का इतिहास'}</p>
              <h2 className="font-serif-display mt-2 text-[1.4rem]">{en ? 'Keep every offer visible.' : 'हर प्रस्ताव सुरक्षित रखें।'}</h2>
            </div>
            {negotiation && <Badge tone="blue">{en ? 'Price history' : 'भाव इतिहास'}</Badge>}
          </div>
          <div className="mt-4">
            <NegotiationPanel
              language={language}
              viewer="buyer"
              session={negotiation}
              loading={negotiationLoading}
              error={negotiationError}
              onRetry={loadNegotiation}
              onCounterOffer={negotiation ? (price, message) => onMakeCounterOffer?.(negotiation.id, price, message) : undefined}
              onAcceptOffer={negotiation ? () => onAcceptOffer?.(negotiation.id) : undefined}
              onRejectOffer={negotiation ? () => onRejectOffer?.(negotiation.id) : undefined}
              emptyTitle={activeLot ? (en ? 'No thread for this lot yet' : 'इस लॉट के लिए अभी बातचीत नहीं') : (en ? 'Analyse a lot first' : 'पहले लॉट का विश्लेषण करें')}
              emptyBody={en ? 'Open a negotiation from the live lot above and the full counter-offer history will stay attached to it.' : 'ऊपर दिए लाइव लॉट से बातचीत शुरू करें; पूरा प्रस्ताव इतिहास इसी लॉट के साथ रहेगा।'}
            />
          </div>
        </div>
      </Reveal>

      <Reveal index={3}>
        <h2 className="font-serif-display mt-10 text-[1.4rem]">{en ? 'Open demand' : 'खुली मांग'}</h2>
      </Reveal>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {offers.slice(0, 6).map((o, i) => (
          <Reveal key={o.id} index={i}>
            <div className="card-flat card-flat-hover h-full p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-normal break-words text-[13px] font-bold leading-snug"><Buildings size={15} weight="bold" className="shrink-0" />{o.buyerName}</span>
                <Badge tone={o.reliabilityScore >= 90 ? 'green' : 'neutral'}>{o.reliabilityScore} {en ? 'trust' : ''}</Badge>
              </div>
              <p className="font-mono-num tnum mt-3 whitespace-normal break-words text-xl font-semibold">{inr(o.offeredPricePerQtl)} <span className="text-[12px] font-normal text-[#64748B]">/qtl · {o.crop}</span></p>
              <p className="mt-2 whitespace-normal break-words text-[12px] leading-relaxed text-[#64748B]">{o.minQuantityQtl}–{o.maxQuantityQtl} qtl · {o.requiredGrade.split(' ')[1]} · {o.paymentTerms} · {o.distanceKm} km</p>
            </div>
          </Reveal>
        ))}
      </div>

      {showNew && (
        <ModalShell onClose={() => setShowNew(false)} label="Post demand">
          <form onSubmit={createOffer} className="thin-scroll max-h-[85vh] overflow-y-auto p-6 sm:p-8">
            <p className="font-serif-display whitespace-normal break-words text-xl">Post procurement bid</p>
            <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 min-[480px]:gap-3">
              <div className="min-[480px]:col-span-2"><FieldLabel>Crop</FieldLabel>
                <select value={newCrop} onChange={(e) => setNewCrop(e.target.value as CropType)} className="field-input min-h-[44px]">
                  {['Wheat', 'Mustard', 'Potato', 'Onion', 'Tomato', 'Soybean', 'Cotton', 'Paddy (Rice)'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><FieldLabel>Price ₹/qtl</FieldLabel><input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="field-input font-mono-num min-h-[44px]" /></div>
              <div><FieldLabel>Grade</FieldLabel>
                <select value={newGrade} onChange={(e) => setNewGrade(e.target.value as QualityGrade)} className="field-input min-h-[44px] text-[13px]">
                  <option>Grade A (Premium)</option><option>Grade B (Fair/Avg)</option><option>Grade C (Standard)</option>
                </select>
              </div>
              <div><FieldLabel>Min qtl</FieldLabel><input type="number" value={newMin} onChange={(e) => setNewMin(Number(e.target.value))} className="field-input font-mono-num min-h-[44px]" /></div>
              <div><FieldLabel>Max qtl</FieldLabel><input type="number" value={newMax} onChange={(e) => setNewMax(Number(e.target.value))} className="field-input font-mono-num min-h-[44px]" /></div>
            </div>
            <button type="submit" className="btn-ink mt-5 min-h-[44px] w-full px-4 py-2.5 text-[13.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">Publish bid</button>
          </form>
        </ModalShell>
      )}
    </Container>
  );
};
