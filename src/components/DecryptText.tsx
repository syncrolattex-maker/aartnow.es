import { useState, useRef, useEffect, useCallback } from 'react';

// Caracteres limpios de desencriptacion estilo terminal / codigo
const DECRYPT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*?';

export function useDecryptText(text: string) {
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

  const onMouseEnter = useCallback(() => {
    // Si ya esta ejecutandose o ya se ejecuto en este hover, NO repetir (no en bucle)
    if (isRunningRef.current || hasRunRef.current) return;
    isRunningRef.current = true;
    hasRunRef.current = true;

    let iteration = 0;
    const totalChars = text.length;
    // Paso dinamico para que dure aprox 350ms independientemente del largo del texto
    const step = Math.max(totalChars / 14, 0.4);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
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
        // hasRunRef permanece true mientras el cursor siga encima
      }

      iteration += step;
    }, 25);
  }, [text]);

  const onMouseLeave = useCallback(() => {
    // Solo se re-arma cuando el usuario saca el cursor del boton
    hasRunRef.current = false;
  }, []);

  return { displayText, onMouseEnter, onMouseLeave };
}

interface DecryptTextProps {
  text: string;
  className?: string;
}

export default function DecryptText({ text, className = '' }: DecryptTextProps) {
  const { displayText, onMouseEnter, onMouseLeave } = useDecryptText(text);

  return (
    <span
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`inline-block select-none ${className}`}
      style={{
        fontFamily: 'inherit',
        color: 'inherit',
      }}
    >
      {displayText}
    </span>
  );
}
