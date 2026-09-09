import { useEffect, useRef } from 'react';

interface DitherTransitionCanvasProps {
  active: boolean;
  onComplete: () => void;
  duration?: number;
}

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

const GRID_SIZE = 8;

export default function DitherTransitionCanvas({
  active,
  onComplete,
  duration = 600,
}: DitherTransitionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    // Failsafe de seguridad: si cualquier cosa falla, completar en duration + 200ms
    const failsafeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, duration + 250);

    const canvas = canvasRef.current;
    if (!canvas) {
      completedRef.current = true;
      onComplete();
      return () => clearTimeout(failsafeTimer);
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      completedRef.current = true;
      onComplete();
      return () => clearTimeout(failsafeTimer);
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

    const centerX = W * 0.5;
    const centerY = H * 0.5;
    const maxDist = Math.hypot(centerX, centerY);

    // Precomputar distancias normalizadas por celda
    const cellDists = new Float32Array(totalCells);
    let idx = 0;
    for (let iy = 0; iy < rows; iy++) {
      const cy = iy * GRID_SIZE + GRID_SIZE * 0.5;
      for (let ix = 0; ix < cols; ix++) {
        const cx = ix * GRID_SIZE + GRID_SIZE * 0.5;
        cellDists[idx++] = Math.hypot(cx - centerX, cy - centerY) / maxDist;
      }
    }

    let rafId = 0;
    const startTime = performance.now();
    const band = 0.25;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const rawP = Math.min(elapsed / duration, 1.0);
      const progress = 1.0 - Math.pow(1.0 - rawP, 2.2);

      if (rawP >= 1.0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(onComplete, 60);
        }
        return;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();

      const waveFront = progress * 1.35;

      for (let i = 0; i < totalCells; i++) {
        const dist = cellDists[i];
        const t = (waveFront - dist) / band;
        if (t <= 0) continue;

        const iy = (i / cols) | 0;
        const ix = i % cols;
        const bayer = BAYER_4X4[iy % 4][ix % 4];

        if (t >= 0.90 || t > bayer) {
          if (t >= 0.92) {
            ctx.rect(ix * GRID_SIZE, iy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          } else {
            const cx = ix * GRID_SIZE + GRID_SIZE * 0.5;
            const cy = iy * GRID_SIZE + GRID_SIZE * 0.5;
            const r = Math.min(t, 1.0) * (GRID_SIZE * 0.72);
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
        }
      }

      ctx.fill();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      clearTimeout(failsafeTimer);
      cancelAnimationFrame(rafId);
    };
  }, [active, onComplete, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-20"
    />
  );
}

