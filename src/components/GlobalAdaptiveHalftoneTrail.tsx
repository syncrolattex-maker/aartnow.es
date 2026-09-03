import { useEffect, useRef, useState } from 'react';

/**
 * GlobalAdaptiveDitherTrail
 * Rastro global de tramado digital (Dithering Bayer 4x4) adaptativo
 * que reacciona con píxeles cuánticos al movimiento del cursor en toda la web.
 */

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16]
];

export default function GlobalAdaptiveHalftoneTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => {
      const isMobileDevice = 
        mq.matches || 
        window.innerWidth < 1024 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      setIsTouch(isMobileDevice);
    };
    update();
    mq.addEventListener?.('change', update);
    window.addEventListener('resize', update);

    return () => {
      mq.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = window.innerWidth;
    let H = window.innerHeight;
    let cols = 0, rows = 0;
    
    const gridSize = 6;
    const influenceRadius = 75;
    const decay = 0.92;

    let activation: Float32Array | null = null;
    let dotColors: string[] = [];
    let active = new Set<number>();
    let raf: number;
    let isLooping = false;

    function buildGrid() {
      cols = Math.ceil(W / gridSize) + 1;
      rows = Math.ceil(H / gridSize) + 1;
      activation = new Float32Array(cols * rows);
      dotColors = new Array(cols * rows).fill('255, 255, 255');
      active = new Set<number>();
    }

    function resize() {
      if (!canvas || !ctx) return;
      W = window.innerWidth;
      H = window.innerHeight;
      if (W <= 0 || H <= 0) return;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function getContrastColorAt(px: number, py: number): string {
      try {
        const elem = document.elementFromPoint(px, py);
        if (elem) {
          if (elem.closest('#work')) {
            return '10, 10, 10';
          }
          if (elem.closest('#contact')) {
            return '0, 0, 0';
          }

          const style = window.getComputedStyle(elem);
          const bg = style.backgroundColor;

          if (bg && bg.startsWith('rgb')) {
            const match = bg.match(/\d+/g);
            if (match && match.length >= 3) {
              const r = parseInt(match[0], 10);
              const g = parseInt(match[1], 10);
              const b = parseInt(match[2], 10);
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum > 130) {
                return '10, 10, 10';
              }
            }
          }
        }
      } catch (e) {
        /* Fallback */
      }
      return '255, 255, 255';
    }

    function excite(px: number, py: number) {
      if (!activation) return;
      const colorForPoint = getContrastColorAt(px, py);

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
          const val = Math.pow(falloff, 1.3);
          if (val > activation[idx]) {
            activation[idx] = val;
            dotColors[idx] = colorForPoint;
          }
          active.add(idx);
        }
      }

      startLoop();
    }

    function pointerPos(e: MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    }

    let last: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
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

            // Dithering threshold por matriz Bayer 4x4
            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (a > threshold * 0.7) {
              const pixelSize = Math.max(1.5, Math.min(gridSize - 0.5, (a - threshold * 0.3) * 4));
              ctx.fillStyle = `rgb(${dotColors[idx] || '255, 255, 255'})`;
              ctx.globalAlpha = Math.min(1, a * 1.5);
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);
            }
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onEnd);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onEnd);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9995]"
    />
  );
}
