import { useEffect, useRef } from 'react';
import { PowerGlitch } from 'powerglitch';

interface PowerGlitchTextProps {
  text: string;
  className?: string;
  as?: 'h2' | 'h3' | 'span' | 'p' | 'div';
  playOnHover?: boolean;
}

export default function PowerGlitchText({
  text,
  className = '',
  as = 'h2',
  playOnHover = true
}: PowerGlitchTextProps) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const glitchInstance = PowerGlitch.glitch(elementRef.current, {
      playMode: playOnHover ? 'hover' : 'always',
      createContainers: true,
      hideOverflow: false,
      timing: {
        duration: 900,
        iterations: 1,
        easing: 'ease-in-out',
      },
      glitchTimeSpan: {
        start: 0.1,
        end: 0.8,
      },
      shake: {
        velocity: 15,
        amplitudeX: 0.2,
        amplitudeY: 0.2,
      },
      slice: {
        count: 6,
        velocity: 15,
        minHeight: 0.05,
        maxHeight: 0.18,
        hueRotate: true,
      },
    });

    return () => {
      try {
        glitchInstance.stopGlitch();
      } catch (e) {
        // cleanup if needed
      }
    };
  }, [playOnHover, text]);

  const Component = as as any;

  return (
    <Component ref={elementRef} className={`inline-block cursor-pointer ${className}`}>
      {text}
    </Component>
  );
}
