import React, { useState, useEffect, useRef } from 'react';
import { Sparkle, PaperPlaneTilt, X } from '@phosphor-icons/react';
import { Language, ProduceLot, RecommendationResult } from '../types';
import { inr } from './ui';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  lot?: ProduceLot;
  recommendation?: RecommendationResult;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, language, lot, recommendation }) => {
  const en = language === 'en';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome', sender: 'assistant',
        text: en
          ? `Namaste. I have your ${lot?.quantityQuintals || 45} qtl of ${lot?.crop || 'Wheat'} in context — best net ${recommendation ? inr(recommendation.recommendedOption.netRealization) : ''} via ${recommendation?.recommendedOption.optionType || 'direct buyer'}. Ask about mandi fees, storage risk, or pooling savings.`
          : `नमस्ते। आपकी ${lot?.quantityQuintals || 45} क्विंटल ${lot?.crop || 'गेहूं'} का विश्लेषण तैयार है। मंडी खर्च, भंडारण या समूह बचत पूछें।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: en
          ? ['Why not mandi?', 'Store 30 days?', 'Pooling savings?']
          : ['मंडी क्यों नहीं?', '30 दिन रोकूं?', 'समूह बचत?'],
      }]);
    }
  }, [isOpen, language]); // eslint-disable-line

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  const send = async (preset?: string) => {
    const text = (preset || input).trim();
    if (!text || loading) return;
    setMessages((p) => [...p, { id: `u-${Date.now()}`, sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text, language, lot,
          recommendationSummary: recommendation ? {
            crop: lot?.crop, quantityQuintals: lot?.quantityQuintals,
            recommendedOptionTitle: recommendation.recommendedOption.title,
            recommendedNetRealization: recommendation.recommendedOption.netRealization,
            advantageOverMandi: recommendation.netAdvantageOverMandi,
            allOptions: recommendation.allOptions.map((o) => ({ type: o.optionType, netRealization: o.netRealization, netPerQtl: o.netRealizationPerQtl })),
          } : undefined,
        }),
      });
      if (!res.ok) throw new Error('advisor failed');
      const data = await res.json();
      const raw = data.advice;
      const reply = typeof raw === 'string' ? raw : raw?.explanation || raw?.summary || JSON.stringify(raw);
      setMessages((p) => [...p, { id: `a-${Date.now()}`, sender: 'assistant', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch {
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, sender: 'assistant',
        text: en
          ? `On current math: ${recommendation?.recommendedOption.title || 'direct buyer'} nets ${recommendation ? inr(recommendation.recommendedOption.netRealization) : ''} — the edge comes from lower freight, no mandi cess, and faster settlement.`
          : `वर्तमान गणना पर ${recommendation?.recommendedOption.title || 'सीधा खरीदार'} सर्वोत्तम है।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="AI advisor">
      <div className="overlay-fade absolute inset-0 bg-[#047857]/40" onClick={onClose} />
      <aside className="drawer-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#E2E8F0] bg-[#F1F5F9]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#047857] text-white"><Sparkle size={16} weight="fill" /></span>
            <div className="min-w-0">
              <p className="break-words text-[13.5px] font-bold leading-snug">{en ? 'Market advisor' : 'बाजार सलाहकार'}</p>
              <p className="font-mono-num mt-1 break-words text-[11px] leading-relaxed text-[#64748B]">{lot?.crop} · {lot?.quantityQuintals} qtl {en ? 'in context' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[6px] border border-[#E2E8F0] hover:border-[#047857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" aria-label="Close advisor"><X size={15} weight="bold" /></button>
        </div>

        <div className="thin-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-[8px] border px-4 py-3 text-[13.5px] leading-relaxed ${m.sender === 'user' ? 'border-[#047857] bg-[#047857] text-white' : 'border-[#E2E8F0] bg-white text-[#1E293B]'}`}>
                <p className="break-words">{m.text}</p>
                <p className={`font-mono-num mt-1.5 text-[10.5px] ${m.sender === 'user' ? 'text-white/60' : 'text-[#94A3B8]'}`}>{m.timestamp}</p>
                {m.suggestedActions && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {m.suggestedActions.map((a) => (
                      <button key={a} onClick={() => send(a)} className="min-h-[40px] rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] font-semibold leading-snug text-[#0F172A] hover:border-[#047857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">{a}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <p className="font-mono-num px-1 text-[12px] text-[#64748B]">{en ? 'Reading ledger…' : 'पढ़ रहा है…'}</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-[#E2E8F0] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={en ? 'Ask about net, fees, storage…' : 'शुद्ध, फीस, भंडारण पूछें…'} className="field-input min-h-[44px]" aria-label="Ask advisor" />
            <button type="submit" disabled={loading || !input.trim()} className="btn-ink flex h-[44px] w-[44px] shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" aria-label="Send">
              <PaperPlaneTilt size={17} weight="bold" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
