import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import GlitchText from './GlitchText';

export default function Header() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatWeDo, setShowWhatWeDo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [projectTypes, setProjectTypes] = useState<string[]>(['Website']);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSectionLabel, setActiveSectionLabel] = useState('01 HOME');

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuTL = useRef<gsap.core.Timeline | null>(null);

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

  return (
    <>
      {/* Global Backdrop Blur Overlay when Hamburger Menu is Open */}
      <div 
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/70 backdrop-blur-xl z-40 transition-all duration-500 pointer-events-auto ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Fixed Top Centered Header Capsule (Frosted Glass Effect) */}
      <header className="fixed left-1/2 -translate-x-1/2 top-4 z-50 w-[calc(100vw-32px)] max-w-[438px] flex flex-col font-mono pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
          
          {/* Header Bar */}
          <div className="flex justify-between items-center h-12 px-3 relative cursor-pointer border-b border-white/10">
            {/* Logo with 10x10 Matrix SVG */}
            <a href="/" data-magnetic="true" data-cursor-text={t.homeTag} className="flex items-center gap-2 relative z-10 group">
              <div className="w-6 h-6 rounded bg-neutral-900/80 border border-white/20 flex items-center justify-center p-1 group-hover:border-[#A3FF12]">
                <svg viewBox="0 0 10 10" fill="none" className="w-full h-full text-white group-hover:text-[#A3FF12] transition-colors">
                  <rect x="0" y="0" width="2" height="2" fill="currentColor" />
                  <rect x="4" y="0" width="2" height="2" fill="currentColor" />
                  <rect x="8" y="0" width="2" height="2" fill="currentColor" />
                  <rect x="2" y="4" width="2" height="2" fill="currentColor" />
                  <rect x="6" y="4" width="2" height="2" fill="currentColor" />
                  <rect x="0" y="8" width="2" height="2" fill="currentColor" />
                  <rect x="8" y="8" width="2" height="2" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                aartnow<span className="text-[#A3FF12]">.es</span>
              </span>
            </a>

            {/* Center Dynamic Label with GlitchText Effect on Section Scroll */}
            <div className="text-[10px] uppercase text-[#A3FF12] font-bold tracking-widest hidden sm:block">
              [ <GlitchText key={activeSectionLabel} text={activeSectionLabel} /> ]
            </div>

            {/* Menu Toggle Button */}
            <button 
              onClick={handleToggle}
              className="flex flex-col gap-1 py-2 px-2 hover:opacity-75 transition-opacity cursor-pointer z-10"
              aria-label="Toggle Navigation Menu"
            >
              <div className={`h-0.5 w-4 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`h-0.5 w-4 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
              <div className={`h-0.5 w-4 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </button>
          </div>

          {/* GSAP Orchestrated Expandable Menu Panel with GlitchText Menu Items (Frosted Glass Background) */}
          <div 
            ref={menuPanelRef}
            className="overflow-hidden bg-black/70 backdrop-blur-2xl border-t border-white/15 text-white"
          >
            <div className="flex flex-col text-xs uppercase font-mono py-2">
              
              {/* Nav Item: Work */}
              <a 
                href="#work" 
                onClick={closeMenu} 
                className="gsap-menu-item h-12 flex items-center px-4 border-b border-white/10 hover:bg-white/5 hover:text-[#A3FF12] transition-colors relative group"
              >
                <span className="text-[#A3FF12] mr-3">▪</span>
                <span className="text-white font-bold">
                  <GlitchText text={t.navWork} />
                </span>
              </a>

              {/* Nav Item: What We Do (Dropdown) */}
              <div className="gsap-menu-item">
                <button 
                  onClick={() => setShowWhatWeDo(!showWhatWeDo)}
                  className="w-full h-12 flex items-center justify-between px-4 border-b border-white/10 hover:bg-white/5 hover:text-[#A3FF12] transition-colors text-left"
                >
                  <div className="flex items-center">
                    <span className="text-[#A3FF12] mr-3">▪</span>
                    <span className="text-white font-bold">
                      <GlitchText text={t.navWhatWeDo} />
                    </span>
                  </div>
                  <span className="text-white/40">{showWhatWeDo ? '−' : '+'}</span>
                </button>

                {showWhatWeDo && (
                  <div className="bg-black/80 pl-8 border-b border-white/10">
                    {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((sub, idx) => (
                      <a 
                        key={idx} 
                        href="#about" 
                        onClick={closeMenu}
                        className="h-10 flex items-center text-[11px] text-white/70 hover:text-[#A3FF12] border-b border-white/5 last:border-0"
                      >
                        <span className="text-[9px] text-[#A3FF12] mr-2">›</span>
                        <GlitchText text={sub} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav Item: About us */}
              <a 
                href="#about" 
                onClick={closeMenu} 
                className="gsap-menu-item h-12 flex items-center px-4 border-b border-white/10 hover:bg-white/5 hover:text-[#A3FF12] transition-colors"
              >
                <span className="text-[#A3FF12] mr-3">▪</span>
                <span className="text-white font-bold">
                  <GlitchText text={t.navAbout} />
                </span>
              </a>

              {/* Nav Item: Contact & Form Toggle */}
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="gsap-menu-item h-12 flex items-center justify-between px-4 border-b border-white/10 hover:bg-white/5 hover:text-[#A3FF12] transition-colors text-left"
              >
                <div className="flex items-center">
                  <span className="text-[#A3FF12] mr-3">▪</span>
                  <span className="text-white font-bold">
                    <GlitchText text={t.navContact} />
                  </span>
                </div>
                <span className="text-[10px] bg-[#A3FF12] text-black px-2 py-0.5 rounded font-bold">
                  {showForm ? t.closeFormBtn : t.startProjectBtn}
                </span>
              </button>

              {/* Integrated Pitchdeck & Inquiry Form (GSAP Menu Footer) */}
              <div className="gsap-menu-footer">
                {showForm ? (
                  <div className="p-4 bg-[#000000] border-b border-white/10 space-y-4">
                    {formSubmitted ? (
                      <div className="p-4 bg-white/5 border border-[#A3FF12] rounded text-center">
                        <p className="text-[#A3FF12] font-bold text-xs mb-1">{t.successTitle}</p>
                        <p className="text-[10px] text-white/60">{t.successDesc}</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-3">
                        <p className="text-[10px] text-white/50 font-bold uppercase">{t.questionProject}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((type) => {
                            const isSelected = projectTypes.includes(type);
                            return (
                              <button
                                type="button"
                                key={type}
                                onClick={() => toggleProjectType(type)}
                                className={`px-2.5 py-1 rounded text-[10px] transition-all ${
                                  isSelected 
                                    ? 'bg-[#A3FF12] text-black font-bold' 
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
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-[#A3FF12]"
                        />
                        <input 
                          type="email" 
                          required 
                          placeholder={t.emailLabel} 
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-[#A3FF12]"
                        />
                        <textarea 
                          rows={2} 
                          placeholder={t.messageLabel} 
                          className="w-full bg-[#111111] border border-white/10 rounded px-3 py-2 text-[11px] text-white outline-none focus:border-[#A3FF12]"
                        />

                        <button 
                          type="submit" 
                          className="w-full py-2.5 bg-[#A3FF12] text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors"
                        >
                          {t.submitBtn} →
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-3">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="w-full h-11 bg-white/10 hover:bg-[#A3FF12] hover:text-black border border-white/15 rounded flex items-center justify-center font-bold text-xs uppercase transition-all duration-300"
                    >
                      <GlitchText text={t.pitchdeckBtn} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </header>

      {/* Floating Top-Right Contact Card (Frosted Glass Effect) */}
      <a 
        href="#contact" 
        data-magnetic="true"
        data-cursor-text={t.getInTouchBtn}
        className="fixed right-4 top-4 z-40 hidden md:flex items-center gap-3 px-3.5 py-2.5 bg-black/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 rounded-lg text-xs font-mono uppercase text-white hover:border-[#A3FF12] transition-all group shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        <div className="w-6 h-6 rounded-full overflow-hidden bg-[#A3FF12] flex items-center justify-center font-bold text-black text-[10px]">
          VL
        </div>
        <span className="group-hover:text-[#A3FF12] transition-colors">{t.getInTouchBtn}</span>
        <span className="text-[#A3FF12]">→</span>
      </a>
    </>
  );
}
