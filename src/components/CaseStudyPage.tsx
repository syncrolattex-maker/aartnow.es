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

            {caseItem.websiteUrl && (
              <a
                href={caseItem.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition-all shadow-xl flex-shrink-0"
              >
                VISITAR WEB EN VIVO ↗
              </a>
            )}
          </div>

          <p className="text-base md:text-xl text-white/80 leading-relaxed max-w-3xl font-mono pt-2">
            {caseItem.subtitle}
          </p>
        </div>

        {/* Portada Principal del Proyecto: Imagen Nítida con Borrado/Mezcla Líquida al pasar el Cursor */}
        <div className="w-full h-[50vh] md:h-[70vh] border border-white/15 relative overflow-hidden bg-neutral-900 shadow-2xl">
          <HalftoneCursorTrail src={caseItem.heroImage} type="image" warpStrength={30} influenceRadius={150} />
        </div>

        {/* Services & Core Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-y border-white/15 py-8">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">[ CLIENTE ]</span>
            <span className="text-sm font-bold text-white uppercase font-sans">{caseItem.client}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">[ AÑO ]</span>
            <span className="text-sm font-bold text-white uppercase font-sans">{caseItem.year}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">[ SERVICIOS ]</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {caseItem.services.map((s, i) => (
                <span key={i} className="text-[10px] bg-white/10 text-white px-2 py-0.5 border border-white/15">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-bold">[ PROYECTO ]</span>
            <span className="text-sm font-bold text-white uppercase font-sans">{caseItem.category}</span>
          </div>
        </div>

        {/* Detailed Narrative Section (Overview, Challenge, Solution) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-3 border-b border-white/10 pb-6">
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">[ 01 / VISIÓN GENERAL ]</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-sans">
                <GlitchText text="El Concepto & Visión" />
              </h2>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-mono text-justify">
                {caseItem.overview}
              </p>
            </div>

            <div className="space-y-3 border-b border-white/10 pb-6">
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">[ 02 / EL DESAFÍO ]</span>
              <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
                Retos de Rendimiento & Interfaz
              </h3>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-mono text-justify">
                {caseItem.challenge}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">[ 03 / LA SOLUCIÓN ]</span>
              <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
                Arquitectura & Código Creativo
              </h3>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-mono text-justify">
                {caseItem.solution}
              </p>
            </div>
          </div>

          {/* Metrics & Impact Box */}
          <div className="lg:col-span-5 bg-[#0B0B0B] border border-white/20 p-8 space-y-6 self-start shadow-2xl">
            <span className="text-xs text-white/50 uppercase tracking-widest block font-bold border-b border-white/10 pb-4">
              [ MÉTRICAS E IMPACTO DIRECTO ]
            </span>
            <div className="space-y-6">
              {caseItem.metrics.map((m, i) => (
                <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                  <span className="text-3xl md:text-5xl font-black text-white font-sans block mb-1">
                    {m.value}
                  </span>
                  <span className="text-xs text-white/60 font-bold uppercase">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Galería del Proyecto: Imágenes Nítidas con Borrado/Mezcla Líquida y Recuperación */}
        <div className="space-y-6 pt-12 border-t border-white/15">
          <span className="text-xs text-white/40 uppercase tracking-widest font-bold block">[ GALERÍA VISUAL CON EFECTO DE MEZCLA LÍQUIDA Y RECUPERACIÓN ]</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseItem.gallery.map((imgSrc, i) => (
              <div key={i} className="h-80 md:h-[450px] border border-white/15 relative overflow-hidden bg-neutral-900 shadow-2xl">
                <HalftoneCursorTrail src={imgSrc} type="image" warpStrength={28} influenceRadius={140} />
              </div>
            ))}
          </div>
        </div>

        {/* Next Case Footer Navigation */}
        <div className="pt-16 border-t border-white/20">
          <a
            href={`/cases/${caseItem.nextSlug}`}
            className="group block p-8 md:p-12 bg-[#0B0B0B] border border-white/20 hover:border-white transition-all shadow-2xl text-left"
          >
            <div className="flex justify-between items-center text-xs text-white/50 uppercase tracking-widest mb-3 font-bold">
              <span>[ SIGUIENTE CASO DE ESTUDIO ]</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black uppercase text-white font-sans group-hover:text-white/80 transition-colors">
              <GlitchText text={caseItem.nextTitle} /> ↗
            </h3>
          </a>
        </div>

      </main>
    </div>
  );
}
