import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail — Efecto Lama Lama sobre imagenes en /cases/
 *
 * Puntos de radio fijo (Bayer 4x4 ordered dithering) + distorsion lente suave
 * usando gradiente local de activacion como UV offset.
 *
 * 1. DITHER: mismos puntos fijos DOT_RADIUS, threshold Bayer, difference blend
 * 2. LENTE: gradiente local de activacion -> UV displacement -> abombamiento burbuja
 */

interface HalftoneCursorTrailProps {
  src: string;
  type?: 'video' | 'image';
  gridSize?: number;
  influenceRadius?: number;
  decay?: number;
  warpStrength?: number;
  invert?: boolean;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
}

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

const DOT_RADIUS  = 1.5;
const THRESHOLD_K = 0.28;

export default function HalftoneCursorTrail({
  src,
  type = 'image',
  gridSize        = 6,
  influenceRadius = 82,
  decay           = 0.91,
  warpStrength    = 14,
  className       = '',
  style           = {},
}: HalftoneCursorTrailProps) {
  const stageRef  = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => {
      setIsTouch(
        mq.matches ||
        window.innerWidth < 1024 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
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

    const stage  = stageRef.current;
    const source = sourceRef.current;
    const canvas = canvasRef.current;
    if (!stage || !source || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sample = document.createElement('canvas');
    const sctx   = sample.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, cols = 0, rows = 0;
    let activation: Float32Array | null = null;
    let active = new Set<number>();
    let raf = 0;
    let isLooping   = false;
    let sampleReady = false;

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
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample.width  = W;
      sample.height = H;
      buildGrid();
      updateSampleFrame();
      drawBase();
    }

    function updateSampleFrame() {
      if (!sctx || !source || W <= 0 || H <= 0) return;
      try {
        sctx.clearRect(0, 0, W, H);
        sctx.drawImage(source, 0, 0, W, H);
        sampleReady = true;
      } catch (_) { /* fuente no lista */ }
    }

    function drawBase() {
      if (ctx && sampleReady && W > 0 && H > 0) {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(sample, 0, 0, W, H);
      }
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
          const dist = Math.hypot(gx - px, gy - py);
          if (dist > influenceRadius) continue;
          const t   = 1 - dist / influenceRadius;
          const val = t * t;
          const idx = iy * cols + ix;
          if (val > activation[idx]) activation[idx] = val;
          active.add(idx);
        }
      }
      startLoop();
    }

    function pointerPos(e: MouseEvent) {
      if (!stage) return { x: 0, y: 0 };
      const rect = stage.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    let last: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
      const p = pointerPos(e);
      if (last) {
        const dist  = Math.hypot(p.x - last.x, p.y - last.y);
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

    function onEnd() { last = null; }

    function startLoop() {
      if (!isLooping) {
        isLooping = true;
        raf = requestAnimationFrame(frame);
      }
    }

    function frame() {
      if (type === 'video') updateSampleFrame();
      if (!ctx || !activation) return;

      if (active.size === 0) {
        drawBase();
        isLooping = false;
        return;
      }

      drawBase();

      // Convertir Set a Array UNA sola vez — reutilizado en ambos passes
      const activeArr = Array.from(active);

      // ── Paso 1: Lente de distorsión (UV offset por gradiente de activación)
      // Optimización: checkerboard skip (solo celdas pares ix+iy) con tile 2× para
      // cubrir el mismo área con la mitad de llamadas drawImage
      if (warpStrength > 0 && sampleReady) {
        const tileSize = gridSize * 2; // tile doble compensa el skip
        ctx.save();
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < activeArr.length; i++) {
          const idx = activeArr[i];
          const a = activation[idx];
          if (a < 0.1) continue; // solo celdas con activación significativa

          const iy = (idx / cols) | 0;
          const ix = idx % cols;
          if ((ix + iy) & 1) continue; // checkerboard: solo pares — 50% menos drawImage

          const idxL = iy * cols + Math.max(0, ix - 1);
          const idxR = iy * cols + Math.min(cols - 1, ix + 1);
          const idxU = Math.max(0, iy - 1) * cols + ix;
          const idxD = Math.min(rows - 1, iy + 1) * cols + ix;

          const gradX = (activation[idxR] - activation[idxL]) * 0.5;
          const gradY = (activation[idxD] - activation[idxU]) * 0.5;

          const gx = ix * gridSize;
          const gy = iy * gridSize;
          const sx = Math.min(W - tileSize, Math.max(0, gx - gradX * warpStrength));
          const sy = Math.min(H - tileSize, Math.max(0, gy - gradY * warpStrength));
          const tileW = Math.min(tileSize, W - gx);
          const tileH = Math.min(tileSize, H - gy);
          if (tileW <= 0 || tileH <= 0) continue;

          ctx.drawImage(sample, sx, sy, tileW, tileH, gx, gy, tileW, tileH);
        }
        ctx.restore();
      }

      // ── Paso 2: Dither Bayer 4×4 BATCHED — 1 sola llamada fill() para todos los puntos
      // Esto sustituye N llamadas beginPath/arc/fill por una sola → 10-20× más rápido
      ctx.save();
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.88; // alpha fijo — permite batch completo
      ctx.beginPath();

      for (let i = 0; i < activeArr.length; i++) {
        const idx = activeArr[i];
        activation[idx] *= decay;
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

        // Añadir al path — NO fill() aquí, lo hacemos una sola vez abajo
        const cx = ix * gridSize + gridSize * 0.5;
        const cy = iy * gridSize + gridSize * 0.5;
        ctx.moveTo(cx + DOT_RADIUS, cy);
        ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
      }

      ctx.fill(); // ← UN SOLO fill() para todos los puntos del frame
      ctx.restore();



      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onEnd);

    const onLoaded = () => { updateSampleFrame(); drawBase(); };

    if (type === 'image') {
      const img = source as HTMLImageElement;
      if (img.complete) onLoaded();
      img.addEventListener('load', onLoaded);
    } else {
      const video = source as HTMLVideoElement;
      video.addEventListener('loadeddata', onLoaded);
      startLoop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onEnd);
      if (type === 'image') {
        (source as HTMLImageElement).removeEventListener('load', onLoaded);
      } else {
        (source as HTMLVideoElement).removeEventListener('loadeddata', onLoaded);
      }
    };
  }, [src, type, gridSize, influenceRadius, decay, warpStrength, isTouch]);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ cursor: isTouch ? 'auto' : 'none', ...style }}
    >
      {type === 'video' ? (
        <video
          ref={sourceRef as React.RefObject<HTMLVideoElement>}
          src={src}
          autoPlay muted loop playsInline
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                   visibility: isTouch ? 'visible' : 'hidden' }}
        />
      ) : (
        <img
          ref={sourceRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt=""
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                   visibility: isTouch ? 'visible' : 'hidden' }}
        />
      )}
      {!isTouch && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}