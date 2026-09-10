import React, { useEffect } from 'react';
import Header from './Header';
import StickyBar from './StickyBar';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import Scene from './WebGL/Scene';
import ExplosiveList from './ExplosiveList';
import SmoothScroll from './SmoothScroll';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';
import { useDecryptText } from './DecryptText';

export default function AboutPage() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();

  const heroTitle = useDecryptText(t.aboutHeroTitle || 'Aaron Almarche');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    triggerTransition(() => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo(0, 0);
    }, { x: e.clientX, y: e.clientY });
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
        <Scene />
        <div className="dither-bg-overlay" />
        <div className="grain-overlay" />
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />
        <Header />
        <StickyBar />

        {/* Main Content */}
        <main className="w-full flex-1 pt-32 sm:pt-36 pb-24 relative z-10">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 space-y-28 md:space-y-36">

            {/* 1. HERO / INTRO SECTION */}
            <section className="space-y-10 border-b border-white/10 pb-16 md:pb-24">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs uppercase tracking-widest text-white/50 font-normal">
                <span>{t.aboutTag}</span>
                <span className="text-[11px] text-white/40 font-mono">EST. 2026 · VALENCIA (ES)</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-none font-sans">
                  {heroTitle}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/70 font-normal tracking-tight font-sans">
                  {t.aboutHeroRole}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
                <div className="md:col-span-8">
                  <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed">
                    {t.aboutHeroBio}
                  </p>
                </div>
                <div className="md:col-span-4 flex flex-col justify-end space-y-3 text-xs text-white/50 font-light border-l border-white/10 pl-6">
                  <div>
                    <span className="text-white font-normal block uppercase text-[10px] tracking-wider mb-1 font-sans">Enfoque</span>
                    <span>CGI · 3D Art · Digital Sculpture · Direction</span>
                  </div>
                  <div>
                    <span className="text-white font-normal block uppercase text-[10px] tracking-wider mb-1 font-sans">Disponibilidad</span>
                    <span className="text-emerald-400">● Proyectos Seleccionados & Marcas</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. EXPLOSIVE LIST SECTION (GSAP Tutorial 112) */}
            <section className="space-y-8 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-4 text-xs uppercase tracking-widest text-white/50">
                <span>{t.aboutManifestoTag}</span>
                <span className="text-white/40 font-light lowercase text-xs">
                  ↓ {t.aboutManifestoHint} ↓
                </span>
              </div>

              {/* The Explosive Typography Canvas */}
              <div className="overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-8 backdrop-blur-xl">
                <ExplosiveList lines={t.aboutExplosiveLines} />
              </div>
            </section>

            {/* 3. PHILOSOPHY & CRAFT SECTION */}
            <section className="space-y-12 border-b border-white/10 pb-20 md:pb-28">
              <div className="text-xs uppercase tracking-widest text-white/50">
                <span>{t.aboutPhilosophyTag}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight font-sans">
                    {t.aboutPhilosophyTitle}
                  </h2>
                </div>
                <div className="lg:col-span-7 space-y-6 text-sm sm:text-base md:text-lg text-white/75 font-light leading-relaxed">
                  <p>{t.aboutPhilosophyP1}</p>
                  <p>{t.aboutPhilosophyP2}</p>
                </div>
              </div>
            </section>

            {/* 4. TECHNICAL CAPABILITIES & SPECIALIZED STACK */}
            <section className="space-y-12 border-b border-white/10 pb-20 md:pb-28">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-white/50">
                <span>{t.aboutCapabilitiesTag}</span>
                <span className="font-mono text-white/30">[ 04 DISCIPLINAS ]</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight font-sans">
                {t.aboutCapabilitiesTitle}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Capability 1 */}
                <div className="p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl transition-all space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">/ 01</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">CINEMA 4D · 3DS MAX</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    {t.aboutC1Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                    {t.aboutC1Desc}
                  </p>
                </div>

                {/* Capability 2 */}
                <div className="p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl transition-all space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">/ 02</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">CORONA · V-RAY</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    {t.aboutC2Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                    {t.aboutC2Desc}
                  </p>
                </div>

                {/* Capability 3 */}
                <div className="p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl transition-all space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">/ 03</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">ARCHVIZ & PRODUCT</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    {t.aboutC3Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                    {t.aboutC3Desc}
                  </p>
                </div>

                {/* Capability 4 */}
                <div className="p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl transition-all space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">/ 04</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">GSAP · THREE.JS · REACT</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    {t.aboutC4Title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                    {t.aboutC4Desc}
                  </p>
                </div>
              </div>
            </section>

            {/* 5. CALL TO ACTION SECTION */}
            <section className="space-y-12 pb-16">
              <div className="text-xs uppercase tracking-widest text-white/50">
                <span>{t.aboutCtaTag}</span>
              </div>

              <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/15 rounded-2xl p-8 sm:p-14 md:p-16 space-y-8 text-center flex flex-col items-center">
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none font-sans max-w-3xl">
                  {t.aboutCtaTitle}
                </h2>
                <p className="text-sm sm:text-base text-white/60 font-light max-w-xl">
                  {t.aboutCtaSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <a
                    href="/contact"
                    onClick={(e) => handleNavClick('/contact', e)}
                    data-magnetic="true"
                    className="px-8 py-4 bg-white text-black font-normal uppercase text-xs tracking-wider rounded-lg hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    {t.aboutCtaContactBtn}
                  </a>
                  <a
                    href="/presupuesto"
                    onClick={(e) => handleNavClick('/presupuesto', e)}
                    data-magnetic="true"
                    className="px-8 py-4 bg-black/60 border border-white/20 text-white font-normal uppercase text-xs tracking-wider rounded-lg hover:border-white/50 transition-all"
                  >
                    {t.aboutCtaBudgetBtn}
                  </a>
                </div>
              </div>
            </section>

            {/* Studio Footer */}
            <footer className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/50 font-light">
              <div className="flex items-center gap-6">
                <span className="text-white font-normal">{t.stickyFreaks}</span>
                <span>info@aartnow.es</span>
              </div>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/aaron_primdesign/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Instagram ↗
                </a>
                <a href="https://www.linkedin.com/in/aaron-almarche-457a6b55/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  LinkedIn ↗
                </a>
              </div>
              <div>
                <span>{t.footerRights}</span>
              </div>
            </footer>

          </div>
        </main>
      </div>
    </SmoothScroll>
  );
}
