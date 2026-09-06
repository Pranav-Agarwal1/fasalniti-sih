import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChatCircleText, Clock, PaperPlaneTilt, X } from '@phosphor-icons/react';
import { CounterOfferRecord, Language, NegotiationRecord } from '../types';
import { EmptyState, Badge, inr } from './ui';

type NegotiationViewer = 'farmer' | 'buyer';

interface NegotiationPanelProps {
  language: Language;
  viewer: NegotiationViewer;
  session: NegotiationRecord | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCounterOffer?: (pricePerQtl: number, message: string) => Promise<void> | void;
  onAcceptOffer?: () => Promise<void> | void;
  onRejectOffer?: () => Promise<void> | void;
  emptyTitle?: string;
  emptyBody?: string;
}

function formatTimestamp(timestamp: string, language: Language) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusTone(status: NegotiationRecord['status']): 'green' | 'blue' | 'red' | 'neutral' {
  if (status === 'accepted') return 'green';
  if (status === 'rejected' || status === 'expired') return 'red';
  return 'blue';
}

function statusLabel(status: NegotiationRecord['status'], en: boolean) {
  if (status === 'accepted') return en ? 'Accepted' : 'स्वीकृत';
  if (status === 'rejected') return en ? 'Rejected' : 'अस्वीकृत';
  if (status === 'expired') return en ? 'Expired' : 'समाप्त';
  return en ? 'Active' : 'सक्रिय';
}

function senderLabel(sender: CounterOfferRecord['sender'], en: boolean) {
  if (sender === 'farmer') return en ? 'Farmer counter' : 'किसान का प्रस्ताव';
  return en ? 'Buyer counter' : 'खरीदार का प्रस्ताव';
}

