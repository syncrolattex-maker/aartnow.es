import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * DitherHoverField (Bayer 4x4 Digital Tramado)
 * Reemplaza la estética de halftone por un tramado digital (Dithering)
 * ultra estético y reactivo al cursor sobre fondos planos.
 */

interface HalftoneHoverFieldProps {
  gridSize?: number;
  influenceRadius?: number;
  dotRadius?: number;
  decay?: number;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
}

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16]
];

export default function HalftoneHoverField({
  gridSize = 6,
  influenceRadius = 90,
  decay = 0.90,
  dotColor = "255,255,255",
  className = "",
  style = {},
}: HalftoneHoverFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => {
      const isMobileDevice = 
        mq.matches || 
        window.innerWidth < 1024 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      setIsTouch(isMobileDevice);
    };
    update();
    mq.addEventListener?.("change", update);
    window.addEventListener("resize", update);

    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, cols = 0, rows = 0;
    let activation: Float32Array | null = null;
    let active = new Set<number>();
    let raf: number;

    function buildGrid() {
      cols = Math.ceil(W / gridSize) + 1;
      rows = Math.ceil(H / gridSize) + 1;
      activation = new Float32Array(cols * rows);
      active = new Set<number>();
    }

    function resize() {
      if (!host || !canvas || !ctx) return;
      const rect = host.getBoundingClientRect();
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
          const val = Math.pow(falloff, 1.3);
          if (val > activation[idx]) activation[idx] = val;
          active.add(idx);
        }
      }
    }

    function pointerPos(e: MouseEvent) {
      if (!host) return { x: 0, y: 0 };
      const rect = host.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

    function onLeave() { 
      last = null; 
    }

    function frame() {
      if (ctx && activation) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = `rgb(${dotColor})`;

        if (active.size > 0) {
          for (const idx of Array.from(active)) {
            let a = activation[idx] * decay;
            if (a < 0.02) { 
              activation[idx] = 0; 
              active.delete(idx); 
              continue; 
            }
            activation[idx] = a;

            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;

            // Dithering threshold mediante matriz Bayer 4x4
            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (a > threshold * 0.75) {
              const pixelSize = Math.max(1.5, Math.min(gridSize - 1, (a - threshold * 0.3) * 4));
              ctx.globalAlpha = Math.min(1, a * 1.5);
              // Pincel píxel cuadrado para acabado Dithering digital brutalista
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);

    const parent = host.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", onMove);
      parent.addEventListener("mouseleave", onLeave);
    } else {
      host.addEventListener("mousemove", onMove);
      host.addEventListener("mouseleave", onLeave);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (parent) {
        parent.removeEventListener("mousemove", onMove);
        parent.removeEventListener("mouseleave", onLeave);
      } else {
        host.removeEventListener("mousemove", onMove);
        host.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [gridSize, influenceRadius, decay, dotColor, isTouch]);

  if (isTouch) return null;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} 
      />
    </div>
  );
}
