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

  // Al abrir el menú se oculta y desactiva todo el efecto Dithering
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

      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 md:pt-6 font-mono pointer-events-none selection:bg-white selection:text-black">
        
        {/* Top Capsule Floating Bar */}
        <div className="max-w-[1400px] mx-auto bg-black/90 backdrop-blur-md border border-white/20 px-4 md:px-6 py-3 shadow-2xl flex flex-col pointer-events-auto transition-colors duration-300">
          
          {/* Main Top Header Navigation Row */}
          <div className="flex items-center justify-between w-full">
            
            {/* Left: Studio Logo */}
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                onClick={closeMenu} 
                className="flex items-center gap-2 group text-white hover:text-white/80 transition-colors"
              >
                <div className="w-2.5 h-2.5 bg-white rounded-none group-hover:scale-125 transition-transform" />
                <span className="font-bold text-sm md:text-base tracking-tighter uppercase font-sans">
                  AARTNOW<span className="text-white/40">.ES</span>
                </span>
              </a>
            </div>

            {/* Center: Dynamic Active Section Tracker (Desktop only) */}
            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 bg-white/5">
              <span className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
              <span className="text-white font-bold tracking-wider">{activeSectionLabel}</span>
            </div>

            {/* Right: Actions & Hamburger Menu Trigger */}
            <div className="flex items-center gap-3">
              {/* Presupuesto Button */}
              <a
                href="/presupuesto"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/30 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-white hover:text-black transition-all shadow-sm"
              >
                <span>{t.budgetNavBtn}</span>
                <span className="text-[9px]">↗</span>
              </a>

              {/* Menu Hamburger Toggle Trigger */}
              <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-3.5 py-1.5 border border-white/30 bg-white/10 hover:bg-white hover:text-black text-white text-xs uppercase font-bold tracking-widest transition-all cursor-pointer"
                aria-label="Toggle Menu"
              >
                <span>{isOpen ? '[ CLOSE ]' : '[ MENU ]'}</span>
              </button>
            </div>
          </div>

          {/* GSAP Expandable Menu Capsule Panel */}
          <div 
            ref={menuPanelRef}
            className="overflow-hidden opacity-0 h-0"
          >
            <div className="pt-6 pb-4 border-t border-white/15 mt-4 space-y-6">
              
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-3 text-2xl md:text-4xl font-black uppercase font-sans">
                <a 
                  href="/" 
                  onClick={closeMenu}
                  className="gsap-menu-item text-white hover:text-white/60 transition-colors w-max"
                >
                  <GlitchText text={`01. ${t.navHome}`} />
                </a>

                <a 
                  href="/#work" 
                  onClick={closeMenu}
                  className="gsap-menu-item text-white hover:text-white/60 transition-colors w-max"
                >
                  <GlitchText text={`02. ${t.casesTitle}`} />
                </a>

                {/* Submenu Trigger: What We Do */}
                <div>
                  <button 
                    onClick={() => setShowWhatWeDo(!showWhatWeDo)}
                    className="gsap-menu-item text-white hover:text-white/60 transition-colors w-max flex items-center gap-3 text-left cursor-pointer"
                  >
                    <GlitchText text={`03. ${t.navServices}`} />
                    <span className="text-sm text-white/50">{showWhatWeDo ? '( − )' : '( + )'}</span>
                  </button>

                  {/* What We Do Services Submenu */}
                  {showWhatWeDo && (
                    <div className="pl-6 pt-3 pb-2 space-y-2 text-xs md:text-sm font-mono normal-case text-white/70 border-l border-white/20 mt-2">
                      <div className="hover:text-white transition-colors cursor-pointer font-bold">· Web Design & Development (React, Vite, Three.js)</div>
                      <div className="hover:text-white transition-colors cursor-pointer font-bold">· SEO Optimization & Technical Infrastructure</div>
                      <div className="hover:text-white transition-colors cursor-pointer font-bold">· AI Platforms & Motion Systems</div>
                      <div className="hover:text-white transition-colors cursor-pointer font-bold">· Custom Digital Branding & Graphic Engineering</div>
                    </div>
                  )}
                </div>

                <a 
                  href="/presupuesto" 
                  onClick={closeMenu}
                  className="gsap-menu-item text-white hover:text-white/60 transition-colors w-max"
                >
                  <GlitchText text={`04. ${t.budgetNavBtn}`} />
                </a>

                {/* Submenu Trigger: Start Project Form */}
                <div>
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="gsap-menu-item text-white/90 hover:text-white transition-colors w-max flex items-center gap-3 text-left cursor-pointer"
                  >
                    <GlitchText text={`05. ${t.navContact}`} />
                    <span className="text-sm text-white/50">{showForm ? '( − )' : '( + )'}</span>
                  </button>

                  {/* Start Project Form Submenu */}
                  {showForm && (
                    <div className="mt-4 p-4 md:p-6 bg-neutral-900/90 border border-white/20 text-xs font-mono space-y-4 max-w-xl">
                      {formSubmitted ? (
                        <div className="p-4 bg-white/10 text-white font-bold text-center border border-white/20 space-y-2">
                          <p>✓ ¡Mensaje recibido correctamente!</p>
                          <p className="text-[10px] text-white/70 font-normal">Te responderemos en menos de 24 horas.</p>
                        </div>
                      ) : (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            setFormSubmitted(true);
                          }}
                          className="space-y-4"
                        >
                          <div className="space-y-1">
                            <label className="text-white/60 uppercase block text-[10px] font-bold">[ Tu Nombre / Empresa ]</label>
                            <input 
                              required
                              type="text" 
                              placeholder="Ej. Laura Gómez / Studio 88" 
                              className="w-full px-3 py-2 bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-white/60 uppercase block text-[10px] font-bold">[ Email de Contacto ]</label>
                            <input 
                              required
                              type="email" 
                              placeholder="laura@empresa.com" 
                              className="w-full px-3 py-2 bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-white/60 uppercase block text-[10px] font-bold">[ Tipo de Proyecto ]</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {['Website', 'SEO', 'AI / WebGL', 'Branding'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => toggleProjectType(type)}
                                  className={`px-2.5 py-1 text-[10px] uppercase font-bold border transition-colors ${
                                    projectTypes.includes(type)
                                      ? 'bg-white text-black border-white'
                                      : 'bg-black text-white/70 border-white/20 hover:border-white'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-white/60 uppercase block text-[10px] font-bold">[ Detalles / Mensaje ]</label>
                            <textarea 
                              rows={3}
                              placeholder="Cuéntanos un poco sobre tu proyecto y objetivos..."
                              className="w-full px-3 py-2 bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-white resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-white text-black font-sans font-black uppercase text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            ENVIAR CONSULTA ↗
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </nav>

              {/* Menu Footer Contact Info */}
              <div className="gsap-menu-footer pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-white/50">
                <div>
                  <span className="text-white font-bold block">AARTNOW.ES Studio</span>
                  <span>Madrid / Barcelona / Online</span>
                </div>

                <div className="flex items-center gap-4">
                  <a href="mailto:info@aartnow.es" className="text-white hover:underline font-bold">info@aartnow.es</a>
                  <a href="tel:+34900000000" className="hover:text-white transition-colors">+34 900 000 000</a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </header>
    </>
  );
}
