import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail - Simulación de Fluidos Ksenia-K (Codepen jENEMjN)
 * con Tramado Dithering Bayer 4x4 PREDOMINANTE
 * 
 * 1. DEFORMACIÓN FLUIDA KSENIA-K (Codepen jENEMjN):
 *    Inercia de advección y ondas de desplazamiento líquido orgánico (water ripples / fluid mesh)
 *    al mover el ratón sobre la imagen.
 * 2. EFECTO DITHERING PREDOMINANTE:
 *    La malla del fluido está compuesta de forma dominante por píxeles de cuantización Bayer 4x4 
 *    de alto contraste (dither stipple matrix), haciendo que la trama digital sea la protagonista visual.
 * 3. RECUPERACIÓN NÍTIDA 100%:
 *    El fluido se disipa a 60 FPS (~0.9s) restaurando la fotografía original 100% impecable.
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
  gridSize = 6,             // Rejilla fina de alta resolución para Dithering Bayer 4x4 dominante
  influenceRadius = 135,    // Radio amplio de la onda de fluido Ksenia-K
  decay = 0.95,             // Inercia líquida fluida (~0.9s)
  warpStrength = 32,        // Fuerza de desplazamiento líquido
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

    // Campos Vectoriales de Simulación Fluida (Velocidades X, Y y Densidad de la onda Ksenia-K)
    let velX: Float32Array | null = null;
    let velY: Float32Array | null = null;
    let density: Float32Array | null = null;
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
      density = new Float32Array(size);
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

    // Inyecta velocidad de fluido al pasar el cursor (Simulación de Fluidos Ksenia-K jENEMjN)
    function injectFluidForce(px: number, py: number, vx: number, vy: number) {
      if (!velX || !velY || !density) return;

      const ix0 = Math.max(0, Math.floor((px - influenceRadius) / gridSize));
      const ix1 = Math.min(cols - 1, Math.ceil((px + influenceRadius) / gridSize));
      const iy0 = Math.max(0, Math.floor((py - influenceRadius) / gridSize));
      const iy1 = Math.min(rows - 1, Math.ceil((py + influenceRadius) / gridSize));

      const speed = Math.hypot(vx, vy);
      const forceScale = Math.min(3.0, Math.max(0.6, speed * 0.15));

      for (let iy = iy0; iy <= iy1; iy++) {
        for (let ix = ix0; ix <= ix1; ix++) {
          const gx = ix * gridSize, gy = iy * gridSize;
          const d = Math.hypot(gx - px, gy - py);
          if (d > influenceRadius) continue;
          const falloff = Math.pow(1 - d / influenceRadius, 1.25);
          const idx = iy * cols + ix;

          // Vorticidad fluida estilo Ksenia-K: el movimiento añade componente de remolino acuoso
          const angle = Math.atan2(gy - py, gx - px) + Math.PI * 0.45;
          const swirlX = Math.cos(angle) * speed * 0.4;
          const swirlY = Math.sin(angle) * speed * 0.4;

          velX[idx] += (vx + swirlX) * falloff * forceScale;
          velY[idx] += (vy + swirlY) * falloff * forceScale;
          density[idx] = Math.min(2.0, density[idx] + falloff * 1.2);

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
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.floor(dist / (gridSize * 1.1)));

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const curX = last.x + dx * t;
          const curY = last.y + dy * t;
          injectFluidForce(curX, curY, dx, dy);
        }
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

    function frame() {
      if (type === "video") {
        updateSampleFrame();
      }

      if (ctx && velX && velY && density) {
        // Base impecable
        drawBase();

        if (active.size > 0) {
          // 1. Simulación de Fluidos Ksenia-K: Advección + Desplazamiento Líquido
          for (const idx of Array.from(active)) {
            let vx = velX[idx] * decay;
            let vy = velY[idx] * decay;
            let d = density[idx] * decay;

            if (Math.abs(vx) < 0.006 && Math.abs(vy) < 0.006 && d < 0.01) {
              velX[idx] = 0;
              velY[idx] = 0;
              density[idx] = 0;
              active.delete(idx);
              continue;
            }

            velX[idx] = vx;
            velY[idx] = vy;
            density[idx] = d;

            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;

            // Deformación fluida de la foto por advección de velocidad
            if (warpStrength > 0 && sampleReady) {
              const tile = gridSize * 2.4;
              const shiftX = vx * (warpStrength * 0.4);
              const shiftY = vy * (warpStrength * 0.4);

              const sx = Math.min(W - tile, Math.max(0, gx - shiftX - tile / 2));
              const sy = Math.min(H - tile, Math.max(0, gy - shiftY - tile / 2));

              ctx.globalAlpha = Math.min(1, d * 1.3);
              ctx.drawImage(sample, sx, sy, tile, tile, gx - tile / 2, gy - tile / 2, tile, tile);
            }
          }

          // 2. EFECTO DITHERING PREDOMINANTE (Bayer 4x4 Stipple Matrix de Máxima Densidad)
          for (const idx of Array.from(active)) {
            const d = density[idx];
            if (d < 0.012) continue;

            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;

            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (d > threshold * 0.18) {
              const pixelSize = Math.max(2.6, Math.min(gridSize, (d - threshold * 0.08) * 8.0));

              // Perforación transparente para que asome el fondo oscuro
              ctx.globalCompositeOperation = "destination-out";
              ctx.fillStyle = "rgba(0,0,0,1)";
              ctx.globalAlpha = Math.min(1, d * 2.0);
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);

              // Trama Dithering Bayer 4x4 Predominante en Difference Invert Mode
              ctx.globalCompositeOperation = "difference";
              ctx.fillStyle = "rgb(255,255,255)";
              ctx.globalAlpha = Math.min(1, d * 2.5);
              ctx.fillRect(gx - pixelSize / 2, gy - pixelSize / 2, pixelSize, pixelSize);
              ctx.globalCompositeOperation = "source-over";
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
