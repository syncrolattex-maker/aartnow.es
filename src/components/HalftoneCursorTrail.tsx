import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail
 * Rastro de puntos (halftone) + distorsión ("bulge") del fondo, siguiendo al
 * cursor sobre una imagen o vídeo — recreación oficial del efecto de lamalama.com.
 *
 * Características:
 * - Rejilla fija de celdas sobre la imagen/vídeo.
 * - Al mover el cursor, las celdas se activan con caída exponencial y decaen suavemente.
 * - Copia de tiles desplazados según el gradiente local para generar el efecto "bulge" / burbuja.
 * - Desactivado en móviles para mantener un rendimiento 100% ligero y nativo.
 */

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
  type = "video",
  gridSize = 10,
  influenceRadius = 90,
  dotRadius = 3,
  decay = 0.93,
  warpStrength = 16,
  dotColor = "10,10,10",
  className = "",
  style = {},
}: HalftoneCursorTrailProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  // Detecta dispositivos táctiles / pantallas móviles para desactivar en móvil
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
        sctx.drawImage(source, 0, 0, W, H);
        sampleReady = true;
      } catch (e) {
        /* Fuente aún no lista o problema de CORS */
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
        // 1) Base: la imagen/vídeo íntegro
        drawBase();

        // 2) Por cada celda activa: tile desplazado (bulge) + punto de tinta
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
        } else if (type === "image") {
          // Pausar animación cuando no queden celdas activas en imágenes estáticas
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
  }, [src, type, gridSize, influenceRadius, dotRadius, decay, warpStrength, dotColor, isTouch]);

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
