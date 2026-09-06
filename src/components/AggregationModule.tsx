import React, { useState } from 'react';
import { UsersThree, Truck, ArrowRight, MapPin } from '@phosphor-icons/react';
import { AggregationGroup, Language, ProduceLot } from '../types';
import { MOCK_AGGREGATION_GROUPS } from '../data/mockData';
import { Container, Reveal, Badge, PageHead, inr } from './ui';

interface AggregationModuleProps {
  language: Language;
  currentLot?: ProduceLot;
  onJoinPool: (pool: AggregationGroup) => void;
  onOpenAiAdvisor: () => void;
}

export const AggregationModule: React.FC<AggregationModuleProps> = ({ language, currentLot, onJoinPool }) => {
  const en = language === 'en';
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const pools = MOCK_AGGREGATION_GROUPS;

  const join = (pool: AggregationGroup) => {
    setJoinedId(pool.id);
    onJoinPool(pool);
  };

  return (
    <Container className="py-8">
      <PageHead
        eyebrow={en ? 'Pooling — FPO' : 'समूह — एफपीओ'}
        title={en ? 'Small lots, truck-scale price.' : 'छोटे लॉट, बड़े भाव।'}
        lede="Combine harvests into full-truck loads, split one freight bill, and unlock institutional bids your lot alone cannot reach."
      />

      <Reveal>
        <div className="card-flat flex flex-col gap-3 whitespace-normal break-words bg-[#F8FAFC]/60 p-6 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:gap-x-8 min-[480px]:gap-y-3 sm:p-6">
          <span className="inline-flex items-center gap-2 whitespace-normal break-words text-[13.5px] font-semibold leading-snug"><Truck size={17} weight="bold" className="shrink-0" />{en ? 'Pooled freight up to 45% lower' : 'सामूहिक भाड़ा 45% तक कम'}</span>
          <span className="font-mono-num whitespace-normal break-words text-[12.5px] leading-relaxed text-[#64748B]">
            {en ? 'Your lot' : 'आपका लॉट'}: {(currentLot?.quantityQuintals ?? 45) / 10}T · {currentLot?.crop ?? 'Wheat'}
          </span>
        </div>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {pools.map((pool, i) => {
          const pct = Math.min(100, Math.round((pool.currentQuantityTonnes / pool.targetQuantityTonnes) * 100));
          const joined = joinedId === pool.id;
          return (
            <Reveal key={pool.id} index={i}>
              <div className={`card-flat h-full p-6 sm:p-8 ${joined ? '!border-[#047857]' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-start gap-1.5 whitespace-normal break-words text-[14px] font-bold leading-snug"><UsersThree size={16} weight="bold" className="mt-0.5 shrink-0" />{pool.clusterName}</p>
                    <p className="mt-1.5 flex items-start gap-1 whitespace-normal break-words text-[12px] leading-relaxed text-[#64748B]"><MapPin size={13} weight="bold" className="mt-0.5 shrink-0" />{pool.district} · {pool.crop} · {pool.grade.split(' ')[1]}</p>
                  </div>
                  <span className="shrink-0">{joined ? <Badge tone="ink">{en ? 'Joined' : 'शामिल'}</Badge> : <Badge tone={pool.status === 'locked' ? 'blue' : 'neutral'}>{pool.status}</Badge>}</span>
                </div>
                <div className="mt-5">
                  <div className="flex flex-wrap justify-between gap-2 font-mono-num whitespace-normal break-words text-[11.5px] leading-relaxed text-[#64748B]">
                    <span>{pool.currentQuantityTonnes.toFixed(1)}T / {pool.targetQuantityTonnes.toFixed(0)}T</span>
                    <span>{pct}% · {pool.daysLeftToLock}d {en ? 'left' : 'शेष'}</span>
                  </div>
                  <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="h-full rounded-full bg-[#047857]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC]/70 p-4 min-[420px]:grid-cols-2 sm:p-5">
                  <div className="min-w-0">
                    <p className="font-mono-num text-[10.5px] uppercase tracking-[0.12em] whitespace-normal break-words text-[#64748B]">{en ? 'Pooled price' : 'समूह भाव'}</p>
                    <p className="font-mono-num tnum mt-1 whitespace-normal break-words text-[15px] font-semibold text-[#065F46]">{inr(pool.unlockedPricePerQtl)}<span className="text-[11px] font-normal">/qtl</span></p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono-num text-[10.5px] uppercase tracking-[0.12em] whitespace-normal break-words text-[#64748B]">{en ? 'Solo price' : 'अकेले'}</p>
                    <p className="font-mono-num tnum mt-1 whitespace-normal break-words text-[15px] font-semibold">{inr(pool.individualPricePerQtl)}<span className="text-[11px] font-normal">/qtl</span></p>
                  </div>
                </div>
                <p className="mt-3 whitespace-normal break-words text-[12px] leading-relaxed text-[#64748B]">
                  {pool.participants.length} {en ? 'farmers' : 'किसान'} · {en ? 'freight' : 'भाड़ा'} ₹{pool.pooledLogisticsRatePerKg}/kg {en ? 'vs' : 'बनाम'} ₹{pool.individualLogisticsRatePerKg}/kg · {pool.targetBuyerName}
                </p>
                <button onClick={() => join(pool)} disabled={joined} className={`mt-4 min-h-[48px] w-full px-4 py-3 text-[13px] whitespace-normal break-words focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${joined ? 'btn-paper opacity-60' : 'btn-ink'} inline-flex items-center justify-center gap-1.5`}>
                  {joined ? (en ? 'Joined — see dashboard' : 'शामिल हो गए') : (en ? 'Join pool' : 'समूह में जुड़ें')} {!joined && <ArrowRight size={15} weight="bold" />}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
};
