import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Scales,
  Truck,
  ShieldCheck,
  Plant,
} from '@phosphor-icons/react';
import { CropType, Language } from '../types';
import { Container, Reveal, Badge } from './ui';

interface LandingHeroProps {
  language: Language;
  onStartAnalysis: (crop?: CropType, quantityQtl?: number) => void;
  onNavigateToBuyer: () => void;
  onNavigateToAggregation: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onStartAnalysis,
  onNavigateToBuyer,
  onNavigateToAggregation,
}) => {
  const en = language === 'en';

  return (
    <div className="relative overflow-hidden">
      <div className="ambient-wash" aria-hidden />
      <Container className="relative pb-20 pt-12 sm:pt-16">
        {/* HERO — asymmetric split */}
        <div className="grid min-w-0 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <Reveal>
            <p className="font-mono-num text-[11px] uppercase tracking-[0.18em] text-[#64748B]">
              {en ? 'Decision intelligence · Agriculture' : 'निर्णय इंटेलिजेंस · कृषि'}
            </p>
            <h1 className="font-serif-display mt-4 max-w-[20ch] break-words text-[clamp(2.35rem,7vw,4rem)] leading-[1.08] text-[#0F172A]">
              {en ? (
                <>Sell smarter. Know what you'll <em className="font-medium">actually earn.</em></>
              ) : (
                <>स्मार्ट बेचें। जानें <em className="font-medium">असल में कितना मिलेगा।</em></>
              )}
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed break-words text-[#475569]">
              {en
                ? 'Compare buyers, mandis, pooling and storage by net money in hand — after freight, fees and risk.'
                : 'खरीदार, मंडी, समूह और भंडारण की तुलना शुद्ध कमाई पर करें — भाड़ा, फीस और जोखिम के बाद।'}
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button onClick={() => onStartAnalysis('Wheat', 45)} className="btn-ink inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                {en ? 'Find my selling options' : 'मेरे विकल्प देखें'}
                <ArrowRight size={16} weight="bold" />
              </button>
              <button onClick={onNavigateToAggregation} className="btn-paper inline-flex min-h-[48px] items-center justify-center gap-1.5 px-5 py-3 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                {en ? 'Farmer pooling' : 'किसान समूह'}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#64748B]">
              <button onClick={onNavigateToBuyer} className="inline-flex min-h-[44px] items-center gap-1 rounded-[4px] py-2 hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                {en ? "I'm a buyer" : 'मैं खरीदार हूँ'} <ArrowUpRight size={14} weight="bold" />
              </button>
              <span className="hidden h-3 w-px bg-[#E2E8F0] sm:block" />
              <span>{en ? 'Hindi + English · MSP referenced' : 'हिन्दी + English · MSP सहित'}</span>
            </div>

            {/* ledger strip */}
            <dl className="mt-10 grid grid-cols-1 divide-y divide-[#E2E8F0] rounded-[12px] border border-[#E2E8F0] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { k: en ? 'Channels compared' : 'माध्यम', v: '4' },
                { k: en ? 'Net, not price' : 'शुद्ध गणना', v: '₹/qtl' },
                { k: en ? 'Languages' : 'भाषा', v: en ? 'EN · HI' : 'HI · EN' },
              ].map((s) => (
                <div key={s.k} className="min-w-0 px-5 py-4">
                  <dt className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[#64748B]">{s.k}</dt>
                  <dd className="font-mono-num tnum mt-0.5 text-[15px] font-semibold text-[#0F172A]">{s.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* worked example — faux-OS ledger */}
          <Reveal index={1}>
            <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3.5 sm:flex-nowrap sm:gap-3 sm:px-5">
                <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
                </div>
                <span className="min-w-0 flex-1 break-words text-center font-mono-num text-[10.5px] leading-relaxed text-[#64748B] sm:text-[11px]">LOT-WHEAT-45Q · Alwar</span>
                <span className="shrink-0"><Badge tone="green">{en ? 'Verified' : 'सत्यापित'}</Badge></span>
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold leading-relaxed text-[#0F172A]">{en ? 'Expected money you receive' : 'आपको मिलने वाली राशि'}</p>
                  <Badge tone="ink">{en ? 'Recommended' : 'सुझाव'}</Badge>
                </div>
                <p className="font-mono-num tnum mt-2 text-[clamp(1.75rem,6vw,2.25rem)] font-semibold tracking-tight text-[#0F172A]">
                  ₹1,04,580
                </p>
                <p className="font-mono-num mt-1.5 text-[12px] leading-relaxed text-[#64748B]">₹2,324 /qtl net · 45 qtl Wheat · Grade A</p>

                <div className="mt-5 divide-y divide-[#E2E8F0] rounded-[8px] border border-[#E2E8F0]">
                  {[
                    { k: en ? 'Gross sale value' : 'सकल मूल्य', v: '₹1,10,250' },
                    { k: en ? 'Freight + handling' : 'भाड़ा + पल्लेदारी', v: '− ₹4,120' },
                    { k: en ? 'Fees + risk adj.' : 'फीस + जोखिम', v: '− ₹1,550' },
                  ].map((r) => (
                    <div key={r.k} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                      <span className="min-w-0 break-words text-[#475569]">{r.k}</span>
                      <span className="font-mono-num tnum shrink-0 font-semibold text-[#0F172A]">{r.v}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 bg-[#F8FAFC] px-4 py-3 text-[13px] font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                      <Scales size={15} weight="bold" /> {en ? 'Net in bank' : 'बैंक में शुद्ध'}
                    </span>
                    <span className="font-mono-num tnum text-[#065F46]">₹1,04,580</span>
                  </div>
                </div>

                <button onClick={() => onStartAnalysis('Wheat', 45)} className="btn-ink mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 px-4 py-3 text-[13.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  {en ? 'Run this calculation live' : 'यह गणना लाइव करें'} <ArrowRight size={15} weight="bold" />
                </button>
                <p className="mt-3 px-2 text-center text-[11.5px] leading-relaxed text-[#94A3B8]">
                  {en ? 'Illustrative figures · engine computes from live inputs' : 'उदाहरण आंकड़े · इंजन लाइव गणना करता है'}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* cluster strip */}
        <Reveal index={1}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[#E2E8F0] py-4 text-[12.5px] leading-relaxed text-[#64748B]">
            <span className="font-mono-num text-[11px] uppercase tracking-[0.16em]">{en ? 'Active clusters' : 'सक्रिय समूह'}</span>
            {['Alwar · 214 qtl', 'Bharatpur · 186 qtl', 'Karnal · 320 qtl', 'Indore · 148 qtl'].map((c) => (
              <span key={c} className="font-mono-num tnum whitespace-nowrap">{c}</span>
            ))}
          </div>
        </Reveal>

        {/* HOW IT WORKS — bento, asymmetric */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div className="card-flat h-full p-6 sm:p-8">
              <h2 className="font-serif-display text-2xl leading-snug text-[#0F172A]">{en ? 'How the decision is made' : 'निर्णय कैसे होता है'}</h2>
              <ol className="mt-6">
                {[
                  { n: '01', t: en ? 'Describe the lot' : 'फसल बताएं', d: en ? 'Crop, quantity, grade, moisture, district.' : 'फसल, मात्रा, ग्रेड, नमी, जिला।', icon: Plant },
                  { n: '02', t: en ? 'Engine prices every channel' : 'हर माध्यम की कीमत', d: en ? 'Buyer bids, mandi auction, pooled freight, storage rent.' : 'खरीदार बोली, मंडी, समूह भाड़ा, गोदाम किराया।', icon: Scales },
                  { n: '03', t: en ? 'Take-home ranking' : 'शुद्ध रैंकिंग', d: en ? 'Net per quintal after all deductions and risk.' : 'सभी कटौतियों के बाद प्रति क्विंटल शुद्ध।', icon: ShieldCheck },
                ].map((s, i) => (
                  <li key={s.n} className={`flex items-start gap-4 py-5 ${i !== 2 ? 'border-b border-[#E2E8F0]' : ''}`}>
                    <span className="font-mono-num min-w-[28px] pt-0.5 text-[12px] font-semibold text-[#94A3B8]">{s.n}</span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F8FAFC] text-[#065F46]">
                      <s.icon size={18} weight="bold" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-semibold leading-snug break-words text-[#0F172A]">{s.t}</span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed break-words text-[#64748B]">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <div className="grid gap-5">
            <Reveal index={1}>
              <div className="card-flat bg-[#ECFDF5]/50 p-6 sm:p-8">
                <div className="flex items-start gap-2 text-[#065F46]">
                  <Truck size={18} weight="bold" className="mt-0.5 shrink-0" />
                  <p className="text-[14px] font-semibold leading-snug break-words">{en ? 'Pooling cuts freight up to 45%' : 'समूह से भाड़ा 45% तक कम'}</p>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#047857]">
                  {en ? 'Small lots combine into full-truck loads and unlock institutional bids.' : 'छोटे लॉट मिलकर पूरे ट्रक का लोड बनाते हैं।'}
                </p>
                <button onClick={onNavigateToAggregation} className="mt-3 inline-flex min-h-[44px] items-center gap-1 rounded-[4px] py-2 text-[13px] font-semibold text-[#065F46] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  {en ? 'See pooling' : 'समूह देखें'} <ArrowUpRight size={14} weight="bold" />
                </button>
              </div>
            </Reveal>
            <Reveal index={2}>
              <div className="card-flat p-6 sm:p-8">
                <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">{en ? 'Reference' : 'संदर्भ'}</p>
                <p className="font-mono-num tnum mt-2 text-lg font-semibold break-words text-[#0F172A]">MSP ₹2,275 <span className="text-[12px] font-normal text-[#64748B]">/qtl · Wheat</span></p>
                <p className="mt-2 text-[13px] leading-relaxed break-words text-[#64748B]">{en ? 'Use' : 'उपयोग करें'} <kbd className="key">EN</kbd> / <kbd className="key">HI</kbd> {en ? 'toggle in the top bar.' : 'टॉगल ऊपर दिया है।'}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </div>
  );
};
