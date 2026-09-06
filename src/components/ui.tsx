import React, { useEffect, useRef } from 'react';

/* ---------- formatting ---------- */
export const inr = (n: number) =>
  `₹${Math.round(n).toLocaleString('en-IN')}`;

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  index = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: any;
  key?: React.Key;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ ['--index' as any]: index }}>
      {children}
    </Tag>
  );
}

/* ---------- layout ---------- */
export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full min-w-0 max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function PageHead({
  eyebrow,
  title,
  lede,
  right,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  right?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-wrap items-start justify-between gap-5 pb-6 sm:items-end sm:gap-6">
        <div className="min-w-0 max-w-2xl flex-1">
          <p className="font-mono-num text-[11px] uppercase tracking-[0.18em] text-[#64748B]">{eyebrow}</p>
          <h1 className="font-serif-display mt-2 break-words text-[clamp(2rem,6vw,2.75rem)] text-[#0F172A]">{title}</h1>
          {lede && <p className="mt-3 text-[15px] leading-relaxed text-[#64748B] max-w-[60ch]">{lede}</p>}
        </div>
        {right && <div className="flex w-full items-center gap-2 sm:w-auto">{right}</div>}
      </div>
    </Reveal>
  );
}

export function Card({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card-flat ${hover ? 'card-flat-hover' : ''} ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-num text-[11px] font-medium uppercase tracking-[0.16em] text-[#64748B]">
      {children}
    </p>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'green' | 'blue' | 'yellow' | 'red' | 'neutral' | 'ink'; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      <p className="mx-auto mt-1 max-w-[46ch] text-[13px] leading-relaxed text-[#64748B]">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
      <p className="font-mono-num tnum mt-1 truncate text-[15px] font-semibold text-[#0F172A]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#64748B]">{sub}</p>}
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label className="text-[13px] font-semibold text-[#0F172A]">{children}</label>
      {hint && <span className="text-xs text-[#64748B]">{hint}</span>}
    </div>
  );
}

/* ---------- modal shell ---------- */
export function ModalShell({
  onClose,
  children,
  maxWidth = 'max-w-lg',
  label,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="overlay-fade fixed inset-0 z-50 flex items-end justify-center bg-[#047857]/40 p-0 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={`sheet-up max-h-[calc(100dvh-1rem)] w-full min-w-0 ${maxWidth} overflow-hidden rounded-t-[12px] border border-[#E2E8F0] bg-white sm:max-h-[calc(100dvh-3rem)] sm:rounded-[12px]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
