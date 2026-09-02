import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import GlitchText from './GlitchText';

export default function Hero() {
  const { t } = useLanguage();
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
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10 mb-16">
        
        {/* Left Main Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Badge Label */}
          <div className="hero-reveal inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-[11px] font-mono uppercase tracking-widest text-[#FF1300]">
            <span>{t.heroBadge}</span>
          </div>

          {/* Main H1 Display Headline with GlitchText */}
          <h1 className="hero-reveal text-5xl md:text-7xl lg:text-[5.2vw] font-black uppercase leading-[0.92] tracking-tight text-white font-sans drop-shadow-2xl">
            <GlitchText text={t.heroH1Word1} />{' '}
            <span className="text-[#FF1300]"><GlitchText text={t.heroH1Word2} /></span>{' '}
            <GlitchText text={t.heroH1Word3} />{' '}
            <GlitchText text={t.heroH1Word4} />
          </h1>
        </div>

        {/* Right Subtitle & Interactive Showreel Box */}
        <div className="lg:col-span-4 space-y-8 lg:pl-6">
          <p className="hero-reveal font-mono text-xs text-white/80 leading-relaxed bg-[#0D0D0D]/90 backdrop-blur-md p-6 border border-white/15 rounded-lg shadow-2xl">
            {t.heroSubtitle}
          </p>

          {/* Interactive Showreel Trigger Box */}
          <div 
            data-magnetic="true"
            data-cursor-text="PLAY SHOWREEL"
            className="hero-reveal bg-[#0D0D0D]/90 backdrop-blur-md border border-white/20 rounded-lg p-4 flex items-center justify-between group hover:border-[#FF1300] transition-all cursor-pointer shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF1300] text-black flex items-center justify-center font-bold text-xs">
                ▶
              </div>
              <div className="flex flex-col font-mono text-xs">
                <span className="text-white font-bold uppercase">{t.heroShowreelTitle}</span>
                <span className="text-[10px] text-white/50 uppercase">{t.heroShowreelSub}</span>
              </div>
            </div>

            <span className="text-xs font-mono text-[#FF1300] group-hover:translate-x-1 transition-transform">
              [ 1:03 ]
            </span>
          </div>
        </div>

      </div>

      {/* GSAP Infinite Marquee Ribbon Ticker */}
      <div className="w-full overflow-hidden border-t border-b border-white/10 py-3 bg-[#050505]/80 backdrop-blur-md relative z-10">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-8 font-mono text-xs uppercase tracking-widest text-white/70 w-max">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8">
              <span className="hover:text-[#FF1300] transition-colors">{item}</span>
              <span className="text-[#FF1300] font-bold">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
