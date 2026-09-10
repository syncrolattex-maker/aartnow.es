import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ExplosiveLineItem {
  text: string;
  isBold?: boolean;
  isParagraphBreak?: boolean;
}

interface ExplosiveListProps {
  items?: (string | ExplosiveLineItem)[];
  lines?: string[];
  paragraphs?: string[][];
  className?: string;
}

export default function ExplosiveList({ items, lines, paragraphs, className = '' }: ExplosiveListProps) {
  // Normalize incoming data into a flat list of line items
  let normalizedItems: ExplosiveLineItem[] = [];

  if (items && items.length > 0) {
    normalizedItems = items.map((item) =>
      typeof item === 'string' ? { text: item } : item
    );
  } else if (paragraphs && paragraphs.length > 0) {
    paragraphs.forEach((pGroup, pIdx) => {
      pGroup.forEach((lineText, lIdx) => {
        normalizedItems.push({
          text: lineText,
          isParagraphBreak: lIdx === pGroup.length - 1 && pIdx < paragraphs.length - 1,
        });
      });
    });
  } else if (lines && lines.length > 0) {
    normalizedItems = lines.map((text) => ({ text }));
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !normalizedItems.length) return;

    const triggers: ScrollTrigger[] = [];

    const ctx = gsap.context(() => {
      lineRefs.current.forEach((lineEl, lineIdx) => {
        if (!lineEl) return;

        const charEls = lineEl.querySelectorAll<HTMLSpanElement>('.char');
        if (!charEls.length) return;

        const totalChars = charEls.length;
        const centerIndex = (totalChars - 1) / 2;

        // Individual ScrollTrigger per LINE (strictly line-by-line, never whole paragraphs!)
        // start: 'top 32%' guarantees that when the page is at scrollY = 0 (top at ~34vh),
        // the top lines are 100% assembled, crisp, and readable.
        // The explosion begins ONLY when the user scrolls the line up toward the top of the screen.
        // Direct, instantaneous scrub without compounded lag:
        // Lenis already provides smooth scroll momentum. Using scrub: 0.15 with ease: 'none'
        // eliminates the 700ms reversal delay and makes the letters track the scroll in real-time.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: lineEl,
            start: 'top 34%',
            end: 'top 6%',
            scrub: 0.15,
            invalidateOnRefresh: true,
          },
        });

        if (tl.scrollTrigger) {
          triggers.push(tl.scrollTrigger);
        }

        charEls.forEach((charEl, charIdx) => {
          // Normalized distance from center (-1 to 1)
          const distFromCenter = centerIndex > 0 ? (charIdx - centerIndex) / centerIndex : 0;

          // Deterministic pseudo-random seed based on character and line indices
          const seed = (charIdx + 1) * 41 + (lineIdx + 1) * 97;
          const r1 = ((Math.sin(seed * 1.13) * 10000) % 1);
          const r2 = ((Math.cos(seed * 2.27) * 10000) % 1);
          const r3 = ((Math.sin(seed * 3.61) * 10000) % 1);

          // Proportional particle dispersion tailored for clean, light/medium lines
          const isMobile = window.innerWidth < 768;
          const spreadFactor = isMobile ? 70 : 150;
          const targetX = distFromCenter * spreadFactor + r1 * (isMobile ? 35 : 70);
          const targetY = (r2 - 0.5) * (isMobile ? 80 : 130);
          const targetRotate = (r3 - 0.5) * 60; // -30deg to +30deg
          const targetScale = 0.92 + Math.abs(r1) * 0.25;

          tl.to(
            charEl,
            {
              x: targetX,
              y: targetY,
              rotation: targetRotate,
              opacity: 0,
              scale: targetScale,
              ease: 'none',
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
  }, [normalizedItems]);

  return (
    <div ref={containerRef} className={`w-full py-8 md:py-16 relative ${className}`}>
      <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-10 md:px-16 flex flex-col items-center justify-center gap-y-3 sm:gap-y-4 md:gap-y-5">
        {normalizedItems.map((item, lineIndex) => {
          const words = item.text.split(' ');
          const isBold = !!item.isBold;

          return (
            <p
              key={lineIndex}
              ref={(el) => {
                if (el) lineRefs.current[lineIndex] = el;
              }}
              data-cursor-text="EXPLODE"
              className={`explosive-line w-full text-center select-none relative transition-colors m-0 p-0 ${
                isBold
                  ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic font-bold tracking-tight text-white leading-tight font-sans'
                  : 'text-base sm:text-lg md:text-xl lg:text-2xl font-light sm:font-normal tracking-tight text-white/85 hover:text-white leading-[1.35] sm:leading-[1.4] font-sans'
              }`}
            >
              {words.map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0">
                  {word.split('').map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className="char inline-block will-change-transform transform-gpu"
                      style={{ 
                        transformOrigin: 'center center',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
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
