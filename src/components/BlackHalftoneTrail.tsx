import { useEffect, useRef, useState } from 'react';

interface BlackHalftoneTrailProps {
  gridSize?: number;
  influenceRadius?: number;
  dotRadius?: number;
  decay?: number;
  dotColor?: string; // Default: Pure White (255, 255, 255)
  className?: string;
}

export default function BlackHalftoneTrail({
  gridSize = 6,          // Fine small dot grid spacing
  influenceRadius = 70,  // Cursor influence radius
  dotRadius = 2.2,       // Fine small dot maximum radius
  decay = 0.92,          // Smooth organic decay
  dotColor = '255, 255, 255', // Pure White dots over black background
  className = '',
}: BlackHalftoneTrailProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, cols = 0, rows = 0;
    let activation: Float32Array | null = null;
    let active = new Set<number>();
    let raf: number;
    let isLooping = false;

    function buildGrid() {
      cols = Math.ceil(W / gridSize) + 1;
      rows = Math.ceil(H / gridSize) + 1;
      activation = new Float32Array(cols * rows);
      active = new Set<number>();
    }

    function resize() {
      if (!stage || !canvas || !ctx) return;
      const rect = stage.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W <= 0 || H <= 0) return;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function excite(px: number, py: number) {
      if (!activation) return;
      const ix0 = Math.max(0, Math.floor((px - influenceRadius) / gridSize));
      const ix1 = Math.min(cols - 1, Math.ceil((px + influenceRadius) / gridSize));
      const iy0 = Math.max(0, Math.floor((py - influenceRadius) / gridSize));
      const iy1 = Math.min(rows - 1, Math.ceil((py + influenceRadius) / gridSize));

      for (let iy = iy0; iy <= iy1; iy++) {
        for (let ix = ix0; ix <= ix1; ix++) {
          const gx = ix * gridSize, gy = iy * gridSize;
          const d = Math.hypot(gx - px, gy - py);
          if (d > influenceRadius) continue;
          const falloff = 1 - d / influenceRadius;
          const idx = iy * cols + ix;
          const val = Math.pow(falloff, 1.4);
          if (val > activation[idx]) activation[idx] = val;
          active.add(idx);
        }
      }

      startLoop();
    }

    function pointerPos(e: MouseEvent | TouchEvent) {
      if (!stage) return { x: 0, y: 0 };
      const rect = stage.getBoundingClientRect();
      const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : null;
      const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    let last: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent | TouchEvent) {
      const p = pointerPos(e);
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        const steps = Math.max(1, Math.floor(dist / (gridSize * 1.5)));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          excite(last.x + (p.x - last.x) * t, last.y + (p.y - last.y) * t);
        }
      } else {
        excite(p.x, p.y);
      }
      last = p;
    }

    function onEnd() {
      last = null;
    }

    function startLoop() {
      if (!isLooping) {
        isLooping = true;
        raf = requestAnimationFrame(frame);
      }
    }

    function frame() {
      if (ctx && activation) {
        ctx.clearRect(0, 0, W, H);

        if (active.size > 0) {
          ctx.fillStyle = `rgb(${dotColor})`;

          for (const idx of Array.from(active)) {
            let a = activation[idx] * decay;
            if (a < 0.015) {
              activation[idx] = 0;
              active.delete(idx);
              continue;
            }
            activation[idx] = a;

            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;
            const r = dotRadius * a;

            ctx.globalAlpha = Math.min(1, a * 1.4);
            ctx.beginPath();
            ctx.arc(gx, gy, Math.max(0.3, r), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else {
          isLooping = false;
          return;
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onEnd);
    stage.addEventListener('touchmove', onMove, { passive: true });
    stage.addEventListener('touchend', onEnd);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onEnd);
      stage.removeEventListener('touchmove', onMove);
      stage.removeEventListener('touchend', onEnd);
    };
  }, [gridSize, influenceRadius, dotRadius, decay, dotColor]);

  return (
    <div
      ref={stageRef}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-auto ${className}`}
      style={{
        cursor: isTouch ? 'auto' : 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
