import { useEffect, useRef, useState } from 'react';

export default function GlobalAdaptiveHalftoneTrail() {
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = window.innerWidth;
    let H = window.innerHeight;
    let cols = 0, rows = 0;
    
    const gridSize = 6;           // Fine dot grid spacing
    const influenceRadius = 75;   // Influence radius
    const dotRadius = 2.2;        // Fine small dot radius
    const decay = 0.92;           // Smooth decay

    let activation: Float32Array | null = null;
    let dotColors: string[] = [];  // Color string per grid index
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
          // Check closest section ID or computed background color
          if (elem.closest('#work')) {
            return '10, 10, 10'; // Black dots on light cream background (#FFFDF3)
          }
          if (elem.closest('#contact')) {
            return '0, 0, 0';   // Black dots on Electric Red banner (#FF1300)
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
                return '10, 10, 10'; // Dark dots on light background
              }
            }
          }
        }
      } catch (e) {
        /* Fallback */
      }
      return '255, 255, 255'; // White dots on dark background
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
          const val = Math.pow(falloff, 1.4);
          if (val > activation[idx]) {
            activation[idx] = val;
            dotColors[idx] = colorForPoint;
          }
          active.add(idx);
        }
      }

      startLoop();
    }

    function pointerPos(e: MouseEvent | TouchEvent) {
      const touch = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : null;
      const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
      return { x: clientX, y: clientY };
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

            ctx.fillStyle = `rgb(${dotColors[idx] || '255, 255, 255'})`;
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
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onEnd);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9995]"
      style={{
        cursor: isTouch ? 'auto' : 'none',
      }}
    />
  );
}
