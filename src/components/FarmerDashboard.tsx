import React, { useCallback, useEffect, useState } from 'react';
import { Plus, ArrowRight, Receipt } from '@phosphor-icons/react';
import { ProduceLot, RecommendationResult, TransactionRecord, Language, NegotiationRecord } from '../types';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { fetchNegotiation } from '../services/negotiationService';
import { Container, Reveal, Badge, PageHead, inr } from './ui';
import { NegotiationPanel } from './NegotiationPanel';

interface FarmerDashboardProps {
  language: Language;
  currentLot: ProduceLot;
  recommendation: RecommendationResult;
  transactions?: TransactionRecord[];
  onAddNewProduce: () => void;
  onViewRecommendation: () => void;
  onViewOption: (optId: string) => void;
  onViewTransaction: (txn: TransactionRecord) => void;
  onInitiateNegotiation?: (lot: ProduceLot, buyerId: string, buyerName: string) => Promise<void> | void;
  negotiationRefreshKey?: number;
  onMakeCounterOffer?: (negId: string, price: number, message: string) => Promise<void> | void;
  onAcceptOffer?: (negId: string) => Promise<void> | void;
  onRejectOffer?: (negId: string) => Promise<void> | void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  language, currentLot, recommendation, transactions = MOCK_TRANSACTIONS,
  onAddNewProduce, onViewRecommendation, onViewTransaction,
  negotiationRefreshKey, onMakeCounterOffer, onAcceptOffer, onRejectOffer,
}) => {
  const en = language === 'en';
  const winner = recommendation.recommendedOption;
  const [negotiation, setNegotiation] = useState<NegotiationRecord | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState(true);
  const [negotiationError, setNegotiationError] = useState<string | null>(null);

  const loadNegotiation = useCallback(async () => {
    setNegotiationLoading(true);
    setNegotiationError(null);
    try {
      setNegotiation(await fetchNegotiation(currentLot.id));
    } catch (error) {
      setNegotiationError(error instanceof Error ? error.message : (en ? 'Unable to load this thread.' : 'बातचीत लोड नहीं हो सकी।'));
    } finally {
      setNegotiationLoading(false);
    }
  }, [currentLot.id, en]);

  useEffect(() => {
    void loadNegotiation();
  }, [loadNegotiation, negotiationRefreshKey]);

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Farmer hub' : 'किसान डैशबोर्ड'}
        title={en ? `Namaste, ${currentLot.farmerName.split(' ')[0]}.` : `नमस्ते, ${currentLot.farmerName}।`}
        lede={`${currentLot.crop} · ${currentLot.quantityQuintals} qtl · ${currentLot.district} — one ledger for analysis, deals and payments.`}
        right={
          <button onClick={onAddNewProduce} className="btn-ink inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-normal break-words px-4 py-2.5 text-[13px] min-[480px]:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
            <Plus size={15} weight="bold" /> {en ? 'Add produce' : 'फसल जोड़ें'}
          </button>
        }
      />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="card-flat h-full p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">{en ? 'Active lot · net' : 'सक्रिय लॉट'}</span>
              <Badge tone="green">{en ? 'Analysed' : 'विश्लेषित'}</Badge>
            </div>
            <p className="font-mono-num tnum mt-2 text-[2.1rem] font-semibold tracking-tight">{inr(winner.netRealization)}</p>
            <p className="font-mono-num text-[12.5px] leading-relaxed break-words text-[#64748B]">
              {inr(winner.netRealizationPerQtl)}/qtl · {winner.optionType}
              {recommendation.netAdvantageOverMandi > 0 && (
                <span className="text-[#047857]"> · +{inr(recommendation.netAdvantageOverMandi)} {en ? 'vs mandi' : 'मंडी से अधिक'}</span>
              )}
            </p>
            <div className="mt-5 grid grid-cols-1 divide-y divide-[#E2E8F0] rounded-[8px] border border-[#E2E8F0] min-[480px]:grid-cols-3 min-[480px]:divide-x min-[480px]:divide-y-0">
              {[
                { k: en ? 'Gross' : 'सकल', v: inr(winner.grossSaleValue) },
                { k: en ? 'Deductions' : 'कटौती', v: inr(winner.deductions.totalDeductions) },
                { k: en ? 'Deals' : 'सौदे', v: String(transactions.length) },
              ].map((s) => (
                <div key={s.k} className="flex min-h-[56px] flex-col justify-center break-words px-4 py-3">
                  <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] break-words text-[#64748B]">{s.k}</p>
                  <p className="font-mono-num tnum mt-0.5 break-words text-[13.5px] font-semibold">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap">
              <button onClick={onViewRecommendation} className="btn-ink inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-normal break-words px-4 py-2.5 text-[13px] min-[480px]:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                {en ? 'Open recommendation' : 'सिफारिश देखें'} <ArrowRight size={15} weight="bold" />
              </button>
              <button onClick={() => transactions[0] && onViewTransaction(transactions[0])} className="btn-paper inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-normal break-words px-4 py-2.5 text-[13px] min-[480px]:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                <Receipt size={15} weight="bold" /> {en ? 'Latest receipt' : 'रसीद'}
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="card-flat h-full p-6 sm:p-8">
            <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] break-words text-[#64748B]">{en ? 'Negotiations' : 'मोलभाव'}</p>
            <div className="mt-3">
              <NegotiationPanel
                language={language}
                viewer="farmer"
                session={negotiation}
                loading={negotiationLoading}
                error={negotiationError}
                onRetry={loadNegotiation}
                onCounterOffer={negotiation ? (price, message) => onMakeCounterOffer?.(negotiation.id, price, message) : undefined}
                onAcceptOffer={negotiation ? () => onAcceptOffer?.(negotiation.id) : undefined}
                onRejectOffer={negotiation ? () => onRejectOffer?.(negotiation.id) : undefined}
              />
            </div>
            <label className="mt-4 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3 text-[12.5px] font-medium break-words focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#047857]">
              <span className="break-words">{en ? 'Notify me on WhatsApp' : 'WhatsApp पर सूचना'}</span>
              <input type="checkbox" className="h-4 w-4 shrink-0 accent-[#047857]" aria-label="WhatsApp notifications" />
            </label>
          </div>
        </Reveal>
      </div>

      <Reveal index={2}>
        <h2 className="font-serif-display mt-10 text-[1.4rem]">{en ? 'Settlement ledger' : 'भुगतान बही'}</h2>
      </Reveal>
      <div className="mt-4 overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
        {transactions.slice(0, 6).map((txn, i) => (
          <button
            key={txn.id}
            onClick={() => onViewTransaction(txn)}
            className={`flex min-h-[56px] w-full flex-col gap-1.5 px-5 py-4 text-left break-words transition-colors hover:bg-[#F8FAFC] min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3 sm:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${i !== 0 ? 'border-t border-[#E2E8F0]' : ''}`}
          >
            <span className="min-w-0 flex-1 basis-[200px]">
              <span className="block whitespace-normal break-words text-[13.5px] font-semibold leading-snug">{txn.buyerOrEntityName} · {txn.crop} {txn.quantityQtl} qtl</span>
              <span className="font-mono-num mt-1 block whitespace-normal break-words text-[11.5px] leading-relaxed text-[#64748B]">{txn.id} · {txn.paymentStatus} · {txn.status}</span>
            </span>
            <span className="font-mono-num tnum shrink-0 whitespace-normal break-words text-[14px] font-semibold">{inr(txn.netPayableToFarmer)}</span>
          </button>
        ))}
        {transactions.length === 0 && (
          <p className="px-5 py-6 text-center text-[13px] text-[#64748B]">{en ? 'No settlements yet.' : 'अभी कोई भुगतान नहीं।'}</p>
        )}
      </div>
    </Container>
  );
};
