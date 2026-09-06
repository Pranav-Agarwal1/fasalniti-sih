import React, { useState } from 'react';
import {
  Check,
  Plus,
  Minus,
  ArrowRight,
  PencilSimple,
  Sparkle,
  ShieldCheck,
  Receipt,
  Buildings,
  Storefront,
  UsersThree,
  Warehouse,
  Coins,
  X,
} from '@phosphor-icons/react';
import { RecommendationResult, SellingOptionBreakdown, Language, ProduceLot } from '../types';
import { translations } from '../utils/translations';
import { Container, Reveal, Badge, Card, ModalShell, inr } from './ui';

interface RecommendationEngineViewProps {
  language: Language;
  recommendation: RecommendationResult;
  lot: ProduceLot;
  onAcceptOption: (option: SellingOptionBreakdown) => void;
  onOpenAiAdvisor: () => void;
  onOpenComparison: () => void;
  onEditLot: () => void;
}

function OptionIcon({ id }: { id: string }) {
  const props = { size: 17, weight: 'bold' } as const;
  if (id === 'buyer') return <Buildings {...props} />;
  if (id === 'mandi') return <Storefront {...props} />;
  if (id === 'aggregation') return <UsersThree {...props} />;
  if (id === 'storage') return <Warehouse {...props} />;
  return <Coins {...props} />;
}

