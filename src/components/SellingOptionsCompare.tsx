import React from 'react';
import { ArrowLeft, Sparkle, Check, X, Buildings, Storefront, UsersThree, Warehouse, Coins } from '@phosphor-icons/react';
import { RecommendationResult, SellingOptionBreakdown, Language, ProduceLot } from '../types';
import { Container, Reveal, Badge, PageHead, inr } from './ui';

interface SellingOptionsCompareProps {
  language: Language;
  recommendation: RecommendationResult;
  lot: ProduceLot;
  onAcceptOption: (option: SellingOptionBreakdown) => void;
  onOpenAiAdvisor: () => void;
  onBack: () => void;
}

function OptionIcon({ id }: { id: string }) {
  const p = { size: 16, weight: 'bold' } as const;
  if (id === 'buyer') return <Buildings {...p} />;
  if (id === 'mandi') return <Storefront {...p} />;
  if (id === 'aggregation') return <UsersThree {...p} />;
  if (id === 'storage') return <Warehouse {...p} />;
  return <Coins {...p} />;
}

export const SellingOptionsCompare: React.FC<SellingOptionsCompareProps> = ({
  language, recommendation, lot, onAcceptOption, onOpenAiAdvisor, onBack,
}) => {
  const en = language === 'en';
  const rows: { label: string; get: (o: SellingOptionBreakdown) => string; mono?: boolean }[] = [
    { label: en ? 'Net total' : 'शुद्ध कुल', get: (o) => inr(o.netRealization), mono: true },
    { label: en ? 'Net / quintal' : 'शुद्ध /क्विंटल', get: (o) => `${inr(o.netRealizationPerQtl)}`, mono: true },
    { label: en ? 'Gross' : 'सकल', get: (o) => inr(o.grossSaleValue), mono: true },
    { label: en ? 'Deductions' : 'कटौती', get: (o) => `− ${inr(o.deductions.totalDeductions)}`, mono: true },
    { label: en ? 'Kept' : 'बचत', get: (o) => `${o.realizationPercent.toFixed(1)}%`, mono: true },
    { label: en ? 'Settlement' : 'भुगतान', get: (o) => o.paymentTimeline },
    { label: en ? 'Reliability' : 'विश्वास', get: (o) => `${o.reliabilityScore}/100`, mono: true },
  ];

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Matrix — 4 channels' : 'मैट्रिक्स — 4 माध्यम'}
        title={en ? 'Side by side, by net.' : 'आमने-सामने, शुद्ध पर।'}
        lede={`${lot.crop} · ${lot.quantityQuintals} qtl · ${lot.grade} — headline price means little until freight, fees and risk are removed.`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onOpenAiAdvisor} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              <Sparkle size={14} weight="bold" /> {en ? 'Ask AI' : 'AI'}
            </button>
            <button onClick={onBack} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              <ArrowLeft size={14} weight="bold" /> {en ? 'Back' : 'वापस'}
            </button>
          </div>
        }
      />

      {/* cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendation.allOptions.map((opt, i) => {
          const win = opt.optionId === recommendation.recommendedOption.optionId;
          return (
            <Reveal key={opt.optionId} index={i} className="h-full">
              <div className={`card-flat flex h-full flex-col p-6 ${win ? '!border-[#047857]' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F8FAFC] text-[#065F46]">
                    <OptionIcon id={opt.optionId} />
                  </span>
                  {win ? <Badge tone="ink">{en ? 'Winner' : 'विजेता'}</Badge> : <span className="font-mono-num text-[11px] text-[#94A3B8]">0{i + 1}</span>}
                </div>
                <p className="mt-4 break-words text-[13.5px] font-bold leading-snug text-[#0F172A]">{opt.title}</p>
                <p className="font-mono-num tnum mt-2 break-words text-[1.35rem] font-semibold leading-snug tracking-tight">{inr(opt.netRealization)}</p>
                <p className="font-mono-num mt-1 break-words text-[11.5px] leading-relaxed text-[#64748B]">{inr(opt.netRealizationPerQtl)}/qtl · {opt.realizationPercent.toFixed(0)}% {en ? 'kept' : ''}</p>
                <ul className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4">
                  <li className="flex items-start gap-2 break-words text-[12px] leading-relaxed text-[#1E293B]"><Check size={13} weight="bold" className="mt-0.5 shrink-0 text-[#047857]" /><span className="min-w-0">{opt.keyBenefits[0]}</span></li>
                  {opt.keyRisks[0] && <li className="flex items-start gap-2 break-words text-[12px] leading-relaxed text-[#64748B]"><X size={13} weight="bold" className="mt-0.5 shrink-0 text-[#991B1B]" /><span className="min-w-0">{opt.keyRisks[0]}</span></li>}
                </ul>
                <button onClick={() => onAcceptOption(opt)} className={`mt-5 min-h-[44px] w-full px-3 py-2.5 text-[12.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${win ? 'btn-ink' : 'btn-paper'}`}>
                  {en ? 'Select this channel' : 'यह चुनें'}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* mobile ledger cards */}
      <Reveal index={2} className="mt-6 md:hidden">
        <div className="grid gap-3">
          {recommendation.allOptions.map((option, index) => {
            const win = option.optionId === recommendation.recommendedOption.optionId;
            return (
              <section key={option.optionId} className={`rounded-[12px] border bg-white p-4 ${win ? 'border-[#047857]' : 'border-[#E2E8F0]'}`} aria-labelledby={`mobile-option-${option.optionId}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F8FAFC] text-[#065F46]"><OptionIcon id={option.optionId} /></span>
                    <h2 id={`mobile-option-${option.optionId}`} className="min-w-0 break-words text-[13.5px] font-bold leading-snug text-[#0F172A]">{option.title}</h2>
                  </div>
                  {win ? <Badge tone="ink">{en ? 'Winner' : 'विजेता'}</Badge> : <span className="font-mono-num shrink-0 text-[11px] text-[#94A3B8]">0{index + 1}</span>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#E2E8F0] pt-4 text-[12px]">
                  {rows.map((row) => (
                    <div key={row.label} className="min-w-0">
                      <dt className="break-words text-[#64748B]">{row.label}</dt>
                      <dd className={`mt-0.5 break-words font-semibold text-[#0F172A] ${row.mono ? 'font-mono-num tnum' : ''}`}>{row.get(option)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </Reveal>

      {/* desktop ledger table */}
      <Reveal index={2}>
        <div className="card-flat mt-6 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white">
                <th className="font-mono-num sticky left-0 min-w-[140px] bg-white px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]"> {en ? 'Line' : 'मद'}</th>
                {recommendation.allOptions.map((o) => (
                  <th key={o.optionId} className="min-w-[130px] whitespace-nowrap px-5 py-3.5 text-[12.5px] font-bold leading-snug text-[#0F172A]">{o.optionType}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="sticky left-0 min-w-[140px] break-words bg-white px-5 py-3.5 leading-relaxed text-[#64748B]">{r.label}</td>
                  {recommendation.allOptions.map((o) => (
                    <td key={o.optionId} className={`min-w-[130px] whitespace-nowrap px-5 py-3.5 font-semibold leading-relaxed text-[#0F172A] ${r.mono ? 'font-mono-num tnum' : 'break-words'}`}>{r.get(o)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Container>
  );
};
