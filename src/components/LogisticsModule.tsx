import React, { useState } from 'react';
import { Truck, UsersThree } from '@phosphor-icons/react';
import { Language, CropType } from '../types';
import { calculateLogisticsCost } from '../utils/calculator';
import { Container, Reveal, PageHead, FieldLabel, inr } from './ui';

interface LogisticsModuleProps {
  language: Language;
  onApplyFreight?: (costPerQtl: number) => void;
}

export const LogisticsModule: React.FC<LogisticsModuleProps> = ({ language }) => {
  const en = language === 'en';
  const [distanceKm, setDistanceKm] = useState(28);
  const [quantityQtl, setQuantityQtl] = useState(45);
  const [crop, setCrop] = useState<CropType>('Wheat');

  const solo = calculateLogisticsCost(quantityQtl, distanceKm, crop, false);
  const pooled = calculateLogisticsCost(quantityQtl, distanceKm, crop, true);
  const savings = Math.max(0, solo.totalCost - pooled.totalCost);

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Freight estimator' : 'भाड़ा अनुमान'}
        title={en ? 'What the truck really costs.' : 'ट्रक की असली लागत।'}
        lede="Solo hire against a pooled full-truck load for the same distance and quantity."
      />

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div className="card-flat space-y-5 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><FieldLabel>{en ? 'Distance (km)' : 'दूरी'}</FieldLabel>
                <input type="number" value={distanceKm} onChange={(e) => setDistanceKm(Math.max(1, Number(e.target.value)))} className="field-input font-mono-num tnum min-h-[44px]" /></div>
              <div><FieldLabel>{en ? 'Quantity (qtl)' : 'मात्रा'}</FieldLabel>
                <input type="number" value={quantityQtl} onChange={(e) => setQuantityQtl(Math.max(1, Number(e.target.value)))} className="field-input font-mono-num tnum min-h-[44px]" /></div>
            </div>
            <div><FieldLabel>Crop</FieldLabel>
              <select value={crop} onChange={(e) => setCrop(e.target.value as CropType)} className="field-input min-h-[44px]">
                {['Wheat', 'Mustard', 'Potato', 'Onion', 'Tomato', 'Soybean', 'Cotton', 'Paddy (Rice)'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="border-t border-[#E2E8F0] pt-5">
              <FieldLabel hint={`${distanceKm} km`}>{en ? 'Adjust distance' : 'दूरी बदलें'}</FieldLabel>
              <input type="range" min={5} max={300} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="slider-min mt-2 min-h-[44px]" aria-label="Distance" />
            </div>
          </div>
        </Reveal>

        <Reveal index={1}>
          <div className="grid h-full content-start gap-4">
            <div className="card-flat p-5 sm:p-6">
              <p className="inline-flex items-center gap-1.5 text-[13px] font-bold"><Truck size={16} weight="bold" />{en ? 'Solo hire' : 'अकेले वाहन'}</p>
              <p className="font-mono-num tnum mt-1 text-2xl font-semibold">{inr(solo.totalCost)}</p>
              <p className="font-mono-num text-[12px] text-[#64748B]">{inr(solo.costPerQtl)}/qtl · {inr(solo.costPerKg)}/kg</p>
            </div>
            <div className="card-flat border-[#047857] p-5 sm:p-6" style={{ borderWidth: 1.5 }}>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-bold"><UsersThree size={16} weight="bold" />{en ? 'Pooled truck' : 'सामूहिक ट्रक'}</p>
              <p className="font-mono-num tnum mt-1 text-2xl font-semibold text-[#065F46]">{inr(pooled.totalCost)}</p>
              <p className="font-mono-num text-[12px] text-[#64748B]">{inr(pooled.costPerQtl)}/qtl · {en ? 'save' : 'बचत'} <span className="font-semibold text-[#047857]">{inr(savings)}</span></p>
            </div>
          </div>
        </Reveal>
      </div>
    </Container>
  );
};
