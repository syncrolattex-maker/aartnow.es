import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * DitherCursorTrail (Fusión Total Fondo + Imagen con Bleed Extendido)
 * Deforma la imagen Y el fondo exterior de la web como una sola masa líquida unificada,
 * permitiendo que la foto se desborde y fusione con el fondo de la página.
 */

interface HalftoneCursorTrailProps {
  src: string;
  type?: 'video' | 'image';
  gridSize?: number;
  influenceRadius?: number;
  dotRadius?: number;
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

// Margen de sangrado para permitir que la deformación se fusione con el fondo fuera de la caja
const BLEED_MARGIN = 50;

export default function HalftoneCursorTrail({
  src,
  type = "image",
  gridSize = 10,
  influenceRadius = 150,
  decay = 0.93,
  warpStrength = 35,
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
    let stageW = 0, stageH = 0, W = 0, H = 0, cols = 0, rows = 0;
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
      stageW = rect.width; 
      stageH = rect.height;
      if (stageW <= 0 || stageH <= 0) return;

      // El área del Canvas incluye un margen de sangrado (Bleed) exterior para que se fusione con el fondo
      W = stageW + BLEED_MARGIN * 2;
      H = stageH + BLEED_MARGIN * 2;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sample.width = stageW;
      sample.height = stageH;

      buildGrid();
      updateSampleFrame();
      drawBase();
    }

    function updateSampleFrame() {
      if (!sctx || !source || stageW <= 0 || stageH <= 0) return;
      try {
        sctx.drawImage(source, 0, 0, stageW, stageH);
        sampleReady = true;
      } catch (e) {
        /* Fuente no lista */
      }
    }

    function drawBase() {
      if (ctx && sampleReady && stageW > 0 && stageH > 0) {
        ctx.clearRect(0, 0, W, H);
        // Dibujar la imagen centrada dentro del canvas sangrado
        ctx.drawImage(sample, BLEED_MARGIN, BLEED_MARGIN, stageW, stageH);
      }
    }

    function excite(px: number, py: number) {
      if (!activation) return;
      // Posición del ratón ajustada con el offset de sangrado
      const cx = px + BLEED_MARGIN;
      const cy = py + BLEED_MARGIN;

      const ix0 = Math.max(0, Math.floor((cx - influenceRadius) / gridSize));
      const ix1 = Math.min(cols - 1, Math.ceil((cx + influenceRadius) / gridSize));
      const iy0 = Math.max(0, Math.floor((cy - influenceRadius) / gridSize));
      const iy1 = Math.min(rows - 1, Math.ceil((cy + influenceRadius) / gridSize));

      for (let iy = iy0; iy <= iy1; iy++) {
        for (let ix = ix0; ix <= ix1; ix++) {
          const gx = ix * gridSize, gy = iy * gridSize;
          const d = Math.hypot(gx - cx, gy - cy);
          if (d > influenceRadius) continue;
          const falloff = 1 - d / influenceRadius;
          const idx = iy * cols + ix;
          const val = Math.pow(falloff, 1.1);
          if (val > activation[idx]) activation[idx] = val;
          active.add(idx);
        }
      }

      startLoop();
    }

    function activationAt(ix: number, iy: number) {
      if (!activation) return 0;
      const cIx = Math.max(0, Math.min(cols - 1, ix));
      const cIy = Math.max(0, Math.min(rows - 1, iy));
      return activation[cIy * cols + cIx];
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
      if (type === "video") {
        updateSampleFrame();
      }

      if (ctx && activation) {
        // Base de la imagen centrada
        drawBase();

        if (active.size > 0) {
          // Fase 1: Deformación Warp extendida que desborda la foto sobre el fondo
          if (warpStrength > 0 && sampleReady) {
            for (const idx of Array.from(active)) {
              const a = activation[idx];
              if (a < 0.02) continue;

              const iy = (idx / cols) | 0;
              const ix = idx % cols;
              const gx = ix * gridSize, gy = iy * gridSize;

              const dx = activationAt(ix + 1, iy) - activationAt(ix - 1, iy);
              const dy = activationAt(ix, iy + 1) - activationAt(ix, iy - 1);

              const tile = gridSize * 2.8;
              const shiftX = dx * warpStrength * (1 + a * 0.8);
              const shiftY = dy * warpStrength * (1 + a * 0.8);

              // Coordenadas relativas a la imagen original
              const imgGx = gx - BLEED_MARGIN;
              const imgGy = gy - BLEED_MARGIN;

              const sx = Math.min(stageW - tile, Math.max(0, imgGx - shiftX - tile / 2));
              const sy = Math.min(stageH - tile, Math.max(0, imgGy - shiftY - tile / 2));

              ctx.globalAlpha = Math.min(1, a * 1.4);
              ctx.drawImage(sample, sx, sy, tile, tile, gx - tile / 2, gy - tile / 2, tile, tile);
            }
          }

          // Fase 2: Cuantización Dithering Bayer 4x4 fusionada que abarca foto y fondo
          if (invert) {
            ctx.globalCompositeOperation = "difference";
            ctx.fillStyle = "rgb(255,255,255)";
          } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = `rgb(${dotColor})`;
          }

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

            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (a > threshold * 0.55) {
              const pixelSize = Math.max(2.0, Math.min(gridSize, (a - threshold * 0.25) * 4.5));
              ctx.globalAlpha = Math.min(1, a * 1.6);
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);
            }
          }

          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1;

          // Fase 3: Deformación fluida del marco exterior de la foto fusionado con el fondo
          drawFusedLiquidBorder(ctx, stageW, stageH);

        } else if (type === "image") {
          isLooping = false;
          return;
        }
      }

      raf = requestAnimationFrame(frame);
    }

    // Dibuja el marco de la foto deformándose fluidamente hacia el fondo exterior
    function drawFusedLiquidBorder(c: CanvasRenderingContext2D, sW: number, sH: number) {
      const step = 8;
      const b = BLEED_MARGIN;

      c.beginPath();
      c.strokeStyle = "rgba(255, 255, 255, 0.7)";
      c.lineWidth = 2;

      // 1. Borde Superior
      for (let x = 0; x <= sW; x += step) {
        const gx = x + b;
        const ix = Math.floor(gx / gridSize);
        const iy = Math.floor(b / gridSize);
        const dy = activationAt(ix, iy + 1) - activationAt(ix, iy - 1);
        const yOffset = b + dy * warpStrength * 0.9;
        if (x === 0) c.moveTo(gx, yOffset);
        else c.lineTo(gx, yOffset);
      }

      // 2. Borde Derecho
      for (let y = 0; y <= sH; y += step) {
        const gy = y + b;
        const iy = Math.floor(gy / gridSize);
        const ix = Math.floor((sW + b) / gridSize);
        const dx = activationAt(ix + 1, iy) - activationAt(ix - 1, iy);
        const xOffset = sW + b + dx * warpStrength * 0.9;
        c.lineTo(xOffset, gy);
      }

      // 3. Borde Inferior
      for (let x = sW; x >= 0; x -= step) {
        const gx = x + b;
        const ix = Math.floor(gx / gridSize);
        const iy = Math.floor((sH + b) / gridSize);
        const dy = activationAt(ix, iy + 1) - activationAt(ix, iy - 1);
        const yOffset = sH + b + dy * warpStrength * 0.9;
        c.lineTo(gx, yOffset);
      }

      // 4. Borde Izquierdo
      for (let y = sH; y >= 0; y -= step) {
        const gy = y + b;
        const iy = Math.floor(gy / gridSize);
        const ix = Math.floor(b / gridSize);
        const dx = activationAt(ix + 1, iy) - activationAt(ix - 1, iy);
        const xOffset = b + dx * warpStrength * 0.9;
        c.lineTo(xOffset, gy);
      }

      c.closePath();
      c.stroke();
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
      className={`relative w-full h-full overflow-visible ${className}`}
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
            top: -BLEED_MARGIN,
            left: -BLEED_MARGIN,
            width: `calc(100% + ${BLEED_MARGIN * 2}px)`,
            height: `calc(100% + ${BLEED_MARGIN * 2}px)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
