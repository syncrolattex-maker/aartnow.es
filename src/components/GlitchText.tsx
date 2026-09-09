import { useState, useRef, useEffect, useCallback } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div';
}

const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*?';

export default function GlitchText({ text, className = '', as = 'span' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isRunningRef = useRef(false);
  const hasRunRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isRunningRef.current = false;
    hasRunRef.current = false;
    setDisplayText(text);
  }, [text]);

  const triggerGlitch = useCallback(() => {
    // Solo se ejecutará una vez por cada hover (no en bucle)
    if (isRunningRef.current || hasRunRef.current) return;
    isRunningRef.current = true;
    hasRunRef.current = true;

    let iteration = 0;
    const totalChars = text.length;
    const step = Math.max(totalChars / 14, 0.4);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join('')
      );

      if (iteration >= totalChars) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(text);
        isRunningRef.current = false;
      }

      iteration += step;
    }, 25);
  }, [text]);

  const handleMouseLeave = useCallback(() => {
    hasRunRef.current = false;
  }, []);

  const Component = as;

  return (
    <Component 
      onMouseEnter={triggerGlitch}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block select-none pointer-events-auto ${className}`}
      style={{
        fontFamily: 'inherit',
        color: 'inherit',
      }}
    >
      {displayText}
    </Component>
  );
}
