import { useEffect, useRef, useState } from 'react';

/**
 * GlobalAdaptiveHalftoneTrail — Efecto Lama Lama (lamalama.com)
 *
 * Rastro de puntos Ordered Dithering (Bayer 4×4) sobre TODA la web.
 * - Rejilla fija de celdas (GRID_SIZE px de separación)
 * - DOT_RADIUS fijo — NO varía con activación (esto NO es halftone)
 * - Activación (0→1) por celda con falloff suave cuadrático
 * - Decay por frame → efecto "cometa" con cola que se desvanece
 * - Celda se pinta si activation > threshold Bayer (ordered dithering)
 * - globalCompositeOperation "difference" + blanco → claro/oscuro automático
 * - Se pausa cuando el menú está abierto (data-menu-open="true")
 */

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

const GRID_SIZE   = 6;    // px entre celdas (~5-7px, medido en Lama Lama)
const DOT_RADIUS  = 1.5;  // radio fijo del punto en px — constante
const INFLUENCE_R = 82;   // radio de influencia del cursor (~70-90px)
const DECAY       = 0.91; // decaimiento por frame a 60fps
const THRESHOLD_K = 0.28; // sensibilidad del threshold Bayer

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
        (navigator.maxTouchPoints > 0);
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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, cols = 0, rows = 0;
    let activation: Float32Array | null = null;
    let active = new Set<number>();
    let raf = 0;
    let isLooping = false;

    function buildGrid() {
      cols = Math.ceil(W / GRID_SIZE) + 1;
      rows = Math.ceil(H / GRID_SIZE) + 1;
      activation = new Float32Array(cols * rows);
      active = new Set<number>();
    }

    function resize() {
      if (!canvas || !ctx) return;
      W = window.innerWidth;
      H = window.innerHeight;
      if (W <= 0 || H <= 0) return;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function excite(px: number, py: number) {
      if (!activation) return;
      if (document.body.getAttribute('data-menu-open') === 'true') return;

      const ix0 = Math.max(0, Math.floor((px - INFLUENCE_R) / GRID_SIZE));
      const ix1 = Math.min(cols - 1, Math.ceil((px + INFLUENCE_R) / GRID_SIZE));
      const iy0 = Math.max(0, Math.floor((py - INFLUENCE_R) / GRID_SIZE));
      const iy1 = Math.min(rows - 1, Math.ceil((py + INFLUENCE_R) / GRID_SIZE));

      for (let iy = iy0; iy <= iy1; iy++) {
        for (let ix = ix0; ix <= ix1; ix++) {
          const gx = ix * GRID_SIZE, gy = iy * GRID_SIZE;
          const dist = Math.hypot(gx - px, gy - py);
          if (dist > INFLUENCE_R) continue;
          // Falloff cuadrático suave: 1 en el cursor, 0 en el borde
          const t = 1 - dist / INFLUENCE_R;
          const val = t * t;
          const idx = iy * cols + ix;
          if (val > activation[idx]) activation[idx] = val;
          active.add(idx);
        }
      }

      startLoop();
    }

    let last: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
      if (document.body.getAttribute('data-menu-open') === 'true') return;
      const p = { x: e.clientX, y: e.clientY };
      if (last) {
        const dist  = Math.hypot(p.x - last.x, p.y - last.y);
        const steps = Math.max(1, Math.floor(dist / (GRID_SIZE * 1.5)));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          excite(last.x + (p.x - last.x) * t, last.y + (p.y - last.y) * t);
        }
      } else {
        excite(p.x, p.y);
      }
      last = p;
    }

    function onLeave() { last = null; }

    function startLoop() {
      if (!isLooping) {
        isLooping = true;
        raf = requestAnimationFrame(frame);
      }
    }

    function frame() {
      if (!ctx || !activation) return;

      if (document.body.getAttribute('data-menu-open') === 'true') {
        ctx.clearRect(0, 0, W, H);
        isLooping = false;
        return;
      }

      ctx.clearRect(0, 0, W, H);

      if (active.size === 0) {
        isLooping = false;
        return;
      }

      // Un único save/restore — difference + blanco — todos los puntos en 1 fill()
      ctx.save();
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.88;
      ctx.beginPath();

      for (const idx of Array.from(active)) {
        activation[idx] *= DECAY;
        const a = activation[idx];

        if (a < 0.012) {
          activation[idx] = 0;
          active.delete(idx);
          continue;
        }

        const iy = (idx / cols) | 0;
        const ix = idx % cols;
        const threshold = BAYER_4X4[iy % 4][ix % 4];
        if (a <= threshold * THRESHOLD_K) continue;

        const cx = ix * GRID_SIZE + GRID_SIZE * 0.5;
        const cy = iy * GRID_SIZE + GRID_SIZE * 0.5;
        ctx.moveTo(cx + DOT_RADIUS, cy);
        ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
      }

      ctx.fill(); // un solo fill para todos los puntos
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width:  '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99,
      }}
    />
  );
}
