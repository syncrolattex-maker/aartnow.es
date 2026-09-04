import { useEffect, useRef, useState, CSSProperties } from 'react';

/**
 * HalftoneCursorTrail — Deformacion Integral de Imagen (Malla WebGL Deformable) + Bayer 4x4 Dithering
 *
 * 1. DEFORMACION DE SILUETA / MALLA COMPLETA (WebGL Mesh):
 *    - La imagen se renderiza como una malla de triangulos subdividida (48x32).
 *    - Cada vertice (incluidos los bordes exteriores) se desplaza segun la velocidad
 *      y direccion del cursor (vector dx, dy de movimiento reciente).
 *    - El canvas cuenta con un sangrado (BLEED = 70px) y el contenedor usa overflow: visible,
 *      de modo que al arrastrar la imagen, los bordes exteriores se estiran organicamente
 *      hacia afuera y dejan ver el fondo oscuro por el lado contrario.
 *    - Al cesar el movimiento, la malla relaja elasticamente volviendo a su posicion original.
 *
 * 2. TRAMA DITHERING BAYER 4x4 (Lama Lama):
 *    - Puntos de radio fijo (1.5px) con blend mode 'difference' sobre la superficie activa.
 */

interface HalftoneCursorTrailProps {
  src: string;
  type?: 'video' | 'image';
  influenceRadius?: number;
  decay?: number;
  warpStrength?: number;
  className?: string;
  style?: CSSProperties;
}

const BAYER_4X4 = [
  [ 0/16,  8/16,  2/16, 10/16],
  [12/16,  4/16, 14/16,  6/16],
  [ 3/16, 11/16,  1/16,  9/16],
  [15/16,  7/16, 13/16,  5/16],
];

const BLEED       = 70;   // Margen de sangrado para que los bordes estiren fuera del marco
const COLS        = 48;   // Subdivision horizontal de la malla
const ROWS        = 32;   // Subdivision vertical de la malla
const DITHER_GRID = 6;    // Resolucion de la rejilla Dither Bayer
const DOT_RADIUS  = 1.5;  // Radio fijo del punto dither
const THRESHOLD_K = 0.28;

