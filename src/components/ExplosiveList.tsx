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

        const isMobile = window.innerWidth < 768;
        const spreadFactor = isMobile ? 70 : 150;
        const spreadOffset = isMobile ? 35 : 70;
        const ySpread = isMobile ? 80 : 130;

        // Precompute all target coordinates and rotations into fast typed arrays
        // so NO trigonometric calculations run during scroll ticks:
        const xTargets = new Float32Array(totalChars);
        const yTargets = new Float32Array(totalChars);
        const rTargets = new Float32Array(totalChars);

        for (let charIdx = 0; charIdx < totalChars; charIdx++) {
          const distFromCenter = centerIndex > 0 ? (charIdx - centerIndex) / centerIndex : 0;
          const seed = (charIdx + 1) * 41 + (lineIdx + 1) * 97;
          const r1 = ((Math.sin(seed * 1.13) * 10000) % 1);
          const r2 = ((Math.cos(seed * 2.27) * 10000) % 1);
          const r3 = ((Math.sin(seed * 3.61) * 10000) % 1);

          xTargets[charIdx] = distFromCenter * spreadFactor + r1 * spreadOffset;
          yTargets[charIdx] = (r2 - 0.5) * ySpread;
          rTargets[charIdx] = (r3 - 0.5) * 50;
        }

        // Individual ScrollTrigger per line:
        // scrub: 0.35 provides silky-smooth fluid momentum, eliminating wheel stepping and hitching
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: lineEl,
            start: 'top 34%',
            end: 'top 6%',
            scrub: 0.35,
          },
        });

        if (tl.scrollTrigger) {
          triggers.push(tl.scrollTrigger);
        }

        // Single tween for all characters in the line
        tl.to(
          Array.from(charEls),
          {
            x: (i: number) => xTargets[i],
            y: (i: number) => yTargets[i],
            rotation: (i: number) => rTargets[i],
            opacity: 0,
            ease: 'none',
            duration: 1,
          },
          0
        );
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
              className={`explosive-line w-full text-center select-none pointer-events-none relative m-0 p-0 ${
                isBold
                  ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic font-bold tracking-tight text-white leading-tight font-sans'
                  : 'text-base sm:text-lg md:text-xl lg:text-2xl font-light sm:font-normal tracking-tight text-white/85 leading-[1.35] sm:leading-[1.4] font-sans'
              }`}
            >
              {words.map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em] last:mr-0 pointer-events-none">
                  {word.split('').map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className="char inline-block will-change-transform transform-gpu pointer-events-none"
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
