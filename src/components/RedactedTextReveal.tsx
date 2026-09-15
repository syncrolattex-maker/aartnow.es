import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RedactedTextRevealProps {
  text?: string;
  children?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  barColor?: string;
  textColor?: string;
  autoPlayOnLoad?: boolean;
  scrollStart?: string;
}

export default function RedactedTextReveal({
  text,
  children,
  as: Component = 'div',
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.05,
  barColor = '#ffffff',
  textColor = '#ffffff',
  autoPlayOnLoad = false,
  scrollStart = 'top 85%',
}: RedactedTextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  const content = typeof children === 'string' ? children : text || '';
  const words = content ? content.split(/\s+/).filter(Boolean) : [];

  useEffect(() => {
    const container = containerRef.current;
    const wordElements = wordsRef.current.filter(Boolean);

    if (!container || wordElements.length === 0) return;

    // Estado inicial en cada palabra (barra de redacción sólida activa)
    wordElements.forEach((w) => {
      w.style.backgroundImage = `linear-gradient(${barColor}, ${barColor})`;
      w.style.backgroundSize = '100% 100%';
      w.style.backgroundRepeat = 'no-repeat';
      w.style.color = 'transparent';
      w.style.padding = '0.02em 0.2em';
      w.style.margin = '0 0.06em';
      w.style.borderRadius = '2px';
    });

    const tl = gsap.timeline({
      paused: true,
      delay,
    });

    wordElements.forEach((w, i) => {
      tl.to(
        w,
        {
          backgroundSize: '0% 100%',
          duration: 0.22,
          ease: 'power2.inOut',
        },
        i * stagger
      ).to(
        w,
        {
          color: textColor,
          duration: 0.15,
          ease: 'power1.out',
        },
        i * stagger + 0.05
      );
    });

    let st: ScrollTrigger | null = null;

    // Retardo mínimo para que el layout calcule correctamente las coordenadas en viewport
    const timer = setTimeout(() => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const isAlreadyInViewport = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;

      if (autoPlayOnLoad || isAlreadyInViewport) {
        tl.play();
      } else {
        st = ScrollTrigger.create({
          trigger: container,
          start: scrollStart,
          once: true,
          onEnter: () => tl.play(),
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (st) st.kill();
      tl.kill();
    };
  }, [content, delay, stagger, barColor, textColor, autoPlayOnLoad, scrollStart]);

  return (
    <Component ref={containerRef as any} className={`relative leading-normal ${className}`}>
      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <span
            ref={(el) => {
              if (el) wordsRef.current[idx] = el;
            }}
            className={`inline-block align-baseline will-change-[background-size,color] ${wordClassName}`}
          >
            {word}
          </span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Component>
  );
}
