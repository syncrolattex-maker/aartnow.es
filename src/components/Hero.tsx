import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';
import GlitchText from './GlitchText';

export default function Hero() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. GSAP Hero Text & Element Entrance Reveal
      gsap.from('.hero-reveal', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
      });

      // 2. GSAP Infinite Marquee Ribbon (Continuous Seamless Loop)
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 18,
          ease: 'none',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const marqueeItems = [
    'AWWWARDS Site of the Day',
    'FWA of the Month x3',
    'React 19 Ecosystem',
    'WebGL & GLSL Shaders',
    'GSAP 3 Motion Engine',
    'Three.js 3D Canvas',
    'Tailwind CSS v4',
    'Independent Studio 2026',
  ];

  return (
    <section 
      id="hero"
      ref={containerRef} 
      className="min-h-screen w-full flex flex-col justify-end pt-32 pb-16 px-6 md:px-16 bg-[#000000] relative border-b border-white/10 overflow-hidden"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end relative z-10 mb-16">
        
        {/* Left Main Content */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Badge Label */}
          <div className="hero-reveal inline-flex items-center gap-2 px-3.5 py-1 bg-white/5 backdrop-blur-md border border-white/20 rounded text-[11px] font-sans font-normal uppercase tracking-widest text-white/80">
            <span>{t.heroBadge}</span>
          </div>

          {/* Main H1 Display Headline with GlitchText */}
          <h1 className="hero-reveal text-5xl md:text-7xl lg:text-[5.5vw] font-black uppercase leading-[0.92] tracking-tight text-white font-sans drop-shadow-2xl">
            <GlitchText text={t.heroH1Word1} />{' '}
            <span className="text-white/40"><GlitchText text={t.heroH1Word2} /></span>{' '}
            <GlitchText text={t.heroH1Word3} />{' '}
            <GlitchText text={t.heroH1Word4} />
          </h1>
        </div>

        {/* Right Subtitle & Interactive Showreel Box */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subtítulo con jerarquía regular */}
          <h4 className="hero-reveal text-xl sm:text-2xl md:text-3xl font-sans font-normal text-white leading-snug tracking-tight">
            {t.heroSubtitle}
          </h4>

          {/* Interactive Showreel / About Trigger */}
          <div 
            onClick={(e) => {
              triggerTransition(() => {
                window.history.pushState({}, '', '/about');
                window.dispatchEvent(new Event('popstate'));
                window.scrollTo(0, 0);
              }, { x: e.clientX, y: e.clientY });
            }}
            data-magnetic="true"
            data-cursor-text={t.navAbout}
            className="hero-reveal inline-flex items-center gap-3.5 pt-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-normal text-xs group-hover:scale-110 transition-transform">
              ▶
            </div>
            <div className="flex flex-col font-sans text-xs">
              <span className="text-white font-normal uppercase tracking-wider">{t.heroShowreelTitle}</span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-light">{t.heroShowreelSub} · [ 1:03 ]</span>
            </div>
          </div>
        </div>

      </div>

      {/* GSAP Infinite Marquee Ribbon Ticker */}
      <div className="w-full overflow-hidden border-t border-b border-white/10 py-3 bg-[#050505]/80 backdrop-blur-md relative z-10">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-8 font-sans font-normal text-xs uppercase tracking-widest text-white/70 w-max">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8">
              <span className="hover:text-white transition-colors">{item}</span>
              <span className="text-white/40 font-normal">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