export const RecommendationEngineView: React.FC<RecommendationEngineViewProps> = ({
  language,
  recommendation,
  lot,
  onAcceptOption,
  onOpenAiAdvisor,
  onOpenComparison,
  onEditLot,
}) => {
  const t = translations[language];
  const en = language === 'en';
  const [showWhy, setShowWhy] = useState(false);
  const [breakdown, setBreakdown] = useState<SellingOptionBreakdown | null>(null);

  const winning = recommendation.recommendedOption;
  const explanation = en ? recommendation.recommendationExplanation.en : recommendation.recommendationExplanation.hi;

  return (
    <Container className="py-8">
      {/* lot strip */}
      <Reveal>
        <div className="card-flat flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F8FAFC] font-serif-display text-lg text-[#065F46]">
              {lot.crop.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="break-words text-[15px] font-bold leading-snug text-[#0F172A]">
                {lot.crop} · <span className="font-mono-num tnum font-semibold">{lot.quantityQuintals} qtl</span>{' '}
                <span className="font-normal text-[#64748B]">· {lot.grade.split(' ')[1]}</span>
              </p>
              <p className="mt-0.5 break-words text-[12.5px] leading-relaxed text-[#64748B]">
                {lot.district}, {lot.state} · {en ? 'Moisture' : 'नमी'} {lot.moisturePercent}% · {lot.farmerName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onEditLot} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              <PencilSimple size={14} weight="bold" /> {en ? 'Edit lot' : 'बदलें'}
            </button>
            <button onClick={onOpenAiAdvisor} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              <Sparkle size={14} weight="bold" /> {en ? 'Ask AI' : 'AI से पूछें'}
            </button>
          </div>
        </div>
      </Reveal>

      {/* winner */}
      <Reveal index={1}>
        <div className="card-flat mt-6 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 lg:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">{en ? 'Recommended' : 'सुझाव'}</Badge>
                <span className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-[#64748B]">
                  {winning.optionType} · {en ? 'Score' : 'स्कोर'} {Math.round(winning.recommendationScore)}/100
                </span>
              </div>
              <h1 className="font-serif-display mt-3 break-words text-3xl leading-tight text-[#0F172A] sm:text-4xl">{winning.title}</h1>
              <p className="mt-2 flex items-start gap-1.5 break-words text-[13.5px] leading-relaxed text-[#64748B]">
                <span className="mt-0.5 shrink-0"><OptionIcon id={winning.optionId} /></span>
                <span>{winning.subtitle}</span>
              </p>

              <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                {t.netRealizationHeader}
              </p>
              <p className="font-mono-num tnum mb-1 mt-2 text-[2.5rem] font-semibold leading-none tracking-tight text-[#0F172A]">
                {inr(winning.netRealization)}
              </p>
              <p className="font-mono-num tnum mt-2 break-words text-[13px] leading-relaxed text-[#64748B]">
                {inr(winning.netRealizationPerQtl)} /qtl net · {winning.realizationPercent.toFixed(1)}% {en ? 'of gross' : 'शुद्ध'}
              </p>

              <div className="mt-6 divide-y divide-[#E2E8F0] rounded-[8px] border border-[#E2E8F0]">
                <div className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-[13px]">
                  <span className="text-[#475569]">{t.grossValue}</span>
                  <span className="font-mono-num tnum shrink-0 font-semibold">{inr(winning.grossSaleValue)}</span>
                </div>
                <div className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-3 text-[13px]">
                  <span className="text-[#475569]">{t.totalDeductions}</span>
                  <span className="font-mono-num tnum shrink-0 font-semibold">− {inr(winning.deductions.totalDeductions)}</span>
                </div>
                {recommendation.netAdvantageOverMandi > 0 && (
                  <div className="flex min-h-[44px] items-center justify-between gap-3 bg-[#ECFDF5]/60 px-4 py-3 text-[13px] font-semibold text-[#065F46]">
                    <span>{t.advantageOverMandi}</span>
                    <span className="font-mono-num tnum shrink-0">+{inr(recommendation.netAdvantageOverMandi)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => onAcceptOption(winning)} className="btn-ink inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 px-5 py-3 text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  {t.executeCTA} <ArrowRight size={16} weight="bold" />
                </button>
                <button onClick={() => setBreakdown(winning)} className="btn-paper inline-flex min-h-[48px] items-center justify-center gap-1.5 px-5 py-3 text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  <Receipt size={16} weight="bold" /> {en ? 'Cost breakup' : 'खर्च ब्यौरा'}
                </button>
              </div>
            </div>

            <aside className="border-t border-[#E2E8F0] bg-[#F8FAFC]/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">
                {en ? 'Why this option' : 'यह विकल्प क्यों'}
              </p>
              <ul className="mt-4 space-y-2.5">
                {winning.keyBenefits.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-3 text-[13px] leading-relaxed text-[#1E293B]">
                    <Check size={15} weight="bold" className="mt-0.5 shrink-0 text-[#047857]" /> <span className="min-w-0 break-words">{b}</span>
                  </li>
                ))}
              </ul>
              {winning.keyRisks.length > 0 && (
                <p className="mt-4 break-words text-[12.5px] leading-relaxed text-[#64748B]">
                  <span className="font-semibold text-[#1E293B]">{en ? 'Watch: ' : 'ध्यान: '}</span>
                  {winning.keyRisks[0]}
                </p>
              )}
              <div className="mt-4 flex items-start gap-2 border-t border-[#E2E8F0] pt-4 text-[12.5px] leading-relaxed text-[#64748B]">
                <ShieldCheck size={15} weight="bold" className="mt-0.5 shrink-0" />
                <span className="break-words">{winning.paymentTimeline} · {en ? 'Reliability' : 'विश्वसनीयता'} {winning.reliabilityScore}/100</span>
              </div>
              <button onClick={onOpenComparison} className="mt-4 min-h-[44px] py-1 text-left text-[13px] font-semibold text-[#0F172A] underline decoration-[#CBD5E1] underline-offset-4 hover:decoration-[#047857] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                {en ? 'Compare all 4 channels' : '4 विकल्प तुलना करें'} →
              </button>
            </aside>
          </div>

          {/* why accordion — hairline only */}
          <div className="border-t border-[#E2E8F0]">
            <button onClick={() => setShowWhy((v) => !v)} aria-expanded={showWhy} className="flex min-h-[48px] w-full items-center justify-between gap-4 px-6 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#047857] sm:px-8">
              <span className="text-[14px] font-semibold text-[#0F172A]">{t.whyRecommended}</span>
              {showWhy ? <Minus size={16} weight="bold" className="shrink-0" /> : <Plus size={16} weight="bold" className="shrink-0" />}
            </button>
            {showWhy && (
              <p className="break-words border-t border-[#E2E8F0] px-6 py-5 text-[14px] leading-relaxed text-[#1E293B] sm:px-8">{explanation}</p>
            )}
          </div>
        </div>
      </Reveal>

      {/* all options */}
      <Reveal index={2}>
        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif-display break-words text-2xl leading-snug text-[#0F172A]">{en ? 'All four channels, net compared' : 'चारों माध्यम — शुद्ध तुलना'}</h2>
          <span className="font-mono-num hidden text-[11px] uppercase tracking-[0.14em] text-[#64748B] sm:block">{lot.quantityQuintals} qtl · {lot.crop}</span>
        </div>
      </Reveal>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {recommendation.allOptions.map((opt, i) => {
          const isWin = opt.optionId === winning.optionId;
          return (
            <Reveal key={opt.optionId} index={i}>
              <Card hover className={`h-full p-6 ${isWin ? '!border-[#047857]' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F8FAFC] text-[#065F46]">
                    <OptionIcon id={opt.optionId} />
                  </span>
                  {isWin ? <Badge tone="ink">{en ? 'Winner' : 'विजेता'}</Badge> : (
                    <span className="font-mono-num text-[11px] text-[#94A3B8]">#{i + 1}</span>
                  )}
                </div>
                <p className="mt-4 break-words text-[14.5px] font-bold leading-snug text-[#0F172A]">{opt.title}</p>
                <p className="font-mono-num tnum mt-2 break-words text-xl font-semibold leading-snug text-[#0F172A]">{inr(opt.netRealization)}</p>
                <p className="font-mono-num mt-1 break-words text-[12px] leading-relaxed text-[#64748B]">{inr(opt.netRealizationPerQtl)}/qtl · {opt.realizationPercent.toFixed(0)}% {en ? 'kept' : 'शुद्ध'}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button onClick={() => onAcceptOption(opt)} className={isWin ? 'btn-ink min-h-[44px] px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]' : 'btn-paper min-h-[44px] px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]'}>
                    {en ? 'Select' : 'चुनें'}
                  </button>
                  <button onClick={() => setBreakdown(opt)} className="min-h-[44px] px-3 py-2 text-[12.5px] font-semibold text-[#64748B] hover:text-[#0F172A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                    {en ? 'Breakup' : 'ब्यौरा'}
                  </button>
                  <span className="font-mono-num ml-auto text-[11.5px] text-[#94A3B8]">{Math.round(opt.recommendationScore)}</span>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {breakdown && (
        <ModalShell onClose={() => setBreakdown(null)} label="Cost breakdown" maxWidth="max-w-md">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-6 py-4">
            <p className="min-w-0 break-words text-[14px] font-bold leading-snug">{breakdown.title}</p>
            <button onClick={() => setBreakdown(null)} className="min-h-[44px] min-w-[44px] shrink-0 rounded-[6px] border border-[#E2E8F0] p-2.5 hover:border-[#047857] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" aria-label="Close breakdown"><X size={14} weight="bold" /></button>
          </div>
          <div className="divide-y divide-[#E2E8F0] px-6">
            {[
              { k: en ? 'Price per quintal' : 'भाव /क्विंटल', v: inr(breakdown.pricePerQtl) },
              { k: en ? 'Gross value' : 'सकल मूल्य', v: inr(breakdown.grossSaleValue) },
              { k: en ? 'Transport' : 'भाड़ा', v: `− ${inr(breakdown.deductions.transportCost)}` },
              { k: en ? 'Storage' : 'भंडारण', v: `− ${inr(breakdown.deductions.storageCost)}` },
              { k: en ? 'Handling' : 'पल्लेदारी', v: `− ${inr(breakdown.deductions.handlingCost)}` },
              { k: en ? 'Fees / cess' : 'फीस', v: `− ${inr(breakdown.deductions.mandiCessOrPlatformFee)}` },
              { k: en ? 'Quality risk adj.' : 'जोखिम', v: `− ${inr(breakdown.deductions.qualityRiskAdjustment)}` },
            ].map((r) => (
              <div key={r.k} className="flex min-h-[44px] items-center justify-between gap-3 py-3 text-[13px]">
                <span className="break-words text-[#475569]">{r.k}</span>
                <span className="font-mono-num tnum shrink-0 whitespace-nowrap font-semibold">{r.v}</span>
              </div>
            ))}
            <div className="flex min-h-[48px] items-center justify-between gap-3 bg-[#F8FAFC] px-2 py-3.5 text-[13.5px] font-bold">
              <span className="break-words">{en ? 'Net in hand' : 'शुद्ध राशि'}</span>
              <span className="font-mono-num tnum shrink-0 whitespace-nowrap">{inr(breakdown.netRealization)}</span>
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] p-6">
            <button onClick={() => { onAcceptOption(breakdown); setBreakdown(null); }} className="btn-ink min-h-[48px] w-full px-4 py-3 text-[13.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              {t.executeCTA}
            </button>
          </div>
        </ModalShell>
      )}
    </Container>
  );
};
