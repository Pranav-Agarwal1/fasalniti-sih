import React, { useEffect, useRef, useState } from 'react';
import {
  Plant,
  GlobeHemisphereWest,
  Sparkle,
  ArrowRight,
  List,
  X,
} from '@phosphor-icons/react';
import { Language, UserRole, AppView } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageToggle: () => void;
  onOpenAiAdvisor: () => void;
  onStartNewAnalysis?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userRole,
  onRoleChange,
  language,
  onLanguageToggle,
  onOpenAiAdvisor,
  onStartNewAnalysis,
}) => {
  const t = translations[language];
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const desktopNavMeasureRef = useRef<HTMLElement>(null);
  const [desktopNavFits, setDesktopNavFits] = useState(false);

  const links: { view: AppView; label: string }[] = [
    { view: 'landing', label: t.navHome },
    { view: 'input', label: t.navAddProduce },
    { view: 'compare', label: t.navCompare },
    { view: 'aggregation', label: t.navAggregation },
    { view: 'trends', label: t.navTrends },
    { view: 'logistics', label: t.navLogistics },
  ];

  const roles: { id: UserRole; label: string }[] = [
    { id: 'farmer', label: language === 'en' ? 'Farmer' : 'किसान' },
    { id: 'buyer', label: language === 'en' ? 'Buyer' : 'खरीदार' },
    { id: 'aggregator', label: 'FPO' },
    { id: 'admin', label: language === 'en' ? 'Admin' : 'प्रशासन' },
  ];

  const go = (view: AppView) => {
    setMobileOpen(false);
    onNavigate(view);
  };

  // The 1536px breakpoint is only an eligibility threshold. Measure the actual
  // header so a translated label or a narrower window still falls back to the
  // menu instead of clipping the nav.
  useEffect(() => {
    const measure = () => {
      const inner = headerInnerRef.current;
      const candidate = desktopNavMeasureRef.current;
      if (!inner || !candidate || window.innerWidth < 1536) {
        setDesktopNavFits(false);
        return;
      }
      const brand = inner.querySelector<HTMLElement>('[data-navbar-brand]');
      const actions = inner.querySelector<HTMLElement>('[data-navbar-actions]');
      const reserved = (brand?.getBoundingClientRect().width || 0) + (actions?.getBoundingClientRect().width || 0) + 48;
      setDesktopNavFits(candidate.scrollWidth + reserved <= inner.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (headerInnerRef.current) observer.observe(headerInnerRef.current);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [language]);

  return (
    <header className="sticky top-0 z-40">
      {/* utility strip */}
      <div className="bg-[#047857] text-[#CBD5E1]">
        <div className="mx-auto flex min-h-[44px] w-full max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[12px] sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7FB08A]" />
            <span className="min-w-0 truncate font-medium tracking-wide sm:whitespace-normal" title={language === 'en' ? 'Net realization engine · Live' : 'शुद्ध कमाई इंजन · लाइव'}>
              {language === 'en' ? 'Net realization engine · Live' : 'शुद्ध कमाई इंजन · लाइव'}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center rounded-[6px] border border-white/15 bg-white/5 p-[2px] sm:flex" role="tablist" aria-label="Role">
              {roles.map((r) => (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={userRole === r.id || (r.id === 'aggregator' && userRole === 'fpo')}
                  onClick={() => onRoleChange(r.id)}
                  className={`inline-flex min-h-[40px] items-center rounded-[4px] px-2.5 py-1 text-[11.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    userRole === r.id || (r.id === 'aggregator' && userRole === 'fpo')
                      ? 'bg-white text-[#0F172A]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={onLanguageToggle}
              className="inline-flex min-h-[40px] min-w-[44px] items-center justify-center gap-1.5 rounded-[4px] border border-white/15 px-2.5 py-1 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <GlobeHemisphereWest size={13} weight="bold" />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md">
        <div ref={headerInnerRef} className="navbar-main-inner mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
          <button data-navbar-brand onClick={() => go('landing')} className="flex min-h-[44px] min-w-0 shrink items-center gap-2.5 rounded-[6px] py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]" aria-label="FasalNiti home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#047857] text-white">
              <Plant size={20} weight="fill" />
            </span>
            <span className="min-w-0 leading-none">
              <span className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-tight text-[#0F172A]">FASALNITI</span>
                <span className="navbar-brand-badge badge badge-neutral hidden sm:inline-flex">Decision AI</span>
              </span>
              <span className="navbar-brand-tagline mt-1 hidden text-[11.5px] font-medium text-[#64748B] sm:block">
                {language === 'en' ? 'Net realization intelligence' : 'शुद्ध कमाई निर्णय प्रणाली'}
              </span>
            </span>
          </button>

          <nav className={`${desktopNavFits ? 'flex' : 'hidden'} min-w-0 flex-1 items-center justify-center gap-0.5`} aria-label="Primary">
            {links.map((l) => (
              <button
                key={l.view}
                onClick={() => go(l.view)}
                className={`inline-flex min-h-[40px] items-center whitespace-nowrap rounded-[6px] px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] 2xl:px-3 2xl:text-[13.5px] ${
                  currentView === l.view
                    ? 'bg-[#F8FAFC] text-[#0F172A] font-semibold'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div data-navbar-actions className="flex shrink-0 items-center gap-2">
            <button
              onClick={onOpenAiAdvisor}
              className="navbar-ai-advisor btn-paper hidden min-h-[44px] items-center gap-1.5 px-3.5 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] sm:inline-flex"
            >
              <Sparkle size={15} weight="bold" />
              {language === 'en' ? 'AI Advisor' : 'AI सलाह'}
            </button>
            <button
              onClick={() => (onStartNewAnalysis ? onStartNewAnalysis() : go('input'))}
              className="navbar-new-analysis btn-ink inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
              aria-label={language === 'en' ? 'Start a new analysis' : 'नया विश्लेषण शुरू करें'}
            >
              <span className="navbar-new-analysis-label">{language === 'en' ? 'New analysis' : 'नया विश्लेषण'}</span>
              <ArrowRight size={15} weight="bold" />
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`${desktopNavFits ? 'hidden' : 'inline-flex'} btn-paper h-11 w-11 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]`}
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={17} weight="bold" /> : <List size={17} weight="bold" />}
            </button>
          </div>
        </div>

        <nav ref={desktopNavMeasureRef} aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 flex whitespace-nowrap opacity-0">
          {links.map((l) => <span key={l.view} className="px-3 py-2 text-[13.5px]">{l.label}</span>)}
        </nav>

        {/* mobile panel */}
        {mobileOpen && (
          <div className="border-t border-[#E2E8F0] bg-white px-4 py-5 sm:px-6 xl:hidden">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {links.map((l) => (
                <button
                  key={l.view}
                  onClick={() => go(l.view)}
                  className={`min-h-[48px] rounded-[8px] border px-4 py-3 text-left text-[13px] font-medium leading-relaxed break-words focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${
                    currentView === l.view
                      ? 'border-[#047857] bg-[#F8FAFC] text-[#0F172A]'
                      : 'border-[#E2E8F0] text-[#1E293B]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Role">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onRoleChange(r.id);
                    setMobileOpen(false);
                  }}
                  className={`inline-flex min-h-[44px] shrink-0 items-center rounded-[6px] border px-4 py-2 text-[12.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857] ${
                    userRole === r.id ? 'border-[#047857] bg-[#047857] text-white' : 'border-[#E2E8F0] text-[#1E293B]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <button onClick={() => { onOpenAiAdvisor(); setMobileOpen(false); }} className="btn-paper inline-flex min-h-[44px] shrink-0 items-center gap-1.5 px-4 py-2 text-[12.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]">
                <Sparkle size={14} weight="bold" /> AI
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
