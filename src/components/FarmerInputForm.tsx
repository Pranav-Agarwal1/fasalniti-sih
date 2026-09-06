import React, { useState } from 'react';
import { Check, ArrowRight, MapPin, Warehouse, Leaf } from '@phosphor-icons/react';
import { ProduceLot, CropType, QualityGrade, Language } from '../types';
import { translations } from '../utils/translations';
import { CROP_CONFIGS } from '../data/mockData';
import { Container, Reveal, Badge, FieldLabel } from './ui';

interface FarmerInputFormProps {
  language: Language;
  initialCrop?: CropType;
  initialQuantity?: number;
  onSubmit: (lot: ProduceLot) => void;
  isLoading?: boolean;
}

export const FarmerInputForm: React.FC<FarmerInputFormProps> = ({
  language,
  initialCrop = 'Wheat',
  initialQuantity = 45,
  onSubmit,
  isLoading = false,
}) => {
  const t = translations[language];
  const en = language === 'en';

  const [crop, setCrop] = useState<CropType>(initialCrop);
  const [quantityQtl, setQuantityQtl] = useState<number>(initialQuantity);
  const [grade, setGrade] = useState<QualityGrade>('Grade A (Premium)');
  const [moisturePercent, setMoisturePercent] = useState<number>(CROP_CONFIGS[initialCrop]?.standardMoisture || 12);
  const [district, setDistrict] = useState<string>('Alwar (Rajasthan)');
  const [village, setVillage] = useState<string>('Shahjahanpur');
  const [farmerName, setFarmerName] = useState<string>('Devender Choudhary');
  const [farmerPhone, setFarmerPhone] = useState<string>('+91 98290 12345');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);
  const [minPrice, setMinPrice] = useState<string>('');
  const [transportPreference, setTransportPreference] = useState<'platform_pickup' | 'own_vehicle' | 'pooled'>('pooled');

  const cropConfig = CROP_CONFIGS[crop] || CROP_CONFIGS['Wheat'];

  const handleCropChange = (selectedCrop: CropType) => {
    setCrop(selectedCrop);
    const cfg = CROP_CONFIGS[selectedCrop];
    if (cfg) {
      setMoisturePercent(cfg.standardMoisture);
      if (cfg.defaultLocations?.length) setDistrict(cfg.defaultLocations[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: ProduceLot = {
      id: `LOT-${crop.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      farmerId: 'farmer-current-user',
      farmerName: farmerName || 'Farmer',
      farmerPhone: farmerPhone || '+91 98765 43210',
      farmerVillage: village || 'Local Village',
      district: district.split(' ')[0] || 'Alwar',
      state: district.includes('Rajasthan') ? 'Rajasthan' : district.includes('MP') ? 'Madhya Pradesh' : district.includes('UP') ? 'Uttar Pradesh' : 'Haryana',
      crop,
      quantityQuintals: Number(quantityQtl),
      quantityKg: Number(quantityQtl) * 100,
      grade,
      moisturePercent: Number(moisturePercent),
      foreignMatterPercent: grade === 'Grade A (Premium)' ? 0.8 : grade === 'Grade B (Fair/Avg)' ? 1.8 : 3.0,
      harvestDate,
      storageAvailable,
      warehouseDistanceKm: storageAvailable ? 12 : undefined,
      minAcceptablePricePerQtl: minPrice ? Number(minPrice) : undefined,
      status: 'analyzing',
      createdAt: new Date().toISOString(),
    };
    onSubmit(newLot);
  };

  return (
    <Container className="py-8">
      <Reveal>
        <p className="font-mono-num text-[11px] uppercase tracking-[0.18em] text-[#64748B]">
          {en ? 'Step 01 — Describe the lot' : 'चरण 01 — फसल का विवरण'}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-display text-3xl text-[#0F172A] sm:text-4xl">{t.formTitle}</h1>
            <p className="mt-2 max-w-[60ch] text-[14.5px] text-[#64748B]">{t.formSubtitle}</p>
          </div>
          <div className="rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3">
            <p className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-[#64748B]">{en ? 'Benchmark MSP' : 'एमएसपी'}</p>
            <p className="font-mono-num tnum text-lg font-semibold text-[#0F172A]">₹{cropConfig.mspPerQtl} <span className="text-xs font-normal text-[#64748B]">/qtl</span></p>
            <p className="font-mono-num text-[11.5px] text-[#64748B]">Mandi avg ₹{cropConfig.avgModalPrice}</p>
          </div>
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="card-flat overflow-hidden">
          {/* 01 crop */}
          <Reveal>
            <section className="border-b border-[#E2E8F0] p-6 sm:p-8">
              <div className="flex items-baseline gap-3">
                <span className="font-mono-num text-[12px] font-semibold text-[#94A3B8]">01</span>
                <FieldLabel hint={en ? '8 crops supported' : '8 फसलें'}>{t.cropLabel}</FieldLabel>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(Object.keys(CROP_CONFIGS) as CropType[]).map((c) => {
                  const sel = crop === c;
                  const cfg = CROP_CONFIGS[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCropChange(c)}
                      aria-pressed={sel}
                      className={`relative min-h-[64px] rounded-[8px] border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${
                        sel ? 'border-[#047857] bg-[#F8FAFC]' : 'border-[#E2E8F0] bg-white hover:border-[#047857]'
                      }`}
                    >
                      {sel && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#047857] text-white">
                          <Check size={10} weight="bold" />
                        </span>
                      )}
                      <span className="block break-words pr-5 text-[13.5px] font-semibold leading-snug text-[#0F172A]">{c}</span>
                      <span className="block break-words text-[12px] leading-snug text-[#64748B]">{cfg.hindiName.split(' ')[0]}</span>
                      <span className="font-mono-num tnum mt-1.5 block text-[12px] font-semibold text-[#065F46]">₹{cfg.avgModalPrice}/qtl</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </Reveal>

          {/* 02 quantity + grade */}
          <Reveal>
            <section className="grid gap-8 border-b border-[#E2E8F0] p-6 sm:p-8 md:grid-cols-2">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono-num text-[12px] font-semibold text-[#94A3B8]">02</span>
                  <FieldLabel hint={`${(quantityQtl / 10).toFixed(1)}T · ${quantityQtl * 100} kg`}>{t.quantityLabel}</FieldLabel>
                </div>
                <div className="mt-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
                  <input
                    type="number" min={1} max={1000} value={quantityQtl}
                    onChange={(e) => setQuantityQtl(Math.max(1, Number(e.target.value)))}
                    className="field-input font-mono-num tnum w-full text-[16px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" required
                  />
                  <span className="flex min-h-[44px] w-full shrink-0 items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[12.5px] font-semibold text-[#1E293B] min-[480px]:w-auto">
                    {en ? 'Quintal' : 'क्विंटल'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[15, 30, 45, 80, 150].map((p) => (
                    <button key={p} type="button" onClick={() => setQuantityQtl(p)}
                      className={`font-mono-num min-h-[40px] rounded-[6px] border px-3.5 py-2 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${quantityQtl === p ? 'border-[#047857] bg-[#047857] text-white' : 'border-[#E2E8F0] text-[#1E293B] hover:border-[#047857]'}`}>
                      {p} qtl
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <FieldLabel hint={`${en ? 'Standard' : 'मानक'} ${cropConfig.standardMoisture}%`}>{t.moistureLabel}</FieldLabel>
                  <div className="flex items-center gap-4 py-1">
                    <input type="range" min={6} max={85} step={0.5} value={moisturePercent}
                      onChange={(e) => setMoisturePercent(Number(e.target.value))} className="slider-min min-h-[32px] flex-1" aria-label={t.moistureLabel} />
                    <span className="font-mono-num tnum flex min-h-[36px] w-[72px] shrink-0 items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1.5 text-center text-[13px] font-semibold">{moisturePercent}%</span>
                  </div>
                  <p className="mt-2 break-words text-[12px] leading-relaxed text-[#64748B]">
                    {moisturePercent <= cropConfig.standardMoisture
                      ? (en ? 'Within grade — no drying deduction expected.' : 'ग्रेड के भीतर — कटौती नहीं।')
                      : (en ? 'Above standard — buyer may apply drying deduction.' : 'मानक से अधिक — कटौती संभव।')}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono-num text-[12px] font-semibold text-[#94A3B8]">03</span>
                  <FieldLabel>{t.qualityLabel}</FieldLabel>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(['Grade A (Premium)', 'Grade B (Fair/Avg)', 'Grade C (Standard)'] as QualityGrade[]).map((g) => (
                    <button key={g} type="button" onClick={() => setGrade(g)} aria-pressed={grade === g}
                      className={`min-h-[64px] rounded-[8px] border p-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${grade === g ? 'border-[#047857] bg-[#047857] text-white' : 'border-[#E2E8F0] hover:border-[#047857]'}`}>
                      <span className="block break-words text-[13px] font-bold leading-snug">{g.split(' ')[1]}</span>
                      <span className={`mt-1 block break-words text-[11px] leading-snug ${grade === g ? 'text-white/70' : 'text-[#64748B]'}`}>
                        {g.includes('Premium') ? (en ? 'Top bid' : 'उत्तम') : g.includes('Fair') ? (en ? 'Average' : 'मध्यम') : (en ? 'Base' : 'सामान्य')}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <FieldLabel hint={en ? 'Optional' : 'ऐच्छिक'}>{t.minPriceLabel}</FieldLabel>
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 2400"
                      className="field-input font-mono-num tnum min-h-[44px]" />
                  </div>
                  <div>
                    <FieldLabel>{t.harvestDateLabel}</FieldLabel>
                    <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="field-input min-h-[44px]" />
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 04 location + logistics */}
          <Reveal>
            <section className="grid gap-8 p-6 sm:p-8 md:grid-cols-2">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono-num text-[12px] font-semibold text-[#94A3B8]">04</span>
                  <FieldLabel>{t.locationLabel}</FieldLabel>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <MapPin size={15} weight="bold" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <select value={district} onChange={(e) => setDistrict(e.target.value)} className="field-input min-h-[44px] pl-9 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                      {cropConfig.defaultLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                      <option value="Jaipur (Rajasthan)">Jaipur (Rajasthan)</option>
                      <option value="Bhopal (MP)">Bhopal (Madhya Pradesh)</option>
                      <option value="Mathura (UP)">Mathura (Uttar Pradesh)</option>
                      <option value="Ludhiana (Punjab)">Ludhiana (Punjab)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                    <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder={en ? 'Village' : 'गांव'} className="field-input min-h-[44px]" />
                    <input value={farmerName} onChange={(e) => setFarmerName(e.target.value)} placeholder={en ? 'Farmer name' : 'किसान का नाम'} className="field-input min-h-[44px]" />
                  </div>
                  <input value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} placeholder={en ? 'Mobile number' : 'मोबाइल नंबर'} className="field-input font-mono-num min-h-[44px]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono-num text-[12px] font-semibold text-[#94A3B8]">05</span>
                  <FieldLabel>{en ? 'Storage + transport' : 'भंडारण + परिवहन'}</FieldLabel>
                </div>
                <div className="mt-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2 break-words text-[13.5px] font-semibold leading-snug text-[#0F172A]">
                      <Warehouse size={16} weight="bold" className="shrink-0" /> {en ? 'Warehouse access' : 'गोदाम सुविधा'}
                    </span>
                    <button type="button" onClick={() => setStorageAvailable(!storageAvailable)} role="switch" aria-checked={storageAvailable}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#047857] after:absolute after:-inset-3 after:content-[''] ${storageAvailable ? 'bg-[#047857]' : 'bg-[#CBD5E1]'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${storageAvailable ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <p className="mt-2 break-words text-[12.5px] leading-relaxed text-[#64748B]">
                    {storageAvailable ? (en ? 'Unlocks the store-and-sell-later comparison.' : 'बाद में बेचने वाला विकल्प खुलेगा।') : (en ? 'Storage channel will be deprioritised.' : 'भंडारण विकल्प कम प्राथमिकता पर।')}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {([
                    { id: 'pooled', label: en ? 'Pooled' : 'सामूहिक', sub: '−45%' },
                    { id: 'platform_pickup', label: en ? 'Pickup' : 'उठाव', sub: en ? 'Doorstep' : 'खेत से' },
                    { id: 'own_vehicle', label: en ? 'Self' : 'स्वयं', sub: en ? 'Own' : 'निजी' },
                  ] as const).map((o) => (
                    <button key={o.id} type="button" onClick={() => setTransportPreference(o.id)} aria-pressed={transportPreference === o.id}
                      className={`min-h-[56px] rounded-[8px] border p-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${transportPreference === o.id ? 'border-[#047857] bg-[#F8FAFC]' : 'border-[#E2E8F0] hover:border-[#047857]'}`}>
                      <span className="block break-words text-[12.5px] font-bold leading-snug text-[#0F172A]">{o.label}</span>
                      <span className="font-mono-num mt-0.5 block break-words text-[11px] leading-snug text-[#64748B]">{o.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]/60 p-6 pt-7 sm:p-8 sm:pt-9">
            <button type="submit" disabled={isLoading} className="btn-ink flex min-h-[48px] w-full items-center justify-center gap-2 px-5 py-3.5 text-[15px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
              <Leaf size={17} weight="bold" />
              {isLoading ? t.loadingCalculation : t.analyzeButton}
              {!isLoading && <ArrowRight size={17} weight="bold" />}
            </button>
            <p className="mt-3 break-words text-center text-[12px] leading-relaxed text-[#64748B]">
              {en ? 'Net realization across buyer, mandi, pooling and storage — after all deductions.' : 'खरीदार, मंडी, समूह और भंडारण — सभी कटौतियों के बाद शुद्ध गणना।'}
            </p>
          </div>
        </div>
      </form>
    </Container>
  );
};
