import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';
import GlitchText from './GlitchText';

export default function Header() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatWeDo, setShowWhatWeDo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [projectTypes, setProjectTypes] = useState<string[]>(['Website']);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSectionLabel, setActiveSectionLabel] = useState('01 HOME');

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuTL = useRef<gsap.core.Timeline | null>(null);

  // Desactivar el efecto Dithering al abrir el menú sin alterar nada del diseño del menú
  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-menu-open', 'true');
      document.body.classList.add('menu-open');
    } else {
      document.body.setAttribute('data-menu-open', 'false');
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.setAttribute('data-menu-open', 'false');
      document.body.classList.remove('menu-open');
    };
  }, [isOpen]);

  // IntersectionObserver to track active section and update central header label dynamically
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const workEl = document.getElementById('work');
      const aboutEl = document.getElementById('about');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setActiveSectionLabel('04 CONTACT');
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveSectionLabel('03 SERVICES');
      } else if (workEl && scrollPos >= workEl.offsetTop) {
        setActiveSectionLabel('02 FEATURED WORK');
      } else {
        setActiveSectionLabel(`01 ${t.studioStatus}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [t.studioStatus]);

  // Asegurar registro de Cal.com cuando el menú se abre o conmuta
  useEffect(() => {
    const w = window as any;
    if (w.Cal && w.Cal.ns && w.Cal.ns['15min']) {
      try {
        w.Cal.ns['15min']('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } catch {
        // silent
      }
    }
  }, [isOpen, showForm]);

  // GSAP Orchestrated Timeline Setup (fromTo for 100% reliable visibility)
  useEffect(() => {
    if (!menuPanelRef.current) return;

    gsap.set(menuPanelRef.current, { height: 0, opacity: 0 });

    const tl = gsap.timeline({
      paused: true,
    });

    // 1. Expand Capsule Container Height & Opacity
    tl.to(menuPanelRef.current, {
      height: 'auto',
      opacity: 1,
      duration: 0.4,
      ease: 'power4.inOut',
    })
    // 2. Staggered Entrance of Nav Items with Explicit fromTo
    .fromTo(
      '.gsap-menu-item',
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'power3.out' },
      '-=0.2'
    )
    // 3. Reveal Contact Info & Inquiry Button
    .fromTo(
      '.gsap-menu-footer',
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
      '-=0.15'
    );

    menuTL.current = tl;
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (menuTL.current) {
        menuTL.current.timeScale(1).play();
      }
    } else {
      setIsOpen(false);
      if (menuTL.current) {
        menuTL.current.timeScale(1.6).reverse();
      }
    }
  };

  const closeMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      if (menuTL.current) {
        menuTL.current.timeScale(1.6).reverse();
      }
    }
  };

  const toggleProjectType = (type: string) => {
    setProjectTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      triggerTransition(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
        window.scrollTo(0, 0);
      }, { x: e.clientX, y: e.clientY });
    }
  };

  const handleNavClick = (target: string, e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();

    if (target.startsWith('/')) {
      if (window.location.pathname !== target) {
        triggerTransition(() => {
          window.history.pushState({}, '', target);
          window.dispatchEvent(new Event('popstate'));
          window.scrollTo(0, 0);
        }, { x: e.clientX, y: e.clientY });
      }
      return;
    }

    if (window.location.pathname !== '/') {
      triggerTransition(() => {
        window.history.pushState({}, '', '/' + target);
        window.dispatchEvent(new Event('popstate'));
        setTimeout(() => {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo(0, 0);
        }, 60);
      }, { x: e.clientX, y: e.clientY });
    } else {
      triggerTransition(() => {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
      {/* Global Backdrop Blur Overlay when Hamburger Menu is Open */}
      <div 
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/70 backdrop-blur-xl z-40 transition-all duration-500 pointer-events-auto ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Fixed Top Centered Header Capsule / Card (Matches screenshot CSS) */}
      <header className="fixed left-1/2 -translate-x-1/2 top-4 z-50 w-[calc(100vw-32px)] max-w-[480px] flex flex-col font-sans pointer-events-none">
        <div className="bg-[#000000] border border-white/15 rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-300 pointer-events-auto">
          
          {/* Header Bar */}
          <div 
            data-menu-bar="true"
            data-no-cursor-trail="true"
            onClick={!isOpen ? handleToggle : undefined}
            className={`flex justify-between items-center h-14 px-5 relative cursor-pointer bg-black ${
              isOpen ? 'border-b border-white/10' : ''
            }`}
          >
            {/* Logo with clean mark */}
            <a 
              href="/" 
              onClick={handleLogoClick}
              data-magnetic="true" 
              data-cursor-text={t.homeTag} 
              className="flex items-center gap-2.5 relative z-10 group"
            >
              <div className="w-6 h-6 flex items-center justify-center text-white">
                <svg viewBox="0 0 10 10" fill="currentColor" className="w-5 h-5">
                  <rect x="0" y="0" width="2" height="2" />
                  <rect x="4" y="0" width="2" height="2" />
                  <rect x="8" y="0" width="2" height="2" />
                  <rect x="2" y="4" width="2" height="2" />
                  <rect x="6" y="4" width="2" height="2" />
                  <rect x="0" y="8" width="2" height="2" />
                  <rect x="8" y="8" width="2" height="2" />
                </svg>
              </div>
              {!isOpen && (
                <span className="text-xs font-normal uppercase tracking-wider text-white">
                  aartnow
                </span>
              )}
            </a>

            {/* Center Dynamic Label */}
            <div className="text-[11px] uppercase text-white/80 font-normal tracking-wider select-none text-center">
              <span className="text-white/70">[ <GlitchText key={activeSectionLabel} text={activeSectionLabel} /> ]</span>
            </div>

            {/* Menu Toggle Button: When open, shows the minimalist horizontal dash '—' */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className="w-8 h-8 flex items-center justify-end hover:opacity-75 transition-opacity cursor-pointer z-10"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <div className="w-5 h-[2px] bg-white rounded-full transition-all"></div>
              ) : (
                <div className="flex flex-col gap-1 items-end">
                  <div className="h-[2px] w-4 bg-white"></div>
                  <div className="h-[2px] w-3 bg-white"></div>
                  <div className="h-[2px] w-4 bg-white"></div>
                </div>
              )}
            </button>
          </div>

          {/* GSAP Orchestrated Expandable Menu Panel */}
          <div 
            ref={menuPanelRef}
            data-menu-panel="true"
            style={{ height: 0, opacity: 0 }}
            className={`overflow-hidden bg-[#000000] text-white ${!isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
          >
            <div className="flex flex-col">
              
              {/* Nav Item: Trabajos / Work */}
              <a 
                href="#work" 
                onClick={(e) => handleNavClick('#work', e)} 
                className="gsap-menu-item h-14 flex items-center justify-between px-6 border-b border-white/10 hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  {/* 6-dot matrix icon matching screenshot */}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-white/80 shrink-0">
                    <rect x="1" y="1" width="2" height="2" />
                    <rect x="7" y="1" width="2" height="2" />
                    <rect x="1" y="5" width="2" height="2" />
                    <rect x="7" y="5" width="2" height="2" />
                    <rect x="1" y="9" width="2" height="2" />
                    <rect x="7" y="9" width="2" height="2" />
                  </svg>
                  <span className="text-base sm:text-lg font-normal tracking-tight font-sans text-white">
                    <GlitchText text={t.navWork} />
                  </span>
                </div>
              </a>

              {/* Nav Item: Lo que hago / What We Do (Dropdown with 5-dot cross icon) */}
              <div className="gsap-menu-item">
                <button 
                  onClick={() => setShowWhatWeDo(!showWhatWeDo)}
                  className="w-full h-14 flex items-center justify-between px-6 border-b border-white/10 hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-normal tracking-tight font-sans text-white">
                    <GlitchText text={t.navWhatWeDo} />
                  </span>
                  {/* 5-dot cross icon matching screenshot */}
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 14 14" 
                    fill="currentColor" 
                    className={`text-white/70 shrink-0 transition-transform duration-200 ${showWhatWeDo ? 'rotate-45' : ''}`}
                  >
                    <rect x="6" y="1" width="2" height="2" />
                    <rect x="1" y="6" width="2" height="2" />
                    <rect x="6" y="6" width="2" height="2" />
                    <rect x="11" y="6" width="2" height="2" />
                    <rect x="6" y="11" width="2" height="2" />
                  </svg>
                </button>

                {showWhatWeDo && (
                  <div className="bg-[#0a0a0a] pl-10 pr-6 py-2 border-b border-white/10 space-y-1">
                    {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((sub, idx) => (
                      <a 
                        key={idx} 
                        href="#about" 
                        onClick={(e) => handleNavClick('#about', e)}
                        className="h-10 flex items-center text-xs text-white/70 hover:text-white font-normal transition-colors"
                      >
                        <span className="text-white/30 mr-2 text-[10px]">›</span>
                        <GlitchText text={sub} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav Item: Sobre mí / About us */}
              <a 
                href="/about" 
                onClick={(e) => handleNavClick('/about', e)} 
                className="gsap-menu-item h-14 flex items-center justify-between px-6 border-b border-white/10 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-base sm:text-lg font-normal tracking-tight font-sans text-white">
                  <GlitchText text={t.navAbout} />
                </span>
              </a>

              {/* Nav Item: Contacto / Contact */}
              <a 
                href="/contact" 
                onClick={(e) => handleNavClick('/contact', e)} 
                className="gsap-menu-item h-14 flex items-center justify-between px-6 border-b border-white/10 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-base sm:text-lg font-normal tracking-tight font-sans text-white">
                  <GlitchText text={t.navContact} />
                </span>
              </a>

              {/* Bottom Actions Section (Matches screenshot CSS with original names) */}
              <div className="gsap-menu-footer p-4 sm:p-5 bg-black space-y-3">
                {showForm ? (
                  <div className="p-4 bg-[#0a0a0a] border border-white/15 rounded-md space-y-4">
                    {formSubmitted ? (
                      <div className="p-4 bg-white/5 border border-white/30 rounded text-center">
                        <p className="text-white font-normal text-xs mb-1">{t.successTitle}</p>
                        <p className="text-[10px] text-white/60 font-light">{t.successDesc}</p>
                        <button
                          type="button"
                          onClick={() => { setFormSubmitted(false); setShowForm(false); }}
                          className="mt-3 px-3 py-1 bg-white/10 hover:bg-white hover:text-black rounded text-[10px] uppercase font-normal cursor-pointer"
                        >
                          {t.closeFormBtn}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-white/50 font-normal uppercase">{t.questionProject}</p>
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="text-[10px] text-white/40 hover:text-white uppercase font-normal transition-colors cursor-pointer"
                          >
                            ✕ {t.closeFormBtn}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((type) => {
                            const isSelected = projectTypes.includes(type);
                            return (
                              <button
                                type="button"
                                key={type}
                                onClick={() => toggleProjectType(type)}
                                className={`px-2.5 py-1 rounded text-[10px] transition-all font-normal ${
                                  isSelected 
                                    ? 'bg-[#FFFFFF] text-black' 
                                    : 'bg-white/5 text-white/60 border border-white/10'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>

                        <input 
                          type="text" 
                          required 
                          placeholder={t.nameLabel}
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-white font-normal"
                        />
                        <input 
                          type="email" 
                          required 
                          placeholder={t.emailLabel} 
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-white font-normal"
                        />
                        <textarea 
                          rows={2} 
                          placeholder={t.messageLabel} 
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-white font-normal"
                        />

                        <button 
                          type="submit" 
                          className="w-full py-2.5 bg-[#FFFFFF] text-black font-normal uppercase text-xs rounded hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          {t.submitBtn} →
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Botón Superior: El meu Dossier / Our Pitchdeck */}
                    <button 
                      type="button"
                      onClick={() => {
                        window.open('/dossier.pdf', '_blank');
                      }}
                      className="w-full h-12 bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/40 rounded-md flex items-center justify-center font-sans font-normal text-[11px] sm:text-xs tracking-widest uppercase text-white transition-all cursor-pointer"
                    >
                      <GlitchText text={t.pitchdeckBtn} />
                    </button>

                    {/* Debajo: 2 Botones en color hueso claro (#F5F2EB) */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* 1. Programar una llamada / Schedule a call */}
                      <button 
                        type="button"
                        data-cal-link="aaron-primo-jacnmp/15min"
                        data-cal-namespace="15min"
                        data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                        className="h-12 px-2 bg-[#F5F2EB] hover:bg-white text-black rounded-md flex items-center justify-center font-sans font-normal text-[11px] sm:text-xs uppercase tracking-wider transition-all text-center leading-tight cursor-pointer"
                      >
                        <GlitchText text={t.scheduleCallBtn} />
                      </button>

                      {/* 2. Comenzar un proyecto / Start a project */}
                      <button 
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="h-12 px-2 bg-[#F5F2EB] hover:bg-white text-black rounded-md flex items-center justify-center font-sans font-normal text-[11px] sm:text-xs uppercase tracking-wider transition-all text-center leading-tight cursor-pointer"
                      >
                        <GlitchText text={t.startProjectBtn} />
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </header>

      {/* Floating Top-Right Contact Card */}
      <a 
        href="/contact" 
        onClick={(e) => handleNavClick('/contact', e)}
        data-magnetic="true"
        data-cursor-text={t.getInTouchBtn}
        data-no-cursor-trail="true"
        className="fixed right-4 top-4 z-40 hidden md:flex items-center gap-3 px-3.5 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/15 rounded-lg text-xs font-sans font-normal uppercase text-white hover:border-white/40 transition-all group shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden bg-[#FFFFFF] flex items-center justify-center font-normal text-black text-[10px]">
          VL
        </div>
        <span className="text-white/80 group-hover:text-white transition-colors">{t.getInTouchBtn}</span>
        <span className="text-white/60 group-hover:text-white">→</span>
      </a>
    </>
  );
}
