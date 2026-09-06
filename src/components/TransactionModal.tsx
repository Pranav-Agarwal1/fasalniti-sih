import React, { useState } from 'react';
import { Check, ShieldCheck, Truck, X } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { SellingOptionBreakdown, ProduceLot, Language, TransactionRecord } from '../types';
import { ModalShell, inr } from './ui';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  lot: ProduceLot;
  option: SellingOptionBreakdown;
  onConfirmTransaction: (record: TransactionRecord) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen, onClose, language, lot, option, onConfirmTransaction,
}) => {
  const en = language === 'en';
  const [step, setStep] = useState<'review' | 'confirmed'>('review');
  const [pickupDate, setPickupDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [upi, setUpi] = useState('9829012345@upi');
  const [txnId] = useState(`TXN-FSN-${Date.now().toString().slice(-6)}`);

  if (!isOpen) return null;

  const confirm = () => {
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.5 }, colors: ['#111311', '#2F5D3A', '#EAEAEA'] });
    onConfirmTransaction({
      id: txnId,
      date: new Date().toISOString().split('T')[0],
      farmerId: lot.farmerId,
      farmerName: lot.farmerName,
      buyerOrEntityName: option.title,
      crop: lot.crop,
      quantityQtl: lot.quantityQuintals,
      pricePerQtlAgreed: option.pricePerQtl,
      totalGrossValue: option.grossSaleValue,
      totalDeductions: option.deductions.totalDeductions,
      netPayableToFarmer: option.netRealization,
      status: 'confirmed',
      paymentStatus: 'escrow_locked',
      logisticsDetails: {
        vehicleType: 'Pooled truck',
        driverName: 'Jaswant Singh (RJ-14-GA-8821)',
        driverPhone: '+91 94140 98765',
        pickupScheduledAt: pickupDate,
        status: 'assigned',
      },
    });
    setStep('confirmed');
  };

  return (
    <ModalShell onClose={onClose} label="Confirm deal" maxWidth="max-w-lg">
      <div className="thin-scroll max-h-[90vh] overflow-y-auto">
      {step === 'review' ? (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] px-5 py-5">
            <div className="min-w-0">
              <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-[#64748B]">{en ? 'Confirm deal' : 'सौदा पक्का करें'}</p>
              <p className="font-serif-display mt-1.5 break-words text-xl">{option.title}</p>
              <p className="mt-1 break-words text-[12.5px] leading-relaxed text-[#64748B]">{lot.crop} · {lot.quantityQuintals} qtl · {inr(option.pricePerQtl)}/qtl</p>
            </div>
            <button onClick={onClose} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[6px] border border-[#E2E8F0] hover:border-[#047857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" aria-label="Close"><X size={14} weight="bold" /></button>
          </div>
          <div className="divide-y divide-[#E2E8F0] px-5">
            <div className="flex min-h-[44px] items-center justify-between gap-3 py-3 text-[13px]"><span className="text-[#475569]">{en ? 'Gross' : 'सकल'}</span><span className="font-mono-num tnum font-semibold">{inr(option.grossSaleValue)}</span></div>
            <div className="flex min-h-[44px] items-center justify-between gap-3 py-3 text-[13px]"><span className="text-[#475569]">{en ? 'Deductions' : 'कटौती'}</span><span className="font-mono-num tnum font-semibold">− {inr(option.deductions.totalDeductions)}</span></div>
            <div className="flex min-h-[44px] items-center justify-between gap-3 bg-[#F8FAFC] px-2 py-3 text-[14px] font-bold"><span>{en ? 'You receive' : 'आपको मिलेगा'}</span><span className="font-mono-num tnum">{inr(option.netRealization)}</span></div>
          </div>
          <div className="space-y-3.5 px-5 py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold" htmlFor="pickup">{en ? 'Pickup date' : 'उठाव तिथि'}</label>
                <input id="pickup" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="field-input min-h-[44px]" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold" htmlFor="upi">UPI ID</label>
                <input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} className="field-input font-mono-num min-h-[44px] text-[13px]" />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[12px] text-[#64748B]"><ShieldCheck size={14} weight="bold" />{en ? 'Amount held in escrow until weighment.' : 'तौल तक राशि एस्क्रो में।'}</p>
            <p className="flex items-center gap-1.5 text-[12px] text-[#64748B]"><Truck size={14} weight="bold" />{en ? 'Pooled pickup · driver assigned on confirm.' : 'सामूहिक उठाव।'}</p>
            <button onClick={confirm} className="btn-ink mt-2 min-h-[52px] w-full px-4 py-3 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">{en ? `Lock deal · ${inr(option.netRealization)}` : 'सौदा पक्का करें'}</button>
          </div>
        </>
      ) : (
        <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857]"><Check size={20} weight="bold" /></span>
          <p className="font-serif-display mt-4 text-2xl">{en ? 'Deal locked.' : 'सौदा पक्का।'}</p>
          <p className="font-mono-num mt-2 break-words text-[12px] leading-relaxed text-[#64748B]">{txnId} · {en ? 'Escrow held' : 'एस्क्रो'} · {inr(option.netRealization)}</p>
          <p className="mx-auto mt-3 max-w-[44ch] break-words text-[13px] leading-relaxed text-[#64748B]">{en ? `Pickup ${pickupDate}. Payout to ${upi} after weighment.` : `उठाव ${pickupDate}। तौल के बाद भुगतान।`}</p>
          <button onClick={onClose} className="btn-ink mt-6 min-h-[44px] w-full px-4 py-2.5 text-[13.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">{en ? 'Done' : 'पूर्ण'}</button>
        </div>
      )}
      </div>
    </ModalShell>
  );
};
