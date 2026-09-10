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
        // start: 'top 26%' ensures that at scrollY = 0 (when text is at ~32vh), the first line is 100% assembled and readable.
        // It ONLY begins exploding when the user scrolls the line upward through top 26% -> top 6%.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: lineEl,
            start: 'top 26%',
            end: 'top 6%',
            scrub: 0.7,
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

          // Proportional spread for refined, readable typography
          const isMobile = window.innerWidth < 768;
          const spreadFactor = isMobile ? 80 : 160;
          const targetX = distFromCenter * spreadFactor + r1 * (isMobile ? 40 : 80);
          const targetY = (r2 - 0.5) * (isMobile ? 90 : 140);
          const targetRotate = (r3 - 0.5) * 70; // -35deg to +35deg
          const targetScale = 0.9 + Math.abs(r1) * 0.3;

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
    <div ref={containerRef} className={`w-full py-8 md:py-16 relative ${className}`}>
      <div className="w-full mx-auto px-6 sm:px-10 md:px-16 flex flex-col items-center justify-center space-y-16 sm:space-y-20 md:space-y-28">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="w-full flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-7">
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
                  className="explosive-line w-full max-w-[1240px] text-lg sm:text-xl md:text-2xl lg:text-[1.85rem] xl:text-[2.1rem] font-medium tracking-tight text-white/90 text-center font-sans select-none relative transition-colors leading-[1.45] sm:leading-[1.5] hover:text-white"
                >
                  {words.map((word, wordIdx) => (
                    <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0">
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
