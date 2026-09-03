import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * DitherCursorTrail (Fusión Total Negro + Imagen Sin Cuadro Delimitador)
 * Aplica difuminado de bordes (Feather Vignette) en los 4 márgenes de la imagen,
 * permitiendo que el negro del fondo y la imagen se mezclen de forma 100% orgánica
 * sin ningún cuadro o borde rectangular visible al pasar el cursor.
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

const BLEED_MARGIN = 40;

export default function HalftoneCursorTrail({
  src,
  type = "image",
  gridSize = 10,
  influenceRadius = 150,
  decay = 0.93,
  warpStrength = 32,
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

    // Actualiza la imagen e incluye un desvanecido de bordes (Feather Vignette) para eliminar el cuadro delimitador
    function updateSampleFrame() {
      if (!sctx || !source || stageW <= 0 || stageH <= 0) return;
      try {
        sctx.clearRect(0, 0, stageW, stageH);
        sctx.drawImage(source, 0, 0, stageW, stageH);

        // Aplicar máscara de gradiente de desvanecido en los 4 bordes para eliminar cualquier rectángulo
        const fade = Math.min(stageW, stageH) * 0.08;
        if (fade > 5) {
          sctx.globalCompositeOperation = "destination-out";

          // Borde Superior
          let gTop = sctx.createLinearGradient(0, 0, 0, fade);
          gTop.addColorStop(0, "rgba(0,0,0,1)");
          gTop.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = gTop;
          sctx.fillRect(0, 0, stageW, fade);

          // Borde Inferior
          let gBot = sctx.createLinearGradient(0, stageH - fade, 0, stageH);
          gBot.addColorStop(0, "rgba(0,0,0,0)");
          gBot.addColorStop(1, "rgba(0,0,0,1)");
          sctx.fillStyle = gBot;
          sctx.fillRect(0, stageH - fade, stageW, fade);

          // Borde Izquierdo
          let gLeft = sctx.createLinearGradient(0, 0, fade, 0);
          gLeft.addColorStop(0, "rgba(0,0,0,1)");
          gLeft.addColorStop(1, "rgba(0,0,0,0)");
          sctx.fillStyle = gLeft;
          sctx.fillRect(0, 0, fade, stageH);

          // Borde Derecho
          let gRight = sctx.createLinearGradient(stageW - fade, 0, stageW, 0);
          gRight.addColorStop(0, "rgba(0,0,0,0)");
          gRight.addColorStop(1, "rgba(0,0,0,1)");
          sctx.fillStyle = gRight;
          sctx.fillRect(stageW - fade, 0, fade, stageH);

          sctx.globalCompositeOperation = "source-over";
        }

        sampleReady = true;
      } catch (e) {
        /* Fuente no lista */
      }
    }

    function drawBase() {
      if (ctx && sampleReady && stageW > 0 && stageH > 0) {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(sample, BLEED_MARGIN, BLEED_MARGIN, stageW, stageH);
      }
    }

    function excite(px: number, py: number) {
      if (!activation) return;
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
        drawBase();

        if (active.size > 0) {
          // Fase 1: Deformación Warp orgánica sin marco delimitador
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
              const shiftX = dx * warpStrength * (1 + a * 0.7);
              const shiftY = dy * warpStrength * (1 + a * 0.7);

              const imgGx = gx - BLEED_MARGIN;
              const imgGy = gy - BLEED_MARGIN;

              const sx = Math.min(stageW - tile, Math.max(0, imgGx - shiftX - tile / 2));
              const sy = Math.min(stageH - tile, Math.max(0, imgGy - shiftY - tile / 2));

              ctx.globalAlpha = Math.min(1, a * 1.4);
              ctx.drawImage(sample, sx, sy, tile, tile, gx - tile / 2, gy - tile / 2, tile, tile);
            }
          }

          // Fase 2: Tramado Dithering Bayer 4x4 fusionando el negro del fondo con la imagen
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
        } else if (type === "image") {
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
      className={`relative w-full h-full overflow-visible bg-black ${className}`}
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
