import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface DitherTransitionContextType {
  triggerTransition: (onMidpoint: () => void, clickPoint?: { x: number; y: number }) => void;
  isTransitioning: boolean;
}

const DitherTransitionContext = createContext<DitherTransitionContextType>({
  triggerTransition: () => {},
  isTransitioning: false,
});

export const useDitherTransition = () => useContext(DitherTransitionContext);

// Matriz Bayer 4x4 idéntica a la del cursor (GlobalAdaptiveHalftoneTrail)
const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

const GRID_SIZE = 8; // px entre celdas (granularidad óptima de dither)

// Generador de ruido Perlin 2D puro, ultra-rápido y determinista por semilla
function createNoise2D(seed: number = Math.random()) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = Math.floor(seed * 2147483647);
  function rnd() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  }
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(rnd() * (i + 1));
    const tmp = p[i];
    p[i] = p[r];
    p[r] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function grad2d(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  return function(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = (1 - u) * grad2d(aa, xf, yf) + u * grad2d(ba, xf - 1, yf);
    const x2 = (1 - u) * grad2d(ab, xf, yf - 1) + u * grad2d(bb, xf - 1, yf - 1);
    return (1 - v) * x1 + v * x2;
  };
}

export function DitherTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);
  const rafRef = useRef<number>(0);

  // Redimensionar canvas al tamaño exacto de ventana
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const triggerTransition = useCallback((onMidpoint: () => void) => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsTransitioning(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      onMidpoint();
      activeRef.current = false;
      setIsTransitioning(false);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      onMidpoint();
      activeRef.current = false;
      setIsTransitioning(false);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(W / GRID_SIZE) + 1;
    const rows = Math.ceil(H / GRID_SIZE) + 1;
    const totalCells = cols * rows;

    // Generar umbrales orgánicos irregulares con nueva semilla única para esta transición
    const noise = createNoise2D(Math.random());
    const thresholds = new Float32Array(totalCells);
    let idx = 0;
    for (let iy = 0; iy < rows; iy++) {
      const bRow = BAYER_4X4[iy % 4];
      const ny1 = iy * 0.04;
      const ny2 = iy * 0.09 + 3.4;
      for (let ix = 0; ix < cols; ix++) {
        const nx1 = ix * 0.04;
        const nx2 = ix * 0.09 + 7.1;
        const n1 = 0.5 + 0.5 * noise(nx1, ny1);
        const n2 = 0.5 + 0.5 * noise(nx2, ny2);
        const organicNoise = n1 * 0.7 + n2 * 0.3;
        const bayer = bRow[ix % 4];
        // 65% manchas orgánicas aleatorias + 35% granularidad dithering
        thresholds[idx++] = Math.max(0.02, Math.min(0.98, organicNoise * 0.65 + bayer * 0.35));
      }
    }

    const DURATION_IN = 440;  // ms para rellenar toda la pantalla de forma irregular a puntos
    const DURATION_OUT = 440; // ms para desaparecer en el sentido inverso exacto
    const band = 0.22;
    const maxRadius = GRID_SIZE * 0.72;

    let currentPhase = 0; // 0 = Rellenar (Fill), 1 = Desaparecer en inverso (Reverse Unfill)
    let lastTime = performance.now();
    let accumulatedTime = 0;

    const render = (now: number) => {
      // Limitar delta a 35ms para garantizar frames intermedios incluso si hay carga de render
      const delta = Math.min(Math.max(now - lastTime, 0), 35);
      lastTime = now;
      accumulatedTime += delta;

      if (currentPhase === 0) {
        // FASE 0: RELLENAR A PUNTOS DITHERING IRREGULARES
        const rawP = Math.min(accumulatedTime / DURATION_IN, 1.0);
        // Easing suave cuadrático
        const progress = 1.0 - Math.pow(1.0 - rawP, 2.2);

        if (progress >= 0.98) {
          // Pantalla 100% blanca sólida
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, W, H);

          // Ejecutar cambio de pantalla/pestaña bajo la capa blanca
          try {
            onMidpoint();
          } catch (err) {
            console.error(err);
          }

          // Esperar 2 frames para que React y el navegador pinten la nueva página antes de revelar
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              currentPhase = 1;
              accumulatedTime = 0;
              lastTime = performance.now();
              rafRef.current = requestAnimationFrame(render);
            });
          });
          return;
        }

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();

        const p = progress;
        const pFactor = p * (1.0 + band * 2.0) - band * 0.5;

        for (let i = 0; i < totalCells; i++) {
          const t = (pFactor - thresholds[i]) / band;
          if (t <= 0) continue;

          const iy = (i / cols) | 0;
          const ix = i % cols;

          if (t >= 0.88) {
            ctx.rect(ix * GRID_SIZE, iy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          } else {
            const cx = ix * GRID_SIZE + GRID_SIZE * 0.5;
            const cy = iy * GRID_SIZE + GRID_SIZE * 0.5;
            const r = t * maxRadius;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
        }

        ctx.fill();
        rafRef.current = requestAnimationFrame(render);

      } else {
        // FASE 1: DESAPARECER EN SENTIDO INVERSO AL DE RELLENAR
        // Se reproduce exactamente la animación a la inversa:
        // Los puntos que se llenaron al final son los primeros en vaciarse y viceversa
        const rawP = Math.min(accumulatedTime / DURATION_OUT, 1.0);
        const progress = 1.0 - Math.pow(1.0 - rawP, 2.2);

        if (progress >= 0.98) {
          // Transición completada al 100%, pantalla de origen/destino completamente revelada
          ctx.clearRect(0, 0, W, H);
          activeRef.current = false;
          setIsTransitioning(false);
          return;
        }

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();

        // Inverso exacto de la Fase 0
        const p = 1.0 - progress;
        const pFactor = p * (1.0 + band * 2.0) - band * 0.5;

        for (let i = 0; i < totalCells; i++) {
          const t = (pFactor - thresholds[i]) / band;
          if (t <= 0) continue;

          const iy = (i / cols) | 0;
          const ix = i % cols;

          if (t >= 0.88) {
            ctx.rect(ix * GRID_SIZE, iy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          } else {
            const cx = ix * GRID_SIZE + GRID_SIZE * 0.5;
            const cy = iy * GRID_SIZE + GRID_SIZE * 0.5;
            const r = t * maxRadius;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
        }

        ctx.fill();
        rafRef.current = requestAnimationFrame(render);
      }
    };

    rafRef.current = requestAnimationFrame(render);
  }, []);

  return (
    <DitherTransitionContext.Provider value={{ triggerTransition, isTransitioning }}>
      {children}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-[99998]"
        style={{
          pointerEvents: isTransitioning ? 'auto' : 'none',
        }}
      />
    </DitherTransitionContext.Provider>
  );
}