export const NegotiationPanel: React.FC<NegotiationPanelProps> = ({
  language,
  viewer,
  session,
  loading = false,
  error = null,
  onRetry,
  onCounterOffer,
  onAcceptOffer,
  onRejectOffer,
  emptyTitle,
  emptyBody,
}) => {
  const en = language === 'en';
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'counter' | 'accept' | 'reject' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const latestOffer = useMemo(() => {
    if (!session?.counterOffers?.length) return null;
    return session.counterOffers[session.counterOffers.length - 1];
  }, [session]);

  const canRespond = Boolean(
    session?.status === 'active' &&
      (viewer === 'farmer' ? (!latestOffer || latestOffer.sender === 'buyer') : latestOffer?.sender === 'farmer')
  );

  const canAccept = canRespond;
  const waitingForOtherParty = session?.status === 'active' && !canRespond;

  useEffect(() => {
    if (!session) {
      setPrice('');
      setMessage('');
      return;
    }
    const suggestedPrice = latestOffer?.pricePerQtl ?? session.originalOffer.pricePerQtl;
    setPrice(String(suggestedPrice));
    setMessage('');
    setActionError(null);
  }, [session, latestOffer]);

  const runAction = async (action: 'counter' | 'accept' | 'reject', callback?: () => Promise<void> | void) => {
    if (!callback || busy) return;
    setBusy(action);
    setActionError(null);
    try {
      await callback();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : (en ? 'Something went wrong.' : 'कुछ गलत हो गया।'));
    } finally {
      setBusy(null);
    }
  };

  const submitCounter = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setActionError(en ? 'Enter a valid price per quintal.' : 'प्रति क्विंटल सही भाव भरें।');
      return;
    }
    await runAction('counter', () => onCounterOffer?.(parsedPrice, message.trim()));
  };

  if (loading) {
    return (
      <div className="space-y-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4" aria-live="polite">
        <div className="h-3 w-28 animate-pulse rounded bg-[#E2E8F0]" />
        <div className="h-10 w-full animate-pulse rounded bg-[#E2E8F0]" />
        <div className="h-10 w-4/5 animate-pulse rounded bg-[#E2E8F0]" />
        <p className="font-mono-num text-[11px] text-[#64748B]">{en ? 'Loading thread…' : 'बातचीत लोड हो रही है…'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-[#F1C7C9] bg-[#FDEBEC] px-4 py-4" role="alert">
        <p className="text-[13px] font-semibold text-[#9F2F2D]">{en ? 'Negotiation unavailable' : 'बातचीत उपलब्ध नहीं'}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#9F2F2D]">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 min-h-[40px] rounded-[6px] border border-[#D99497] px-3 py-2 text-[12px] font-semibold text-[#9F2F2D] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F2F2D]">
            {en ? 'Try again' : 'फिर कोशिश करें'}
          </button>
        )}
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        title={emptyTitle || (en ? 'No active thread' : 'कोई सक्रिय बातचीत नहीं')}
        body={emptyBody || (en ? 'Offers and counter-offers with verified buyers will appear here with full price history.' : 'सत्यापित खरीदारों के प्रस्ताव और बातचीत का पूरा इतिहास यहां दिखेगा।')}
        action={<span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#64748B]"><ChatCircleText size={15} weight="bold" /> {en ? 'Start from a live buyer offer' : 'लाइव खरीदार प्रस्ताव से शुरू करें'}</span>}
      />
    );
  }

  return (
    <div className="rounded-[8px] border border-[#E2E8F0] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] px-4 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-bold leading-snug break-words">{session.buyerName}</p>
            <Badge tone={statusTone(session.status)}>{statusLabel(session.status, en)}</Badge>
          </div>
          <p className="font-mono-num mt-1 text-[11.5px] text-[#64748B]">{session.id} · {en ? 'Updated' : 'अपडेट'} {formatTimestamp(session.lastUpdated, language)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono-num text-[10.5px] uppercase tracking-[0.12em] text-[#64748B]">{en ? 'Original offer' : 'मूल प्रस्ताव'}</p>
          <p className="font-mono-num tnum mt-0.5 text-[15px] font-semibold">{inr(session.originalOffer.pricePerQtl)}<span className="text-[11px] font-normal text-[#64748B]">/qtl</span></p>
        </div>
      </div>

      <div className="space-y-2 px-4 py-4">
        <div className="flex items-start gap-2.5 rounded-[8px] bg-[#F8FAFC] px-3.5 py-3">
          <Clock size={15} weight="bold" className="mt-0.5 shrink-0 text-[#64748B]" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold leading-snug">{en ? 'Buyer opened the thread' : 'खरीदार ने बातचीत शुरू की'}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#64748B]">{session.originalOffer.message} · {session.originalOffer.quantityQtl} qtl · {formatTimestamp(session.createdAt, language)}</p>
          </div>
        </div>

        {session.counterOffers.map((offer) => (
          <div key={offer.id} className={`flex items-start gap-2.5 rounded-[8px] border px-3.5 py-3 ${offer.sender === viewer ? 'border-[#D7E8DD] bg-[#EDF3EC]' : 'border-[#E2E8F0] bg-white'}`}>
            {offer.sender === viewer ? <ArrowRight size={15} weight="bold" className="mt-0.5 shrink-0 text-[#346538]" /> : <ChatCircleText size={15} weight="bold" className="mt-0.5 shrink-0 text-[#1F6C9F]" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold leading-snug">{senderLabel(offer.sender, en)}</p>
                <span className="font-mono-num tnum shrink-0 text-[12.5px] font-semibold">{inr(offer.pricePerQtl)}/qtl</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[#64748B]">{offer.quantityQtl} qtl · {formatTimestamp(offer.timestamp, language)}</p>
              {offer.message && <p className="mt-1.5 break-words text-[12.5px] leading-relaxed text-[#1E293B]">{offer.message}</p>}
            </div>
          </div>
        ))}
      </div>

      {session.status === 'active' && (
        <div className="border-t border-[#E2E8F0] px-4 py-4">
          {waitingForOtherParty && (
            <p className="mb-3 flex items-center gap-2 text-[12.5px] leading-relaxed text-[#64748B]">
              <Clock size={15} weight="bold" className="shrink-0" />
              {en ? `Waiting for ${viewer === 'farmer' ? 'the buyer' : 'the farmer'} to respond.` : `दूसरे पक्ष के जवाब का इंतज़ार है।`}
            </p>
          )}

          {canRespond && (
            <form onSubmit={submitCounter} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-[0.7fr_1.3fr]">
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-[#1E293B]">{en ? 'Counter price ₹/qtl' : 'प्रति क्विंटल भाव'}</span>
                  <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" type="number" min="1" step="1" className="field-input font-mono-num tnum min-h-[44px]" aria-label="Counter price per quintal" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-[#1E293B]">{en ? 'Message (optional)' : 'संदेश (वैकल्पिक)'}</span>
                  <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={180} className="field-input min-h-[44px]" placeholder={en ? 'Pickup timing, quality note…' : 'उठाव समय, गुणवत्ता नोट…'} aria-label="Counter offer message" />
                </label>
              </div>
              {actionError && <p className="text-[12px] leading-relaxed text-[#9F2F2D]" role="alert">{actionError}</p>}
              <div className="flex flex-col gap-2 min-[480px]:flex-row">
                <button type="submit" disabled={Boolean(busy)} className="btn-paper inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                  <PaperPlaneTilt size={14} weight="bold" /> {busy === 'counter' ? (en ? 'Sending…' : 'भेज रहे हैं…') : (en ? 'Send counter' : 'प्रस्ताव भेजें')}
                </button>
                {canAccept && (
                  <button type="button" disabled={Boolean(busy)} onClick={() => runAction('accept', onAcceptOffer)} className="btn-ink inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-[12.5px] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                    <Check size={14} weight="bold" /> {busy === 'accept' ? (en ? 'Locking…' : 'पक्का हो रहा है…') : (en ? 'Accept latest' : 'स्वीकार करें')}
                  </button>
                )}
                {onRejectOffer && (
                  <button type="button" disabled={Boolean(busy)} onClick={() => runAction('reject', onRejectOffer)} className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[6px] border border-[#E2E8F0] px-4 py-2.5 text-[12.5px] font-semibold text-[#9F2F2D] hover:border-[#D99497] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F2F2D]">
                    <X size={14} weight="bold" /> {busy === 'reject' ? (en ? 'Closing…' : 'बंद हो रहा है…') : (en ? 'Decline' : 'अस्वीकार')}
                  </button>
                )}
              </div>
            </form>
          )}
          {!canRespond && actionError && <p className="text-[12px] leading-relaxed text-[#9F2F2D]" role="alert">{actionError}</p>}
        </div>
      )}
      {session.status !== 'active' && (
        <div className="flex items-center gap-2 border-t border-[#E2E8F0] px-4 py-3 text-[12.5px] leading-relaxed text-[#64748B]">
          <Check size={15} weight="bold" className="shrink-0 text-[#047857]" />
          {en ? 'This price history is locked for your records.' : 'यह भाव इतिहास आपके रिकॉर्ड के लिए सुरक्षित है।'}
        </div>
      )}
    </div>
  );
};
