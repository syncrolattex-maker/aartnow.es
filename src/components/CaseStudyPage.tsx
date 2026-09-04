import { useEffect } from 'react';
import Header from './Header';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import HalftoneCursorTrail from './HalftoneCursorTrail';
import Scene from './WebGL/Scene';
import GlitchText from './GlitchText';
import PowerGlitchText from './PowerGlitchText';
import { casesData } from '../data/casesData';

interface CaseStudyPageProps {
  slug: string;
}

export default function CaseStudyPage({ slug }: CaseStudyPageProps) {
  // Buscar datos del caso o fallback seguro a jack-and-ai
  const caseItem = casesData[slug] || casesData["jack-and-ai"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const navigateTo = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo(0, 0);
  };

  const galleryList = caseItem.gallery || [];
  const websiteUrl = caseItem.websiteUrl || caseItem.siteUrl || "";

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#FFFDF3] font-mono selection:bg-white selection:text-black relative overflow-x-clip">
      <Scene />
      <div className="dither-bg-overlay" />
      <div className="grain-overlay" />
      <Cursor />
      <GlobalAdaptiveHalftoneTrail />
      <Header />

      {/* Main Full-Screen Layout */}
      <main className="w-full pt-28 pb-24 space-y-16 lg:space-y-24">
        
        {/* Top Navigation & Meta Information Bar */}
        <div className="w-full px-6 md:px-12 lg:px-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/15 pb-6">
          <a
            href="/"
            onClick={(e) => navigateTo('/', e)}
            className="text-xs text-white/60 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-2 cursor-pointer group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>VOLVER A TRABAJOS DESTACADOS</span>
          </a>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 font-bold uppercase">
            <span>[ CLIENT: {caseItem.client} ]</span>
            <span>·</span>
            <span>[ YEAR: {caseItem.year} ]</span>
          </div>
        </div>

        {/* Hero Title & Interactive Overview Header */}
        <div className="w-full px-6 md:px-12 lg:px-16 space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4 max-w-5xl">
              <span className="px-3.5 py-1.5 bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest inline-block">
                {caseItem.category}
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7vw] xl:text-[7.5vw] font-black uppercase text-white font-sans tracking-tight leading-[0.92]">
                <PowerGlitchText text={caseItem.title} as="h1" />
              </h1>
            </div>

            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white text-black font-sans font-black uppercase text-xs md:text-sm tracking-wider hover:bg-neutral-200 transition-all shadow-2xl flex items-center gap-3 group shrink-0"
              >
                <span>VISITAR WEBSITE</span>
                <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
              </a>
            )}
          </div>

          <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-4xl leading-relaxed">
            {caseItem.subtitle || caseItem.overview}
          </p>
        </div>

        {/* Hero Media Container — PANTALLA COMPLETA con Malla WebGL Deformable */}
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[82vh] lg:h-[88vh] overflow-visible bg-neutral-950/60 shadow-2xl">
            <HalftoneCursorTrail
              src={caseItem.heroImage}
            />
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/15 text-xs uppercase tracking-wider">
            <div>
              <span className="text-white/40 block mb-1.5">[ CLIENT ]</span>
              <span className="font-bold text-white text-sm">{caseItem.client}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1.5">[ YEAR ]</span>
              <span className="font-bold text-white text-sm">{caseItem.year}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1.5">[ SERVICES ]</span>
              <span className="font-bold text-white text-sm">{(caseItem.services || []).join(" / ")}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1.5">[ PLATFORM ]</span>
              <span className="font-bold text-white text-sm">{caseItem.category}</span>
            </div>
          </div>
        </div>

        {/* Metrics Strip (si existen en los datos) */}
        {caseItem.metrics && caseItem.metrics.length > 0 && (
          <div className="w-full px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-neutral-950/70 border border-white/15 backdrop-blur-md">
              {caseItem.metrics.map((m, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest block">[ {m.label} ]</span>
                  <span className="text-3xl md:text-5xl font-black text-white font-sans tracking-tight block">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenge & Solution Overview */}
        <div className="w-full px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 py-8">
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans tracking-wide flex items-center gap-3">
              <span className="w-2 h-2 bg-white inline-block"></span>
              <GlitchText text="El Desafío" />
            </h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
              {caseItem.challenge}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans tracking-wide flex items-center gap-3">
              <span className="w-2 h-2 bg-white inline-block"></span>
              <GlitchText text="La Solución" />
            </h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
              {caseItem.solution}
            </p>
          </div>
        </div>

        {/* Interactive Case Gallery — PANTALLA COMPLETA */}
        <div className="w-full space-y-16 pt-8">
          <div className="w-full px-6 md:px-12 lg:px-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white font-sans border-b border-white/15 pb-6">
              <GlitchText text="Galería del Proyecto" />
            </h2>
          </div>

          <div className="w-full space-y-16 md:space-y-24">
            {galleryList.map((imgUrl, i) => (
              <div key={i} className="w-full px-4 md:px-8 lg:px-12">
                <div className="relative w-full h-[55vh] sm:h-[68vh] md:h-[78vh] lg:h-[84vh] overflow-visible bg-neutral-950/60 shadow-2xl">
                  <HalftoneCursorTrail
                    src={imgUrl}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Case Study Navigation Strip */}
        <div className="w-full px-6 md:px-12 lg:px-16 pt-20 border-t border-white/15 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-3">
            <span className="text-xs text-white/40 uppercase block tracking-widest">[ SIGUIENTE CASO ]</span>
            <a
              href={`/cases/${caseItem.nextSlug}`}
              onClick={(e) => navigateTo(`/cases/${caseItem.nextSlug}`, e)}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[6vw] font-black uppercase text-white font-sans hover:text-white/70 transition-colors cursor-pointer leading-[0.95] block"
            >
              {caseItem.nextTitle} ↗
            </a>
          </div>

          <a
            href="/"
            onClick={(e) => navigateTo('/', e)}
            className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer shrink-0"
          >
            VER TODOS LOS TRABAJOS
          </a>
        </div>

      </main>
    </div>
  );
}