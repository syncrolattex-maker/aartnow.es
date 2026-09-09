import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import GlitchText from './GlitchText';

interface ServiceItem {
  id: number;
  code: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  capabilities: string[];
  tag: string;
}

export default function ServicesAccordion() {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const [hoveredService, setHoveredService] = useState<ServiceItem | null>(null);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  const services: ServiceItem[] = [
    {
      id: 0,
      code: '(001)',
      num: '01',
      title: t.s01Title,
      subtitle: 'ESTRATEGIA VISUAL & SISTEMAS DE IDENTIDAD',
      description: t.s01Desc,
      tag: 'BRANDING & STRATEGY',
      capabilities: ['Brand Strategy', 'Visual Identity', 'Tone of Voice', 'Design Systems', 'Packaging & Print']
    },
    {
      id: 1,
      code: '(002)',
      num: '02',
      title: t.s02Title,
      subtitle: 'EXPERIENCIA DE USUARIO & ARQUITECTURA DE PRODUCTO',
      description: t.s02Desc,
      tag: 'UX / UI & PRODUCT',
      capabilities: ['UX / UI Architecture', 'Product Design', 'Design Systems', 'Interactive Mockups', 'Design Tokens']
    },
    {
      id: 2,
      code: '(003)',
      num: '03',
      title: t.s03Title,
      subtitle: 'COMPUTACIÓN GRÁFICA & EXPERIENCIAS ESPACIALES',
      description: t.s03Desc,
      tag: 'WEBGL & 3D MOTION',
      capabilities: ['WebGL & Shaders', 'Three.js Motion', '3D Asset Modeling', 'Interactive Scenes', 'Real-Time Graphics']
    },
    {
      id: 3,
      code: '(004)',
      num: '04',
      title: t.s04Title,
      subtitle: 'DESARROLLO WEB DE ALTO RENDIMIENTO & CÓDIGO CREATIVO',
      description: t.s04Desc,
      tag: 'CREATIVE FRONTEND',
      capabilities: ['Creative Frontend', 'React / Next.js', 'Headless CMS', 'Performance Audit', 'Shopify E-Commerce']
    },
    {
      id: 4,
      code: '(005)',
      num: '05',
      title: t.s05Title,
      subtitle: 'CRECIMIENTO DIGITAL & ACTIVOS DE CONVERSIÓN',
      description: t.s05Desc,
      tag: 'GROWTH & MARKETING',
      capabilities: ['Digital Strategy', 'Social Content', 'Performance Campaigns', 'Growth Marketing', 'Analytics & SEO']
    }
  ];

  // GSAP quickTo for smooth cursor following floating badge
  useEffect(() => {
    if (!floatingBadgeRef.current || !containerRef.current) return;

    const xTo = gsap.quickTo(floatingBadgeRef.current, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(floatingBadgeRef.current, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const relX = e.clientX - containerRect.left;
      const relY = e.clientY - containerRect.top;

      xTo(relX + 24);
      yTo(relY - 24);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle row hover effects with GSAP
  const handleMouseEnterRow = (index: number, service: ServiceItem) => {
    setHoveredService(service);

    if (floatingBadgeRef.current) {
      gsap.to(floatingBadgeRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    const titleEl = titleRefs.current[index];
    if (titleEl) {
      gsap.to(titleEl, {
        x: 20,
        color: '#FFFFFF',
        duration: 0.35,
        ease: 'power2.out'
      });
    }

    rowRefs.current.forEach((row, idx) => {
      if (row && idx !== index) {
        gsap.to(row, {
          opacity: 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  };

  const handleMouseLeaveRow = (index: number) => {
    if (floatingBadgeRef.current) {
      gsap.to(floatingBadgeRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.25,
        ease: 'power2.in'
      });
    }

    const titleEl = titleRefs.current[index];
    if (titleEl) {
      gsap.to(titleEl, {
        x: 0,
        duration: 0.35,
        ease: 'power2.out'
      });
    }

    rowRefs.current.forEach((row) => {
      if (row) {
        gsap.to(row, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  };

  // Toggle Accordion with GSAP Smooth Height & Stagger Reveal
  const toggleAccordion = (id: number) => {
    const isCurrentlyOpen = openId === id;
    const nextId = isCurrentlyOpen ? null : id;

    if (openId !== null && contentRefs.current[openId]) {
      const closingEl = contentRefs.current[openId]!;
      const closingIcon = iconRefs.current[openId];

      gsap.to(closingEl, {
        height: 0,
        duration: 0.45,
        ease: 'power3.inOut'
      });

      if (closingIcon) {
        gsap.to(closingIcon, {
          rotation: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }

    if (!isCurrentlyOpen && contentRefs.current[id]) {
      const openingEl = contentRefs.current[id]!;
      const openingIcon = iconRefs.current[id];

      gsap.fromTo(
        openingEl,
        { height: 0 },
        {
          height: 'auto',
          duration: 0.55,
          ease: 'power3.inOut',
          onComplete: () => {
            openingEl.style.height = 'auto';
          }
        }
      );

      if (openingIcon) {
        gsap.to(openingIcon, {
          rotation: 180,
          duration: 0.45,
          ease: 'back.out(1.5)'
        });
      }

      const innerItems = openingEl.querySelectorAll('.gsap-service-reveal');
      if (innerItems.length > 0) {
        gsap.fromTo(
          innerItems,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.45,
            delay: 0.1,
            ease: 'power2.out'
          }
        );
      }
    }

    setOpenId(nextId);
  };

  const handleServiceContact = (serviceTitle: string) => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="w-full relative select-none">
      {/* GSAP Floating Cursor Capsule (Desktop only) */}
      <div
        ref={floatingBadgeRef}
        className="pointer-events-none absolute top-0 left-0 z-30 hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-white text-black rounded-full shadow-[0_8px_32px_rgba(255,255,255,0.25)] opacity-0 scale-75 whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
        <span className="text-[10px] font-sans font-normal uppercase tracking-widest">
          {hoveredService ? hoveredService.tag : 'EXPLORAR'}
        </span>
        <span className="text-xs font-normal">↗</span>
      </div>

      {/* Accordion Rows Spanning 100% Full Width */}
      <div className="w-full border-t border-white/15 flex flex-col">
        {services.map((s, index) => {
          const isOpen = openId === s.id;

          return (
            <div
              key={s.id}
              ref={(el) => { rowRefs.current[index] = el; }}
              onMouseEnter={() => handleMouseEnterRow(index, s)}
              onMouseLeave={() => handleMouseLeaveRow(index)}
              className={`w-full border-b border-white/15 transition-colors duration-300 ${
                isOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
              }`}
            >
              {/* Row Header Button */}
              <button
                type="button"
                onClick={() => toggleAccordion(s.id)}
                data-magnetic="true"
                data-cursor-text={isOpen ? "CERRAR" : "EXPANDIR"}
                className="w-full py-8 md:py-10 px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left cursor-pointer group"
              >
                {/* Left Side: Code & Big Title */}
                <div className="flex items-center gap-6 md:gap-14">
                  <span className="text-xs sm:text-sm text-white/40 font-sans font-light tracking-widest shrink-0">
                    {s.code}
                  </span>
                  <h3
                    ref={(el) => { titleRefs.current[index] = el; }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-normal uppercase text-[#FFFDF3] tracking-tight transition-colors group-hover:text-white"
                  >
                    <GlitchText text={s.title} />
                  </h3>
                </div>

                {/* Right Side: Meta Indicators */}
                <div className="flex items-center gap-6 md:gap-10 self-end md:self-auto">
                  {/* Category Pill (Desktop) */}
                  <span className="hidden xl:inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/60 font-sans font-light">
                    {s.capabilities.length} Entregables
                  </span>

                  {/* Service Number */}
                  <span className="text-2xl sm:text-3xl md:text-4xl font-sans font-normal text-white/30 group-hover:text-white transition-colors">
                    [{s.num}]
                  </span>

                  {/* Custom GSAP Animated Rotating Icon */}
                  <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-white/60 flex items-center justify-center transition-colors">
                    <span
                      ref={(el) => { iconRefs.current[index] = el; }}
                      className="text-xl font-normal text-white inline-block leading-none"
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                </div>
              </button>

              {/* GSAP Expandable Content Area */}
              <div
                ref={(el) => { contentRefs.current[index] = el; }}
                style={{ height: isOpen ? 'auto' : 0, overflow: 'hidden' }}
                className="w-full bg-[#080808]/90"
              >
                <div className="w-full px-6 md:px-12 lg:px-16 py-10 md:py-16 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                  {/* Left Column: Manifesto, Subtitle & Deep Description */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2 gsap-service-reveal">
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-sans font-normal block">
                        [{s.num} // CAPACIDAD FREELANCE DIRECTA]
                      </span>
                      <h4 className="text-xl sm:text-2xl md:text-3xl font-normal uppercase text-white font-sans tracking-tight">
                        {s.subtitle}
                      </h4>
                    </div>

                    <p className="gsap-service-reveal text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl text-justify font-sans font-light">
                      {s.description}
                    </p>

                    {/* Direct Call to Action Button */}
                    <div className="gsap-service-reveal pt-2">
                      <button
                        type="button"
                        onClick={() => handleServiceContact(s.title)}
                        data-magnetic="true"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white rounded text-xs font-sans font-normal uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg group/btn"
                      >
                        <span>Trabajar en {s.title}</span>
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Deliverables & Capabilities Checklist */}
                  <div className="lg:col-span-5 bg-[#000000] border border-white/15 p-6 md:p-8 space-y-6 rounded shadow-2xl gsap-service-reveal">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-sans font-normal">
                        {t.deliverablesLabel}
                      </span>
                      <span className="text-xl font-normal text-white font-sans">
                        [ {s.num} ]
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {s.capabilities.map((cap, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs text-white/80 font-sans font-light py-2 px-3 bg-white/[0.02] border border-white/5 hover:border-white/20 hover:text-white transition-all rounded"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white/40 font-normal">›</span>
                            <GlitchText text={cap} />
                          </div>
                          <span className="text-[10px] text-white/30 font-light uppercase tracking-wider">
                            0{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
