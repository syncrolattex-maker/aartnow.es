import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import DitherTransitionCanvas from './DitherTransitionCanvas';

// Las 7 piezas geometricas del isograma de aartnow.es (rejilla 10x10)
const SQUARES = [
  { id: 0, x: 0, y: 0 },
  { id: 1, x: 4, y: 0 },
  { id: 2, x: 8, y: 0 },
  { id: 3, x: 2, y: 4 },
  { id: 4, x: 6, y: 4 },
  { id: 5, x: 0, y: 8 },
  { id: 6, x: 8, y: 8 },
];

interface IsogramLoaderProps {
  onComplete: () => void;
}

export default function IsogramLoader({ onComplete }: IsogramLoaderProps) {
  const [activeCount, setActiveCount] = useState(0);
  const [startDither, setStartDither] = useState(false);

  // Safety fallback: asegura que onComplete se ejecute en 1.6s máximo
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      onComplete();
    }, 1600);
    return () => clearTimeout(safetyTimer);
  }, [onComplete]);

  useEffect(() => {
    // Los cuadrados van apareciendo secuencialmente a modo de carga
    const interval = setInterval(() => {
      setActiveCount((prev) => {
        if (prev < SQUARES.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  // Una vez completados los 7 cuadrados del isotipo, inicia la transicion de dithering de negro a blanco
  useEffect(() => {
    if (activeCount >= SQUARES.length) {
      const timer = setTimeout(() => {
        setStartDither(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeCount]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full select-none">
      {/* Solo el logo isograma (sin texto 'aartnow.es') */}
      <motion.div 
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 p-2"
        animate={startDither ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <svg viewBox="0 0 10 10" fill="none" className="w-full h-full">
          {/* Cuadrados guias tenues en reposo */}
          {SQUARES.map((sq) => (
            <rect
              key={`ghost-${sq.id}`}
              x={sq.x}
              y={sq.y}
              width="2"
              height="2"
              fill="rgba(255, 255, 255, 0.08)"
            />
          ))}

          {/* Cuadrados que van apareciendo secuencialmente */}
          {SQUARES.slice(0, activeCount).map((sq) => (
            <motion.rect
              key={`active-${sq.id}`}
              x={sq.x}
              y={sq.y}
              width="2"
              height="2"
              fill="#FFFFFF"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: `${sq.x + 1}px ${sq.y + 1}px` }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Transición de negro a blanco mediante dithering Bayer 4x4 (estilo cursor) */}
      <DitherTransitionCanvas 
        active={startDither}
        onComplete={onComplete}
        duration={720}
      />
    </div>
  );
}