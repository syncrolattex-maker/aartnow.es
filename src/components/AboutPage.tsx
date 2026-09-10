import React, { useState, useEffect } from 'react';
import Header from './Header';
import StickyBar from './StickyBar';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import ExplosiveList, { ExplosiveLineItem } from './ExplosiveList';
import SmoothScroll from './SmoothScroll';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';

export default function AboutPage() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Asegurar registro de Cal.com para el botón de programar llamada
    const w = window as any;
    if (w.Cal && w.Cal.ns && w.Cal.ns['15min']) {
      try {
        w.Cal.ns['15min']('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } catch {
        // silent
      }
    }
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
      {/* Fondo 100% negro puro, sin WebGL 3D, sin dither ni ruido */}
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
        {/* Cursor y semitono interactivo */}
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />

        {/* Floating Menu */}
        <Header />

        {/* Fullwidth Line-by-Line Explosive Experience con textos dinámicos multi-idioma (ES / VAL / EN) */}
        <main className="w-full flex-1 pt-[34vh] relative z-10 flex flex-col items-center justify-center">
          <ExplosiveList items={t.aboutBioLines} />

          {/* Bloque final a pie de página: Contacto e Ilustración al final de la página encima del subfooter */}
          <section className="w-full min-h-[calc(100vh-112px)] mt-[14vh] flex flex-col items-center justify-between px-6 sm:px-10 md:px-16 text-center pb-16 sm:pb-20">
            <div className="w-full max-w-[1240px] mx-auto space-y-8 text-center flex flex-col items-center justify-center my-auto pt-8">
              
              {/* Enlaces de contacto (Email, LinkedIn, Instagram) */}
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-base sm:text-lg md:text-xl font-light text-white/80">
                <a
                  href="mailto:prologmac@gmail.com"
                  data-cursor-text="EMAIL"
                  className="text-white hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/30"
                >
                  info@aartnow.es
                </a>
                <span className="text-white/25 hidden sm:inline">/</span>
                <a
                  href="https://www.linkedin.com/in/aaron-almarche-457a6b55/"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-text="LINKEDIN"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  LinkedIn ↗
                </a>
                <span className="text-white/25 hidden sm:inline">/</span>
                <a
                  href="https://www.instagram.com/aaron_primdesign/"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-text="INSTAGRAM"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Instagram ↗
                </a>
              </div>

              {/* Los 2 botones de Contact */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md mx-auto pt-2">
                {/* 1. Programar una llamada (Cal.com popup) */}
                <button
                  type="button"
                  data-cal-link="aaron-primo-jacnmp/15min"
                  data-cal-namespace="15min"
                  data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                  data-magnetic="true"
                  data-cursor-text="CAL.COM"
                  className="w-full sm:w-1/2 min-h-[52px] px-6 py-3.5 bg-[#F5F2EB] hover:bg-white text-black text-xs font-mono font-normal uppercase tracking-wider rounded-md transition-colors text-center cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  {t.scheduleCallBtn}
                </button>

                {/* 2. Comenzar un proyecto */}
                <button
                  type="button"
                  onClick={(e) => handleNavClick('/contact', e)}
                  data-magnetic="true"
                  data-cursor-text="CONTACT"
                  className="w-full sm:w-1/2 min-h-[52px] px-6 py-3.5 bg-black hover:bg-white/10 text-white border border-white/25 hover:border-white text-xs font-mono font-normal uppercase tracking-wider rounded-md transition-all text-center cursor-pointer"
                >
                  {t.startProjectBtn}
                </button>
              </div>
            </div>

            {/* Ilustración al final de la página encima del subfooter */}
            <div className="relative flex items-end justify-center select-none pointer-events-none mt-10 sm:mt-14">
              <img
                src="/images/about-portrait-open.jpg"
                alt="Aaron Primo Almarche - Mente creativa"
                className="w-auto h-[260px] sm:h-[340px] md:h-[400px] lg:h-[460px] aspect-[764/1024] object-contain pointer-events-none drop-shadow-[0_0_50px_rgba(255,255,255,0.07)]"
                loading="eager"
                decoding="async"
              />
            </div>
          </section>
        </main>

        {/* Subfooter inferior estándar (StickyBar con idiomas y reloj) */}
        <StickyBar />
      </div>
    </SmoothScroll>
  );
}
