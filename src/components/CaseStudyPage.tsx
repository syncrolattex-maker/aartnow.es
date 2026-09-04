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

      {/* Main Full-Screen 2-Column Layout */}
      <main className="w-full pt-28 pb-24 space-y-16 lg:space-y-24">
        
        {/* Top Navigation & Meta Information Bar (Full Width) */}
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

        {/* ── BLOQUE 1: HERO EN 2 COLUMNAS (Pantalla Completa) ────────────────── */}
        <section className="w-full px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* Columna 1: Info Principal del Caso */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="px-3.5 py-1.5 bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest inline-block">
                  {caseItem.category}
                </span>
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.2vw] font-black uppercase text-white font-sans tracking-tight leading-[0.92]">
                  <PowerGlitchText text={caseItem.title} as="h1" />
                </h1>
              </div>

              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {caseItem.subtitle || caseItem.overview}
              </p>

              {websiteUrl && (
                <div>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-4 bg-white text-black font-sans font-black uppercase text-xs md:text-sm tracking-wider hover:bg-neutral-200 transition-all shadow-2xl inline-flex items-center gap-3 group"
                  >
                    <span>VISITAR WEBSITE</span>
                    <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                </div>
              )}

              {/* Ficha técnica resumida en Columna 1 */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/15 text-xs uppercase tracking-wider">
                <div>
                  <span className="text-white/40 block mb-1">[ CLIENTE ]</span>
                  <span className="font-bold text-white text-sm">{caseItem.client}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">[ AÑO ]</span>
                  <span className="font-bold text-white text-sm">{caseItem.year}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">[ SERVICIOS ]</span>
                  <span className="font-bold text-white text-xs leading-relaxed">{(caseItem.services || []).join(" / ")}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">[ PLATAFORMA ]</span>
                  <span className="font-bold text-white text-xs">{caseItem.category}</span>
                </div>
              </div>
            </div>

            {/* Columna 2: Imagen Principal con Malla WebGL Deformable */}
            <div className="lg:col-span-7">
              <div className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[75vh] overflow-visible bg-neutral-950/60 shadow-2xl">
                <HalftoneCursorTrail
                  src={caseItem.heroImage}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── BLOQUE 2: DESAFÍO / SOLUCIÓN Y MÉTRICAS EN 2 COLUMNAS ───────────── */}
        <section className="w-full px-6 md:px-12 lg:px-16 border-t border-white/15 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Columna 1: El Desafío y Métricas de Impacto */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans tracking-wide flex items-center gap-3">
                  <span className="w-2 h-2 bg-white inline-block"></span>
                  <GlitchText text="El Desafío" />
                </h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl">
                  {caseItem.challenge}
                </p>
              </div>

              {caseItem.metrics && caseItem.metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-neutral-950/70 border border-white/15 backdrop-blur-md">
                  {caseItem.metrics.map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest block">[ {m.label} ]</span>
                      <span className="text-2xl md:text-3xl font-black text-white font-sans tracking-tight block">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna 2: La Solución */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans tracking-wide flex items-center gap-3">
                  <span className="w-2 h-2 bg-white inline-block"></span>
                  <GlitchText text="La Solución" />
                </h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl">
                  {caseItem.solution}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── BLOQUE 3: GALERÍA DEL PROYECTO EN 2 COLUMNAS (Grid 2 Columnas) ── */}
        <section className="w-full px-6 md:px-12 lg:px-16 space-y-10 border-t border-white/15 pt-16">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white font-sans">
              <GlitchText text="Galería del Proyecto" />
            </h2>
            <span className="text-xs text-white/40 uppercase font-mono tracking-widest hidden sm:block">
              [ {galleryList.length} PIEZAS DE GALERÍA ]
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
            {galleryList.map((imgUrl, i) => (
              <div key={i} className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] overflow-visible bg-neutral-950/60 shadow-2xl">
                <HalftoneCursorTrail
                  src={imgUrl}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── BLOQUE 4: NAVEGACIÓN SIGUIENTE CASO EN 2 COLUMNAS ────────────────── */}
        <section className="w-full px-6 md:px-12 lg:px-16 pt-16 border-t border-white/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs text-white/40 uppercase block tracking-widest">[ SIGUIENTE CASO ]</span>
              <a
                href={`/cases/${caseItem.nextSlug}`}
                onClick={(e) => navigateTo(`/cases/${caseItem.nextSlug}`, e)}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5vw] font-black uppercase text-white font-sans hover:text-white/70 transition-colors cursor-pointer leading-[0.95] block"
              >
                {caseItem.nextTitle} ↗
              </a>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <a
                href="/"
                onClick={(e) => navigateTo('/', e)}
                className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer inline-block"
              >
                VER TODOS LOS TRABAJOS
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}