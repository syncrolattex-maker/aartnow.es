import { useState, useRef } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div';
}

const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function GlitchText({ text, className = '', as = 'span' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const triggerGlitch = () => {
    if (isGlitching) return;
    setIsGlitching(true);

    let iteration = 0;
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

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsGlitching(false);
      }

      iteration += 1 / 2;
    }, 25);
  };

  const Component = as;

  return (
    <Component 
      onMouseEnter={triggerGlitch}
      className={`relative inline-block transition-colors duration-200 cursor-pointer ${
        isGlitching ? 'text-[#A3FF12] font-mono' : ''
      } ${className}`}
    >
      {displayText}
    </Component>
  );
}
