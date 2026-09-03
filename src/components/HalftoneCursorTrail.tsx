import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail - Réplica Exacta del Efecto "Lama Lama - Jack & AI"
 * 
 * Alta visibilidad de la aparición del fondo oscuro al pasar el cursor sobre la imagen:
 * 1. En reposo: Imagen nítida en su contenedor.
 * 2. Al mover el cursor: Perforación Dithering Bayer 4x4 muy marcada que hace ASOMAR EL FONDO OSCURO 
 *    con alta visibilidad y contraste, combinada con deformación líquida de lente.
 * 3. En 0.8s: Desvanecimiento suave que RECUPERA la foto original 100% impecable.
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
  gridSize = 8,
  influenceRadius = 145,    // Radio amplio de estela para máxima visibilidad
  decay = 0.90,             // Inercia de desvanecido suave (~0.8s)
  warpStrength = 32,        // Deformación fluida de lente pronunciada
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
        const steps = Math.max(1, Math.floor(dist / (gridSize * 1.2)));
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
          // Fase 1: Deformación Warp Líquida al paso del cursor
          if (warpStrength > 0 && sampleReady) {
            for (const idx of Array.from(active)) {
              const a = activation[idx];
              if (a < 0.02) continue;

              const iy = (idx / cols) | 0;
              const ix = idx % cols;
              const gx = ix * gridSize, gy = iy * gridSize;

              const dx = activationAt(ix + 1, iy) - activationAt(ix - 1, iy);
              const dy = activationAt(ix, iy + 1) - activationAt(ix, iy - 1);

              const tile = gridSize * 2.6;
              const shiftX = dx * warpStrength * (1 + a * 0.6);
              const shiftY = dy * warpStrength * (1 + a * 0.6);

              const sx = Math.min(W - tile, Math.max(0, gx - shiftX - tile / 2));
              const sy = Math.min(H - tile, Math.max(0, gy - shiftY - tile / 2));

              ctx.globalAlpha = Math.min(1, a * 1.4);
              ctx.drawImage(sample, sx, sy, tile, tile, gx - tile / 2, gy - tile / 2, tile, tile);
            }
          }

          // Fase 2: Perforación Dithering Bayer 4x4 de ALTA VISIBILIDAD para asomar el fondo oscuro
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

            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (a > threshold * 0.35) {
              const pixelSize = Math.max(3.0, Math.min(gridSize * 1.1, (a - threshold * 0.15) * 6.5));

              // Perforar la foto intensamente permitiendo que asome el fondo oscuro de la web de forma muy visible
              ctx.globalCompositeOperation = "destination-out";
              ctx.fillStyle = "rgba(0,0,0,1)";
              ctx.globalAlpha = Math.min(1, a * 2.2);
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);

              // Trama secundaria de acento Dithering de alto contraste en el perimetro
              if (a > threshold * 0.7) {
                ctx.globalCompositeOperation = "source-over";
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.globalAlpha = Math.min(1, a * 1.8);
                ctx.fillRect(gx - pixelSize / 4, gy - pixelSize / 4, pixelSize / 2, pixelSize / 2);
              }
            }
          }

          ctx.globalCompositeOperation = "source-over";
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
