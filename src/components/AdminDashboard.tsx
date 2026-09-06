import React, { useState } from 'react';
import { ArrowCounterClockwise, Check } from '@phosphor-icons/react';
import { Language, ScoringWeights } from '../types';
import { DEFAULT_SCORING_WEIGHTS, MOCK_PLATFORM_METRICS } from '../data/mockData';
import { Container, Reveal, PageHead, inr } from './ui';

interface AdminDashboardProps {
  language: Language;
  scoringWeights: ScoringWeights;
  onUpdateWeights: (weights: ScoringWeights) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, scoringWeights, onUpdateWeights }) => {
  const en = language === 'en';
  const [weights, setWeights] = useState<ScoringWeights>(scoringWeights);
  const [saved, setSaved] = useState(false);
  const m = MOCK_PLATFORM_METRICS;

  const total = (Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0);
  const balanced = Math.abs(total - 100) < 0.01;

  const save = () => {
    onUpdateWeights(weights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const sliders: { key: keyof ScoringWeights; label: string; hint: string }[] = [
    { key: 'netRealizationWeight', label: en ? 'Net realization' : 'शुद्ध कमाई', hint: en ? 'Money in hand' : 'हाथ में राशि' },
    { key: 'reliabilityWeight', label: en ? 'Buyer reliability' : 'विश्वसनीयता', hint: en ? 'Settlement history' : 'भुगतान इतिहास' },
    { key: 'paymentSpeedWeight', label: en ? 'Payment speed' : 'भुगतान गति', hint: 'T+0 – T+3' },
    { key: 'distanceConvenienceWeight', label: en ? 'Distance convenience' : 'दूरी सुविधा', hint: en ? 'Freight burden' : 'भाड़ा भार' },
  ];

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Admin — engine governance' : 'प्रशासन'}
        title={en ? 'Weights, revenue, trust.' : 'भार, राजस्व, विश्वास।'}
        lede="Tune the four scoring weights, then watch GMV and counterparty quality respond."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { k: en ? 'GMV routed' : 'GMV', v: inr(m.gmvTotalInr) },
          { k: en ? 'Transactions' : 'लेनदेन', v: String(m.totalTransactionsCount) },
          { k: en ? 'Farmers' : 'किसान', v: String(m.totalFarmers) },
          { k: en ? 'Income lift' : 'आय वृद्धि', v: `+${m.avgFarmerIncomeGainPercent}%` },
        ].map((s, i) => (
          <Reveal key={s.k} index={i}>
            <div className="card-flat min-h-[88px] px-4 py-4">
              <p className="font-mono-num break-words text-[10.5px] uppercase leading-relaxed tracking-[0.14em] text-[#64748B]">{s.k}</p>
              <p className="font-mono-num tnum mt-1 break-words text-[15px] font-semibold leading-snug sm:text-[17px]">{s.v}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="card-flat mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14.5px] font-bold">{en ? 'Recommendation weights' : 'स्कोरिंग भार'}</p>
          <span className={`badge ${balanced ? 'badge-green' : 'badge-yellow'}`}>
            {en ? 'Total' : 'कुल'} {total.toFixed(0)} / 100
          </span>
        </div>
        <div className="mt-5 grid gap-x-5 gap-y-7 md:grid-cols-2">
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <label className="break-words text-[13px] font-semibold leading-relaxed" htmlFor={`w-${s.key}`}>{s.label} <span className="font-normal text-[#64748B]">· {s.hint}</span></label>
                <span className="font-mono-num tnum shrink-0 text-[13px] font-bold">{weights[s.key]}%</span>
              </div>
              <input id={`w-${s.key}`} type="range" min={0} max={80} value={weights[s.key]}
                onChange={(e) => setWeights({ ...weights, [s.key]: Number(e.target.value) })} className="slider-min min-h-[24px]" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] pt-5">
          <button onClick={save} disabled={!balanced} className="btn-ink inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2.5 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
            <Check size={15} weight="bold" /> {saved ? (en ? 'Saved' : 'सहेजा गया') : (en ? 'Apply weights' : 'लागू करें')}
          </button>
          <button onClick={() => { setWeights(DEFAULT_SCORING_WEIGHTS); onUpdateWeights(DEFAULT_SCORING_WEIGHTS); }} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2.5 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
            <ArrowCounterClockwise size={15} weight="bold" /> {en ? 'Reset' : 'रीसेट'}
          </button>
          {!balanced && <span className="break-words text-[12px] leading-relaxed text-[#92400E]">{en ? 'Weights must total 100.' : 'कुल 100 होना चाहिए।'}</span>}
        </div>
      </div>
    </Container>
  );
};
