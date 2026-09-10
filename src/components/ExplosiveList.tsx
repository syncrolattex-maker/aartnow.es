import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ExplosiveListProps {
  lines: string[];
  className?: string;
}

export default function ExplosiveList({ lines, className = '' }: ExplosiveListProps) {
  const safeLines = lines && lines.length > 0 ? lines : [
    'DIRECCIÓN DE ARTE & 3D',
    'ESCULTURA DIGITAL Y FORMA',
    'CINEMA 4D · 3DS MAX · CORONA · V-RAY',
    'FOTORREALISMO RADICAL Y LUZ',
    'TRANSFORMANDO ESPACIOS EN EMOCIÓN',
    'CAOS CONTROLADO · PRECISIÓN VISUAL',
    'DESDE VALENCIA PARA EL MUNDO'
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      lineRefs.current.forEach((lineEl, lineIdx) => {
        if (!lineEl) return;

        const charEls = lineEl.querySelectorAll<HTMLSpanElement>('.char');
        if (!charEls.length) return;

        const totalChars = charEls.length;
        const centerIndex = (totalChars - 1) / 2;

        // Build individual tweens for each character with ScrollTrigger scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: lineEl,
            start: 'top 65%',
            end: 'center 35%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        triggers.push(tl.scrollTrigger!);

        charEls.forEach((charEl, charIdx) => {
          // Normalized distance from center (-1 to 1)
          const distFromCenter = centerIndex > 0 ? (charIdx - centerIndex) / centerIndex : 0;

          // Deterministic pseudo-random seed based on indices
          const seed = (charIdx + 1) * 31 + (lineIdx + 1) * 73;
          const r1 = ((Math.sin(seed * 1.1) * 10000) % 1);
          const r2 = ((Math.cos(seed * 2.3) * 10000) % 1);
          const r3 = ((Math.sin(seed * 3.7) * 10000) % 1);

          // Disperse outward: left characters fly left, right characters fly right
          // Plus vertical explosion and rotational spin
          const isMobile = window.innerWidth < 768;
          const spreadFactor = isMobile ? 140 : 280;
          const targetX = distFromCenter * spreadFactor + r1 * (isMobile ? 60 : 120);
          const targetY = (r2 - 0.5) * (isMobile ? 160 : 260);
          const targetRotate = (r3 - 0.5) * 110; // -55deg to +55deg
          const targetScale = 0.8 + Math.abs(r1) * 0.6;

          tl.to(
            charEl,
            {
              x: targetX,
              y: targetY,
              rotation: targetRotate,
              opacity: 0,
              scale: targetScale,
              ease: 'power1.inOut',
              duration: 1,
            },
            0
          );
        });
      });
    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
      triggers.forEach((st) => st?.kill());
    };
  }, [safeLines]);

  return (
    <div ref={containerRef} className={`w-full py-16 md:py-24 relative ${className}`}>
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center space-y-10 sm:space-y-12 md:space-y-16">
        {safeLines.map((line, lineIndex) => {
          // Split line into words, then words into characters to preserve formatting
          const words = line.split(' ');

          return (
            <p
              key={lineIndex}
              ref={(el) => {
                lineRefs.current[lineIndex] = el;
              }}
              data-cursor-text="EXPLODE"
              className="explosive-line text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white/95 text-center font-sans select-none relative transition-colors leading-[1.2] hover:text-white"
            >
              {words.map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.3em] last:mr-0">
                  {word.split('').map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className="char inline-block will-change-transform transform-gpu"
                      style={{ transformOrigin: 'center center' }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          );
        })}
      </div>
    </div>
  );
}
