import { useEffect, useRef, useState, CSSProperties } from 'react';

interface HalftoneCursorTrailProps {
  src: string;
  type?: 'video' | 'image';
  gridSize?: number;
  influenceRadius?: number;
  dotRadius?: number;
  decay?: number;
  warpStrength?: number;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
}

export default function HalftoneCursorTrail({
  src,
  type = 'image',
  gridSize = 12, // Optimized grid size
  influenceRadius = 90,
  dotRadius = 3.5,
  decay = 0.93,
  warpStrength = 16,
  dotColor = '255,19,0', // Default: Jack & AI Electric Red (#FF1300)
  className = '',
  style = {},
}: HalftoneCursorTrailProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  // Detect touch pointer
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const source = sourceRef.current;
    const canvas = canvasRef.current;
    if (!stage || !source || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;

    // Optimized DPR cap (max 1.5x) for ultra-fast rendering on high-DPI Retina screens
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, cols = 0, rows = 0;
    let activation: Float32Array | null = null;
    let active = new Set<number>();
    let raf: number;
    let isLooping = false;
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

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample.width = Math.max(1, W);
      sample.height = Math.max(1, H);
      buildGrid();
      updateSampleFrame();
      drawBase();
    }

    function updateSampleFrame() {
      if (!sctx || !source || W <= 0 || H <= 0) return;
      try {
        sctx.drawImage(source, 0, 0, W, H);
        sampleReady = true;
      } catch (e) {
        /* Source frame not ready or CORS constraint */
      }
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

    function activationAt(ix: number, iy: number) {
      if (!activation || ix < 0 || iy < 0 || ix >= cols || iy >= rows) return 0;
      return activation[iy * cols + ix];
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
      if (type === 'video') {
        updateSampleFrame();
      }

      if (ctx && activation) {
        // 1) Base full frame render
        drawBase();

        // 2) Displaced grid tiles (Bulge) + Ink dots
        if (active.size > 0) {
          ctx.fillStyle = `rgb(${dotColor})`;
          
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

            if (warpStrength > 0 && sampleReady) {
              const dx = activationAt(ix + 1, iy) - activationAt(ix - 1, iy);
              const dy = activationAt(ix, iy + 1) - activationAt(ix, iy - 1);

              const tile = gridSize * 1.4;
              const sx = Math.min(W - tile, Math.max(0, gx - dx * warpStrength - tile / 2));
              const sy = Math.min(H - tile, Math.max(0, gy - dy * warpStrength - tile / 2));
              const dxDest = Math.min(W - tile, Math.max(0, gx - tile / 2));
              const dyDest = Math.min(H - tile, Math.max(0, gy - tile / 2));

              ctx.globalAlpha = 1;
              ctx.drawImage(sample, sx, sy, tile, tile, dxDest, dyDest, tile, tile);
            }

            const r = dotRadius * a;
            ctx.globalAlpha = Math.min(1, a * 1.3);
            ctx.beginPath();
            ctx.arc(gx, gy, Math.max(0.3, r), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (type === 'image') {
          // Pause animation loop when no active cells remain for static images
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

    const onLoaded = () => {
      updateSampleFrame();
      drawBase();
    };

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
      stage.removeEventListener('touchmove', onMove);
      stage.removeEventListener('touchend', onEnd);
      if (type === 'image') {
        (source as HTMLImageElement).removeEventListener('load', onLoaded);
      } else {
        (source as HTMLVideoElement).removeEventListener('loadeddata', onLoaded);
      }
    };
  }, [src, type, gridSize, influenceRadius, dotRadius, decay, warpStrength, dotColor]);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        cursor: isTouch ? 'auto' : 'none',
        ...style,
      }}
    >
      {type === 'video' ? (
        <video
          ref={sourceRef as React.RefObject<HTMLVideoElement>}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', visibility: 'hidden' }}
        />
      ) : (
        <img
          ref={sourceRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt=""
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', visibility: 'hidden' }}
        />
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
