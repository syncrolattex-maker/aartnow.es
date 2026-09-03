import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail - Fusión Exclusiva de 2 Efectos (100% Ultra-Rápido 60FPS)
 * 
 * FUSIÓN ÚNICA Y LIGERA:
 * 1. Deformación Líquida Ksenia-K (Desplazamiento por vectores de velocidad al mover el ratón).
 * 2. Tramado Dithering Bayer 4x4 (Cuantización de píxeles gráficos de alto contraste).
 * 
 * Se han eliminado todas las demás capas y cálculos adicionales para lograr máxima velocidad 60FPS sin lag.
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
  [15/16,  7/16, 13/16,  5/16]
];

export default function HalftoneCursorTrail({
  src,
  type = "image",
  gridSize = 12,            // Rejilla super ligera para 60 FPS instantáneos
  influenceRadius = 120,    // Radio de respuesta
  decay = 0.90,             // Disipación rápida y ágil
  warpStrength = 30,        // Fuerza de deformación fluida Ksenia-K
  invert = true,
  dotColor = "255,255,255",
  className = "",
  style = {},
}: HalftoneCursorTrailProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
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

    const stage = stageRef.current;
    const source = sourceRef.current;
    const canvas = canvasRef.current;
    if (!stage || !source || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sample = document.createElement("canvas");
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, cols = 0, rows = 0;

    let velX: Float32Array | null = null;
    let velY: Float32Array | null = null;
    let active = new Set<number>();
    let raf: number;
    let isLooping = false;
    let sampleReady = false;

    function buildGrid() {
      cols = Math.ceil(W / gridSize) + 1;
      rows = Math.ceil(H / gridSize) + 1;
      const size = cols * rows;
      velX = new Float32Array(size);
      velY = new Float32Array(size);
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

      sample.width = W;
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
      } catch (e) {
        /* Fuente no lista */
      }
    }

    function drawBase() {
      if (ctx && sampleReady && W > 0 && H > 0) {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(sample, 0, 0, W, H);
      }
    }

    function injectFluidForce(px: number, py: number, vx: number, vy: number) {
      if (!velX || !velY) return;

      const ix0 = Math.max(0, Math.floor((px - influenceRadius) / gridSize));
      const ix1 = Math.min(cols - 1, Math.ceil((px + influenceRadius) / gridSize));
      const iy0 = Math.max(0, Math.floor((py - influenceRadius) / gridSize));
      const iy1 = Math.min(rows - 1, Math.ceil((py + influenceRadius) / gridSize));

      const speed = Math.hypot(vx, vy);
      const forceScale = Math.min(2.0, Math.max(0.4, speed * 0.1));

      for (let iy = iy0; iy <= iy1; iy++) {
        for (let ix = ix0; ix <= ix1; ix++) {
          const gx = ix * gridSize, gy = iy * gridSize;
          const d = Math.hypot(gx - px, gy - py);
          if (d > influenceRadius) continue;
          const falloff = 1 - d / influenceRadius;
          const idx = iy * cols + ix;

          velX[idx] += vx * falloff * forceScale;
          velY[idx] += vy * falloff * forceScale;

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
        const dx = p.x - last.x;
        const dy = p.y - last.y;
        injectFluidForce(p.x, p.y, dx, dy);
      } else {
        injectFluidForce(p.x, p.y, 0, 0);
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

    // Bucle ultra-ligero de 2 efectos fusionados (1. Deformación Ksenia-K + 2. Dithering Bayer 4x4)
    function frame() {
      if (type === "video") {
        updateSampleFrame();
      }

      if (ctx && velX && velY) {
        drawBase();

        if (active.size > 0) {
          for (const idx of Array.from(active)) {
            let vx = velX[idx] * decay;
            let vy = velY[idx] * decay;

            if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
              velX[idx] = 0;
              velY[idx] = 0;
              active.delete(idx);
              continue;
            }

            velX[idx] = vx;
            velY[idx] = vy;

            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;
            const speed = Math.hypot(vx, vy);

            // EFECTO 1: Deformación Ksenia-K (Desplazamiento por vectores de velocidad)
            const shiftX = vx * (warpStrength * 0.3);
            const shiftY = vy * (warpStrength * 0.3);
            const sx = Math.min(W - gridSize, Math.max(0, gx - shiftX));
            const sy = Math.min(H - gridSize, Math.max(0, gy - shiftY));

            // Dibujar trozo deformado Ksenia-K
            ctx.globalAlpha = Math.min(1, speed * 0.15);
            ctx.drawImage(sample, sx, sy, gridSize, gridSize, gx, gy, gridSize, gridSize);

            // EFECTO 2: Tramado Dithering Bayer 4x4 (Píxeles de contraste)
            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (speed * 0.08 > threshold * 0.3) {
              const pixelSize = Math.max(3, gridSize * 0.85);
              ctx.globalCompositeOperation = "difference";
              ctx.fillStyle = "rgb(255,255,255)";
              ctx.globalAlpha = Math.min(1, speed * 0.2);
              ctx.fillRect(gx, gy, pixelSize, pixelSize);
              ctx.globalCompositeOperation = "source-over";
            }
          }

          ctx.globalAlpha = 1;
        } else {
          drawBase();
          isLooping = false;
          return;
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onEnd);

    const onLoaded = () => {
      updateSampleFrame();
      drawBase();
    };

    if (type === "image") {
      const img = source as HTMLImageElement;
      if (img.complete) onLoaded();
      img.addEventListener("load", onLoaded);
    } else {
      const video = source as HTMLVideoElement;
      video.addEventListener("loadeddata", onLoaded);
      startLoop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onEnd);
      if (type === "image") {
        (source as HTMLImageElement).removeEventListener("load", onLoaded);
      } else {
        (source as HTMLVideoElement).removeEventListener("loadeddata", onLoaded);
      }
    };
  }, [src, type, gridSize, influenceRadius, decay, warpStrength, invert, dotColor, isTouch]);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        cursor: isTouch ? "auto" : "none",
        ...style,
      }}
    >
      {type === "video" ? (
        <video
          ref={sourceRef as React.RefObject<HTMLVideoElement>}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", visibility: isTouch ? "visible" : "hidden" }}
        />
      ) : (
        <img
          ref={sourceRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt=""
          crossOrigin="anonymous"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", visibility: isTouch ? "visible" : "hidden" }}
        />
      )}
      {!isTouch && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
    </div>
  );
}
