import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ExplosiveListProps {
  paragraphs?: string[][];
  lines?: string[];
  className?: string;
}

export default function ExplosiveList({ paragraphs, lines, className = '' }: ExplosiveListProps) {
  // Normalize data: support either array of paragraphs or flat array of lines
  const groups: string[][] = paragraphs && paragraphs.length > 0 
    ? paragraphs 
    : [lines && lines.length > 0 ? lines : []];

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const triggers: ScrollTrigger[] = [];

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
            start: 'top 68%',
            end: 'center 32%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        if (tl.scrollTrigger) {
          triggers.push(tl.scrollTrigger);
        }

        charEls.forEach((charEl, charIdx) => {
          // Normalized distance from center (-1 to 1)
          const distFromCenter = centerIndex > 0 ? (charIdx - centerIndex) / centerIndex : 0;

          // Deterministic pseudo-random seed based on indices
          const seed = (charIdx + 1) * 37 + (lineIdx + 1) * 89;
          const r1 = ((Math.sin(seed * 1.17) * 10000) % 1);
          const r2 = ((Math.cos(seed * 2.31) * 10000) % 1);
          const r3 = ((Math.sin(seed * 3.73) * 10000) % 1);

          // Fullwidth outward dispersion: left characters fly left, right characters fly right
          // Plus vertical explosion and rotational spin
          const isMobile = window.innerWidth < 768;
          const spreadFactor = isMobile ? 180 : 380;
          const targetX = distFromCenter * spreadFactor + r1 * (isMobile ? 80 : 160);
          const targetY = (r2 - 0.5) * (isMobile ? 200 : 320);
          const targetRotate = (r3 - 0.5) * 120; // -60deg to +60deg
          const targetScale = 0.85 + Math.abs(r1) * 0.5;

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
  }, [groups]);

  // Reset lineRefs index counter on every render pass
  let refIndex = 0;

  return (
    <div ref={containerRef} className={`w-full py-16 md:py-24 relative ${className}`}>
      <div className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center justify-center space-y-20 sm:space-y-28 md:space-y-36">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="w-full flex flex-col items-center justify-center space-y-8 sm:space-y-12 md:space-y-14">
            {group.map((line, lineInGroupIdx) => {
              const currentRefIndex = refIndex++;
              const words = line.split(' ');

              return (
                <p
                  key={lineInGroupIdx}
                  ref={(el) => {
                    if (el) lineRefs.current[currentRefIndex] = el;
                  }}
                  data-cursor-text="EXPLODE"
                  className="explosive-line w-full max-w-[1700px] text-2xl sm:text-4xl md:text-5xl lg:text-[4vw] xl:text-[4.2vw] font-bold tracking-tight text-white/95 text-center font-sans select-none relative transition-colors leading-[1.2] hover:text-white"
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
        ))}
      </div>
    </div>
  );
}
