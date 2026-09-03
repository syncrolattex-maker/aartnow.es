import { useEffect, useRef } from 'react';

export default function HalftoneHoverField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let W = 0, H = 0;
    let raf: number;
    let activation = new Float32Array(0);
    let cols = 0, rows = 0;
    const gridSize = 6;
    const influenceRadius = 50;

    function resize() {
      if (!canvas || !parent || !ctx) return;
      const rect = parent.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W <= 0 || H <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(W / gridSize) + 1;
      rows = Math.ceil(H / gridSize) + 1;
      activation = new Float32Array(cols * rows);
    }

    function excite(px: number, py: number) {
      if (!activation || cols === 0) return;
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
          activation[idx] = Math.max(activation[idx], Math.pow(falloff, 1.4));
        }
      }
    }

    function onMove(e: MouseEvent) {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      excite(e.clientX - rect.left, e.clientY - rect.top);
    }

    function frame() {
      if (ctx && activation && cols > 0) {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

        for (let idx = 0; idx < activation.length; idx++) {
          let a = activation[idx] * 0.92;
          if (a < 0.02) a = 0;
          activation[idx] = a;

          if (a > 0) {
            const iy = (idx / cols) | 0;
            const ix = idx % cols;
            const gx = ix * gridSize, gy = iy * gridSize;
            ctx.beginPath();
            ctx.arc(gx, gy, Math.max(0.3, 1.8 * a), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    parent.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      parent.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" 
    />
  );
}
