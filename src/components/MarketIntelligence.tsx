import React, { useState } from 'react';
import { TrendUp, TrendDown, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { CropType, Language } from '../types';
import { CROP_CONFIGS, MOCK_HISTORICAL_PRICES, MOCK_MANDIS } from '../data/mockData';
import { Container, Reveal, Badge, PageHead, inr } from './ui';

interface MarketIntelligenceProps {
  language: Language;
  onSelectCropForAnalysis?: (crop: CropType) => void;
  onOpenAiAdvisor: () => void;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ language, onSelectCropForAnalysis, onOpenAiAdvisor }) => {
  const en = language === 'en';
  const [crop, setCrop] = useState<CropType>('Wheat');
  const history = MOCK_HISTORICAL_PRICES[crop] || MOCK_HISTORICAL_PRICES['Wheat'];
  const cfg = CROP_CONFIGS[crop];

  const vals = history.flatMap((h) => [h.mandiModalPrice, h.institutionalBuyerAvg]);
  const min = Math.min(...vals) * 0.97;
  const max = Math.max(...vals) * 1.03;
  const W = 640, H = 180, P = 12;
  const x = (i: number) => P + (i / Math.max(1, history.length - 1)) * (W - P * 2);
  const y = (v: number) => H - P - ((v - min) / Math.max(1, max - min)) * (H - P * 2);
  const line = (get: (h: (typeof history)[number]) => number) =>
    history.map((h, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(get(h)).toFixed(1)}`).join(' ');

  const last = history[history.length - 1];
  const spread = last.institutionalBuyerAvg - last.mandiModalPrice;
  const mandis = MOCK_MANDIS.filter((m) => m.crop === crop).slice(0, 3);

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Market intelligence' : 'बाजार जानकारी'}
        title={en ? 'Mandi vs. direct, on one line.' : 'मंडी बनाम सीधा भाव।'}
        lede="Thirty-day spread between mandi modal and institutional bids. Sell where the net is, not where the noise is."
        right={
          <button onClick={onOpenAiAdvisor} className="btn-paper inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
            <Sparkle size={14} weight="bold" /> {en ? 'Ask AI' : 'AI'}
          </button>
        }
      />

      <Reveal>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CROP_CONFIGS) as CropType[]).slice(0, 8).map((c) => (
            <button key={c} onClick={() => setCrop(c)}
              className={`min-h-[44px] rounded-[6px] border px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${crop === c ? 'border-[#047857] bg-[#047857] text-white' : 'border-[#E2E8F0] bg-white hover:border-[#047857]'}`}>
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Reveal>
          <div className="card-flat p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="break-words text-[14px] font-bold leading-relaxed">{crop} <span className="font-normal text-[#64748B]">· {cfg.hindiName} · 30 {en ? 'days' : 'दिन'}</span></p>
              <span className={`badge ${spread >= 0 ? 'badge-green' : 'badge-red'}`}>
                {spread >= 0 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                {spread >= 0 ? '+' : ''}{inr(spread)} {en ? 'direct edge' : ''}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto min-h-[220px] w-full" role="img" aria-label={`${crop} price trend`}>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={P} x2={W - P} y1={H * f} y2={H * f} stroke="#E2E8F0" strokeWidth="1" />
              ))}
              <path d={line((h) => h.mandiModalPrice)} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 4" />
              <path d={line((h) => h.institutionalBuyerAvg)} fill="none" stroke="#047857" strokeWidth="2" />
              <circle cx={x(history.length - 1)} cy={y(last.institutionalBuyerAvg)} r="3.5" fill="#047857" />
            </svg>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] leading-relaxed text-[#64748B]">
              <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-5 shrink-0 bg-[#047857]" /> {en ? 'Direct buyer' : 'सीधा भाव'} · {inr(last.institutionalBuyerAvg)}</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-5 shrink-0 bg-[#94A3B8]" /> {en ? 'Mandi modal' : 'मंडी'} · {inr(last.mandiModalPrice)}</span>
              <span className="font-mono-num">MSP {inr(cfg.mspPerQtl)}</span>
            </div>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="card-flat flex h-full flex-col p-5 sm:p-6">
            <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">{en ? 'What to do today' : 'आज क्या करें'}</p>
            <p className="font-serif-display mt-2 break-words text-[1.35rem] leading-snug">
              {spread >= 0
                ? (en ? 'Favour direct bids. The spread covers freight.' : 'सीधी बोली बेहतर। भाड़ा निकल जाएगा।')
                : (en ? 'Mandi is firmer. Compare net before moving.' : 'मंडी मजबूत। शुद्ध तुलना करें।')}
            </p>
            <div className="mt-4 space-y-2">
              {mandis.map((m) => (
                <div key={m.id} className="flex min-h-[48px] items-center justify-between gap-3 rounded-[8px] border border-[#E2E8F0] px-3 py-2.5 text-[12.5px]">
                  <span className="break-words font-medium leading-relaxed">{m.mandiName} <span className="text-[#64748B]">· {m.distanceKm} km</span></span>
                  <span className="font-mono-num tnum shrink-0 font-semibold">{inr(m.modalPricePerQtl)}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onSelectCropForAnalysis?.(crop)} className="btn-ink mt-5 inline-flex min-h-[44px] items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              {en ? `Analyse ${crop} now` : 'विश्लेषण करें'} <ArrowRight size={15} weight="bold" />
            </button>
          </div>
        </Reveal>
      </div>
    </Container>
  );
};
