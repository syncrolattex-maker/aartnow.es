import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AboutIllustrationProps {
  className?: string;
}

export default function AboutIllustration({ className = '' }: AboutIllustrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closedImgRef = useRef<HTMLImageElement>(null);
  const openImgRef = useRef<HTMLImageElement>(null);

  // Preload both images immediately to ensure zero-flicker transitions
  useEffect(() => {
    const p1 = new Image();
    p1.src = '/images/about-portrait-closed.jpg';
    const p2 = new Image();
    p2.src = '/images/about-portrait-open.jpg';
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const closedImg = closedImgRef.current;
    const openImg = openImgRef.current;
    if (!container || !closedImg || !openImg) return;

    const ctx = gsap.context(() => {
      // Initial states: Closed cap image fully visible; Open cap image positioned slightly lower
      gsap.set(closedImg, { opacity: 1, scale: 1, y: 0 });
      gsap.set(openImg, { opacity: 0, scale: 0.94, y: 30 });

      // Scroll-driven animation:
      // As the user scrolls through to the bottom of the page,
      // the closed cap transitions into the open head portrait,
      // with the cap rising and the creative elements floating into view.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 78%',
          end: 'bottom 88%',
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });

      // 1. Fade out closed body portrait while gently zooming
      tl.to(
        closedImg,
        {
          opacity: 0,
          scale: 1.06,
          y: -15,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // 2. Fade in open head portrait with an upward physical lifting motion of the cap & items
      tl.to(
        openImg,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'none',
          duration: 1,
        },
        0
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <div className="relative w-auto h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px] aspect-[764/1024] max-w-full">
        {/* Imagen 1: Retrato de cuerpo entero con gorra puesta */}
        <img
          ref={closedImgRef}
          src="/images/about-portrait-closed.jpg"
          alt="Aaron Primo Almarche - Ilustración con gorra"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform transform-gpu drop-shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          loading="eager"
          decoding="async"
        />

        {/* Imagen 2: Gorra levantada con los elementos creativos (tabal, bicicleta, portátil, etc.) */}
        <img
          ref={openImgRef}
          src="/images/about-portrait-open.jpg"
          alt="Aaron Primo Almarche - Mente creativa con gorra levantada y elementos"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform transform-gpu drop-shadow-[0_0_50px_rgba(255,255,255,0.08)]"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