const VS_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FS_SOURCE = `
precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
  gl_FragColor = texture2D(u_image, v_texCoord);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HalftoneCursorTrail({
  src,
  type = 'image',
  influenceRadius = 82,  // Radio de influencia del cursor
  decay           = 0.89, // Decaimiento elastico
  warpStrength    = 50,   // Fuerza de arrastre en la direccion del cursor
  className       = '',
  style           = {},
}: HalftoneCursorTrailProps) {
  const stageRef        = useRef<HTMLDivElement>(null);
  const sourceRef       = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const glCanvasRef     = useRef<HTMLCanvasElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
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

    const stage        = stageRef.current;
    const source       = sourceRef.current;
    const glCanvas     = glCanvasRef.current;
    const ditherCanvas = ditherCanvasRef.current;
    if (!stage || !source || !glCanvas || !ditherCanvas) return;

    // Inicializacion WebGL
    const gl = (glCanvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }) ||
                glCanvas.getContext('experimental-webgl', { alpha: true, antialias: true, premultipliedAlpha: false })) as WebGLRenderingContext | null;
    if (!gl) return;

    const dctx = ditherCanvas.getContext('2d');
    if (!dctx) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const aPosLoc = gl.getAttribLocation(program, 'a_position');
    const aTexLoc = gl.getAttribLocation(program, 'a_texCoord');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');

    // Malla de vertices
    const numVertices = (COLS + 1) * (ROWS + 1);
    const numQuads    = COLS * ROWS;
    const numIndices  = numQuads * 6;

    const vertexData = new Float32Array(numVertices * 4); // [x, y, u, v]
    const indices    = new Uint16Array(numIndices);

    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i0 = r * (COLS + 1) + c;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (COLS + 1) + c;
        const i3 = i2 + 1;

        indices[idx++] = i0;
        indices[idx++] = i2;
        indices[idx++] = i1;

        indices[idx++] = i1;
        indices[idx++] = i2;
        indices[idx++] = i3;
      }
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(aTexLoc);
    gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, 16, 8);

    // Textura
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let textureReady = false;
    function updateTexture() {
      if (!source) return;
      try {
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
        textureReady = true;
      } catch (_) { /* fuente cargando */ }
    }

    // Estado fisico de la malla
    const restX = new Float32Array(numVertices);
    const restY = new Float32Array(numVertices);
    const dispX = new Float32Array(numVertices);
    const dispY = new Float32Array(numVertices);
    const velX  = new Float32Array(numVertices);
    const velY  = new Float32Array(numVertices);

    let W = 0, H = 0;
    let dpr = 1;

    // Estado Dithering
    let ditherCols = 0, ditherRows = 0;
    let ditherActivation: Float32Array | null = null;

    function resize() {
      if (!stage || !glCanvas || !ditherCanvas || !dctx) return;
      const rect = stage.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W <= 0 || H <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      const fullW = W + BLEED * 2;
      const fullH = H + BLEED * 2;

      glCanvas.width  = fullW * dpr;
      glCanvas.height = fullH * dpr;

      ditherCanvas.width  = fullW * dpr;
      ditherCanvas.height = fullH * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Calcular posiciones de reposo de la malla
      for (let r = 0; r <= ROWS; r++) {
        const v = r / ROWS;
        for (let c = 0; c <= COLS; c++) {
          const u = c / COLS;
          const i = r * (COLS + 1) + c;
          restX[i] = BLEED + u * W;
          restY[i] = BLEED + v * H;
          vertexData[i * 4 + 0] = restX[i] + dispX[i];
          vertexData[i * 4 + 1] = restY[i] + dispY[i];
          vertexData[i * 4 + 2] = u;
          vertexData[i * 4 + 3] = v;
        }
      }

      // Rejilla Dither
      ditherCols = Math.ceil(W / DITHER_GRID) + 1;
      ditherRows = Math.ceil(H / DITHER_GRID) + 1;
      ditherActivation = new Float32Array(ditherCols * ditherRows);

      updateTexture();
      renderFrame(true);
    }

    let raf = 0;
    let isLooping = false;

    function startLoop() {
      if (!isLooping) {
        isLooping = true;
        raf = requestAnimationFrame(loop);
      }
    }

    // Inyeccion de fuerza segun la direccion/velocidad del cursor (dx, dy)
    function injectForce(mx: number, my: number, dx: number, dy: number) {
      const px = mx + BLEED;
      const py = my + BLEED;
      const speed = Math.hypot(dx, dy);

      // Factor de arrastre proporcional a la velocidad
      const forceScale = Math.min(1.4, 0.4 + speed * 0.035) * (warpStrength * 0.025);

      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const i = r * (COLS + 1) + c;
          const curX = restX[i] + dispX[i];
          const curY = restY[i] + dispY[i];
          const d = Math.hypot(curX - px, curY - py);
          if (d > influenceRadius) continue;

          // Caida suave del radio
          const falloff = Math.pow(1 - d / influenceRadius, 1.4);

          // Desplazamiento en la direccion del cursor (vector dx, dy)
          velX[i] += dx * falloff * forceScale;
          velY[i] += dy * falloff * forceScale;
        }
      }

      // Activacion Dither
      if (ditherActivation) {
        const ix0 = Math.max(0, Math.floor((mx - influenceRadius) / DITHER_GRID));
        const ix1 = Math.min(ditherCols - 1, Math.ceil((mx + influenceRadius) / DITHER_GRID));
        const iy0 = Math.max(0, Math.floor((my - influenceRadius) / DITHER_GRID));
        const iy1 = Math.min(ditherRows - 1, Math.ceil((my + influenceRadius) / DITHER_GRID));

        for (let iy = iy0; iy <= iy1; iy++) {
          for (let ix = ix0; ix <= ix1; ix++) {
            const gx = ix * DITHER_GRID, gy = iy * DITHER_GRID;
            const dist = Math.hypot(gx - mx, gy - my);
            if (dist > influenceRadius) continue;
            const val = Math.pow(1 - dist / influenceRadius, 2);
            const idx = iy * ditherCols + ix;
            if (val > ditherActivation[idx]) ditherActivation[idx] = val;
          }
        }
      }

      startLoop();
    }

    let lastPos: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (lastPos) {
        const dx = mx - lastPos.x;
        const dy = my - lastPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.5) {
          const steps = Math.max(1, Math.min(8, Math.floor(dist / 10)));
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const curMx = lastPos.x + dx * t;
            const curMy = lastPos.y + dy * t;
            injectForce(curMx, curMy, dx / steps, dy / steps);
          }
        }
      } else {
        injectForce(mx, my, 0, 0);
      }

      lastPos = { x: mx, y: my };
    }

    function onLeave() {
      lastPos = null;
    }

    function renderFrame(forceDraw = false) {
      if (!gl || !dctx) return;

      if (type === 'video') {
        updateTexture();
      }

      if (!textureReady && !forceDraw) return;

      let maxActivity = 0;
      const maxBleed = BLEED - 6;

      // 1. Fisica de relajacion de la malla WebGL
      for (let i = 0; i < numVertices; i++) {
        dispX[i] += velX[i];
        dispY[i] += velY[i];

        velX[i] *= 0.74; // Amortiguacion de velocidad
        velY[i] *= 0.74;

        dispX[i] *= decay; // Relajacion elastica al reposo
        dispY[i] *= decay;

        // Limitar dentro del sangrado del canvas
        if (dispX[i] > maxBleed) dispX[i] = maxBleed;
        else if (dispX[i] < -maxBleed) dispX[i] = -maxBleed;

        if (dispY[i] > maxBleed) dispY[i] = maxBleed;
        else if (dispY[i] < -maxBleed) dispY[i] = -maxBleed;

        if (Math.abs(dispX[i]) < 0.04) dispX[i] = 0;
        if (Math.abs(dispY[i]) < 0.04) dispY[i] = 0;

        vertexData[i * 4 + 0] = restX[i] + dispX[i];
        vertexData[i * 4 + 1] = restY[i] + dispY[i];

        const act = Math.abs(dispX[i]) + Math.abs(dispY[i]) + Math.abs(velX[i]) + Math.abs(velY[i]);
        if (act > maxActivity) maxActivity = act;
      }

      // Dibujar Malla WebGL
      gl.viewport(0, 0, glCanvas!.width, glCanvas!.height);
      gl.clearColor(0, 0, 0, 0); // Fondo 100% transparente para ver detras
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResLoc, W + BLEED * 2, H + BLEED * 2);

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);

      // 2. Dibujar Dither Bayer 4x4 (Canvas 2D con difference blend)
      const fullW = W + BLEED * 2;
      const fullH = H + BLEED * 2;
      dctx.clearRect(0, 0, fullW, fullH);

      let ditherCount = 0;
      if (ditherActivation) {
        dctx.save();
        dctx.globalCompositeOperation = 'difference';
        dctx.fillStyle = 'white';
        dctx.globalAlpha = 0.88;
        dctx.beginPath();

        for (let iy = 0; iy < ditherRows; iy++) {
          for (let ix = 0; ix < ditherCols; ix++) {
            const idx = iy * ditherCols + ix;
            ditherActivation[idx] *= decay;
            const a = ditherActivation[idx];
            if (a < 0.015) {
              ditherActivation[idx] = 0;
              continue;
            }
            ditherCount++;
            const threshold = BAYER_4X4[iy % 4][ix % 4];
            if (a <= threshold * THRESHOLD_K) continue;

            const cx = BLEED + ix * DITHER_GRID + DITHER_GRID * 0.5;
            const cy = BLEED + iy * DITHER_GRID + DITHER_GRID * 0.5;
            dctx.moveTo(cx + DOT_RADIUS, cy);
            dctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
          }
        }
        dctx.fill();
        dctx.restore();
      }

      return (maxActivity > 0.02 || ditherCount > 0);
    }

    function loop() {
      const stillActive = renderFrame();
      if (stillActive) {
        raf = requestAnimationFrame(loop);
      } else {
        isLooping = false;
      }
    }

    resize();
    window.addEventListener('resize', resize);
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);

    const onLoaded = () => {
      updateTexture();
      renderFrame(true);
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
      stage.removeEventListener('mouseleave', onLeave);
      if (type === 'image') {
        (source as HTMLImageElement).removeEventListener('load', onLoaded);
      } else {
        (source as HTMLVideoElement).removeEventListener('loadeddata', onLoaded);
      }
      try {
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(indexBuffer);
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
      } catch (_) {}
    };
  }, [src, type, influenceRadius, decay, warpStrength, isTouch]);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-visible ${className}`}
      style={{ cursor: isTouch ? 'auto' : 'none', ...style }}
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
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            visibility: isTouch ? 'visible' : 'hidden',
          }}
        />
      ) : (
        <img
          ref={sourceRef as React.RefObject<HTMLImageElement>}
          src={src}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            visibility: isTouch ? 'visible' : 'hidden',
          }}
        />
      )}
      {!isTouch && (
        <>
          <canvas
            ref={glCanvasRef}
            style={{
              position: 'absolute',
              top: -BLEED,
              left: -BLEED,
              width: `calc(100% + ${BLEED * 2}px)`,
              height: `calc(100% + ${BLEED * 2}px)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <canvas
            ref={ditherCanvasRef}
            style={{
              position: 'absolute',
              top: -BLEED,
              left: -BLEED,
              width: `calc(100% + ${BLEED * 2}px)`,
              height: `calc(100% + ${BLEED * 2}px)`,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        </>
      )}
    </div>
  );
}