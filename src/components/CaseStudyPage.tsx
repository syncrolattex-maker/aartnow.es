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
  // Buscar datos del caso o fallback a jack-and-ai
  const caseItem = casesData[slug] || casesData["jack-and-ai"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFDF3] font-mono selection:bg-white selection:text-black relative">
      <Scene />
      <div className="dither-bg-overlay" />
      <div className="grain-overlay" />
      <Cursor />
      <GlobalAdaptiveHalftoneTrail />
      <Header />

      <main className="pt-28 pb-20 px-6 md:px-16 max-w-[1400px] mx-auto space-y-16">
        
        {/* Back Link & Meta Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/15 pb-6">
          <a
            href="/"
            className="text-xs text-white/60 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>VOLVER A TRABAJOS</span>
          </a>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 font-bold uppercase">
            <span>[ CLIENT: {caseItem.client} ]</span>
            <span>·</span>
            <span>[ YEAR: {caseItem.year} ]</span>
          </div>
        </div>

        {/* Hero Section Title & Action Button */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <span className="px-3 py-1 bg-white/10 text-white border border-white/15 rounded-none text-xs font-bold uppercase tracking-widest block w-max mb-3">
                {caseItem.category}
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white font-sans tracking-tight">
                <PowerGlitchText text={caseItem.title} as="h1" />
              </h1>
            </div>

            {caseItem.siteUrl && (
              <a
                href={caseItem.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-white text-black font-sans font-black uppercase text-xs tracking-wider hover:bg-neutral-200 transition-colors shadow-lg flex items-center gap-2"
              >
                <span>VISITAR WEBSITE</span>
                <span>↗</span>
              </a>
            )}
          </div>

          <p className="text-sm md:text-base text-white/80 max-w-3xl leading-relaxed">
            {caseItem.tagline}
          </p>
        </div>

        {/* Hero Image Container con Dithering Líquido al Pasar el Cursor */}
        <div className="relative w-full aspect-video border border-white/15 overflow-hidden bg-neutral-900 shadow-2xl">
          <HalftoneCursorTrail
            src={caseItem.heroImage}
            warpStrength={32}
            gridSize={9}
            decay={0.92}
            influenceRadius={125}
          />
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/15 text-xs uppercase tracking-wider">
          <div>
            <span className="text-white/40 block mb-1">[ CLIENT ]</span>
            <span className="font-bold text-white">{caseItem.client}</span>
          </div>
          <div>
            <span className="text-white/40 block mb-1">[ YEAR ]</span>
            <span className="font-bold text-white">{caseItem.year}</span>
          </div>
          <div>
            <span className="text-white/40 block mb-1">[ SERVICES ]</span>
            <span className="font-bold text-white">{caseItem.services.join(" / ")}</span>
          </div>
          <div>
            <span className="text-white/40 block mb-1">[ PLATFORM ]</span>
            <span className="font-bold text-white">{caseItem.category}</span>
          </div>
        </div>

        {/* Challenge & Solution Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase text-white font-sans tracking-wide">
              <GlitchText text="El Desafío" />
            </h3>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              {caseItem.challenge}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase text-white font-sans tracking-wide">
              <GlitchText text="La Solución" />
            </h3>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              {caseItem.solution}
            </p>
          </div>
        </div>

        {/* Interactive Case Gallery */}
        <div className="space-y-12 pt-8">
          <h2 className="text-2xl md:text-4xl font-bold uppercase text-white font-sans border-b border-white/15 pb-4">
            <GlitchText text="Galería del Proyecto" />
          </h2>

          <div className="grid grid-cols-1 gap-12">
            {caseItem.galleryImages.map((imgUrl, i) => (
              <div
                key={i}
                className="relative w-full aspect-[16/10] border border-white/15 overflow-hidden bg-neutral-900 shadow-2xl"
              >
                <HalftoneCursorTrail
                  src={imgUrl}
                  warpStrength={32}
                  gridSize={9}
                  decay={0.92}
                  influenceRadius={125}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Case Study Navigation */}
        <div className="pt-16 border-t border-white/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-xs text-white/40 uppercase block mb-1">[ SIGUIENTE CASO ]</span>
            <a
              href={`/cases/${caseItem.nextSlug}`}
              className="text-2xl md:text-4xl font-black uppercase text-white font-sans hover:underline"
            >
              {caseItem.nextTitle} ↗
            </a>
          </div>

          <a
            href="/"
            className="px-6 py-3 border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            VER TODOS LOS CASOS
          </a>
        </div>

      </main>
    </div>
  );
}
