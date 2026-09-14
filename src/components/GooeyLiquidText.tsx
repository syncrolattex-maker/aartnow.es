import React, { useEffect, useRef, useId } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GooeyLiquidTextProps {
  text?: string;
  children?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span' | 'p';
  className?: string;
  innerClassName?: string;
  scrollStart?: string;
  scrollEnd?: string;
  delay?: number;        // Retardo para animaciones al cargar
  duration?: number;     // Duración de la animación de entrada si no requiere scroll
  autoPlayOnLoad?: boolean; // Forzar animación de entrada al cargar
  textBlur?: number;     // Blur CSS inicial en 'em'
  svgBlur?: number;      // stdDeviation inicial en px
  alphaMult?: number;    // Multiplicador de contraste alfa
  alphaShift?: number;   // Desplazamiento alfa
  refFontSize?: number;  // Tamaño de fuente base (px) para escalar en móvil
}

export default function GooeyLiquidText({
  text,
  children,
  as: Component = 'h2',
  className = '',
  innerClassName = '',
  scrollStart = 'top 92%',
  scrollEnd = 'center 60%',
  delay = 0,
  duration = 1.3,
  autoPlayOnLoad = false,
  textBlur = 0.32,
  svgBlur = 14,
  alphaMult = 380,
  alphaShift = -110,
  refFontSize = 64,
}: GooeyLiquidTextProps) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement | null>(null);

  const rawId = useId();
  // Sanitizar el ID para que sea válido en atributos SVG (evitar dos puntos)
  const filterId = `gooey-filter-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const blurElem = blurRef.current;
    const matrixElem = matrixRef.current;

    if (!wrapper || !inner || !blurElem || !matrixElem) return;

    let filterOn = false;
    let blurScale = 1;

    const updateBlurScale = () => {
      if (!wrapper) return;
      const computedFont = parseFloat(window.getComputedStyle(wrapper).fontSize);
      if (computedFont && !isNaN(computedFont)) {
        blurScale = Math.max(0.25, Math.min(2.2, computedFont / refFontSize));
      }
    };

    updateBlurScale();
    ScrollTrigger.addEventListener('refreshInit', updateBlurScale);

    // Función de renderizado del estado líquido (t = 0 es líquido disuelto, t = 1 es tipografía sólida)
    const render = (progress: number) => {
      const t = Math.min(1, Math.max(0, progress));
      const melt = 1 - t;

      if (t <= 0.001) {
        inner.style.visibility = 'hidden';
        inner.style.opacity = '0';
        inner.style.filter = `blur(${textBlur}em)`;
        if (filterOn) {
          wrapper.style.filter = 'none';
          filterOn = false;
        }
        return;
      }

      if (t >= 0.995) {
        inner.style.visibility = 'visible';
        inner.style.opacity = '1';
        inner.style.filter = 'none';
        if (filterOn) {
          wrapper.style.filter = 'none';
          filterOn = false;
        }
        return;
      }

      // Estado intermedio (fusión líquida / metaballs en proceso)
      inner.style.visibility = 'visible';
      inner.style.opacity = String(Math.pow(t, 0.9));
      inner.style.filter = `blur(${(textBlur * melt).toFixed(3)}em)`;

      if (!filterOn) {
        wrapper.style.filter = `url(#${filterId})`;
        filterOn = true;
      }

      const mult = 1 + (alphaMult - 1) * melt;
      const shift = alphaShift * melt;
      const currentSvgBlur = (svgBlur * blurScale * melt).toFixed(2);

      blurElem.setAttribute('stdDeviation', currentSvgBlur);
      matrixElem.setAttribute(
        'values',
        `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${mult.toFixed(2)} ${shift.toFixed(2)}`
      );
    };

    const state = { progress: 0 };
    render(0);

    let tween: gsap.core.Tween | null = null;

    // Pequeño retardo para evaluar la posición en el viewport tras el render inicial
    const initTimer = setTimeout(() => {
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const isAlreadyInViewport = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      const cannotScroll = document.documentElement.scrollHeight <= window.innerHeight + 50;

      // Si ya está visible en pantalla al cargar o la página no tiene scroll suficiente:
      if (autoPlayOnLoad || isAlreadyInViewport || cannotScroll) {
        tween = gsap.to(state, {
          progress: 1,
          duration,
          delay,
          ease: 'power2.out',
          onUpdate: () => render(state.progress),
        });
      } else {
        // Si está más abajo en la página, se revela al scrollear
        tween = gsap.to(state, {
          progress: 1,
          ease: 'none',
          onUpdate: () => render(state.progress),
          scrollTrigger: {
            trigger: wrapper,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        });
      }
    }, 40);

    return () => {
      clearTimeout(initTimer);
      ScrollTrigger.removeEventListener('refreshInit', updateBlurScale);
      if (tween) {
        if (tween.scrollTrigger) {
          tween.scrollTrigger.kill();
        }
        tween.kill();
      }
      if (wrapper) {
        wrapper.style.filter = 'none';
      }
      if (inner) {
        inner.style.filter = 'none';
        inner.style.opacity = '1';
        inner.style.visibility = 'visible';
      }
    };
  }, [filterId, scrollStart, scrollEnd, delay, duration, autoPlayOnLoad, textBlur, svgBlur, alphaMult, alphaShift, refFontSize]);

  return (
    <>
      {/* Definición de filtro SVG oculto único para este componente */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute w-0 h-0 overflow-hidden"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0" result="blur" />
            <feColorMatrix
              ref={matrixRef}
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Elemento de texto con wrapper exterior (recibe el filtro SVG) e inner span (recibe el blur CSS) */}
      <Component
        ref={wrapperRef as any}
        className={`relative will-change-[filter] ${className}`}
      >
        <span
          ref={innerRef}
          className={`block will-change-[filter,opacity] ${innerClassName}`}
          style={{ visibility: 'hidden', opacity: 0 }}
        >
          {children !== undefined ? children : text}
        </span>
      </Component>
    </>
  );
}
