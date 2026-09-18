import React, { useEffect, useRef } from 'react';
import { WikiGraphNode, WikiGraphLink } from '../../data/wikiIndex';

interface WikiGraphViewProps {
  nodes: WikiGraphNode[];
  links: WikiGraphLink[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

interface SimNode extends WikiGraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function WikiGraphView({
  nodes,
  links,
  activeNodeId,
  onSelectNode,
}: WikiGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Estados de simulación física y cámara
  const simNodesRef = useRef<SimNode[]>([]);
  const hoveredNodeRef = useRef<SimNode | null>(null);
  const draggingNodeRef = useRef<SimNode | null>(null);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inicializar posiciones de nodos en círculo distribuido
  useEffect(() => {
    const total = nodes.length;
    simNodesRef.current = nodes.map((n, i) => {
      const angle = (i / total) * Math.PI * 2;
      const radius = 140 + (i % 2) * 50;
      return {
        ...n,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.id === activeNodeId ? 18 : 12 + Math.min(n.linksCount * 2, 8),
      };
    });
  }, [nodes, activeNodeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Bucle de física suave (fuerza de atracción de enlaces + repulsión de nodos)
    const tick = () => {
      const simNodes = simNodesRef.current;
      const pan = panRef.current;

      // 1. Repulsión mutua entre nodos (Coulomb)
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 320) {
            const force = (320 - dist) / dist * 0.4;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (a !== draggingNodeRef.current) {
              a.vx -= fx;
              a.vy -= fy;
            }
            if (b !== draggingNodeRef.current) {
              b.vx += fx;
              b.vy += fy;
            }
          }
        }
      }

      // 2. Atracción elástica entre nodos conectados (Hooke)
      links.forEach((l) => {
        const a = simNodes.find((n) => n.id === l.source);
        const b = simNodes.find((n) => n.id === l.target);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = 160;
        const force = (dist - desiredDist) * 0.008;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (a !== draggingNodeRef.current) {
          a.vx += fx;
          a.vy += fy;
        }
        if (b !== draggingNodeRef.current) {
          b.vx -= fx;
          b.vy -= fy;
        }
      });

      // 3. Suave gravedad hacia el centro
      simNodes.forEach((n) => {
        if (n === draggingNodeRef.current) return;
        n.vx -= n.x * 0.002;
        n.vy -= n.y * 0.002;

        // Fricción / amortiguación
        n.vx *= 0.88;
        n.vy *= 0.88;

        n.x += n.vx;
        n.y += n.vy;
      });

      // RENDERIZADO
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Trasladar al centro de pantalla + pan
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y);

      // Dibujar enlaces
      links.forEach((l) => {
        const a = simNodes.find((n) => n.id === l.source);
        const b = simNodes.find((n) => n.id === l.target);
        if (!a || !b) return;

        const isRelatedToActive = a.id === activeNodeId || b.id === activeNodeId;
        const isHovered = hoveredNodeRef.current && (a.id === hoveredNodeRef.current.id || b.id === hoveredNodeRef.current.id);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHovered
          ? 'rgba(255, 255, 255, 0.6)'
          : isRelatedToActive
          ? 'rgba(255, 255, 255, 0.35)'
          : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isHovered || isRelatedToActive ? 1.5 : 1;
        ctx.stroke();
      });

      // Dibujar nodos
      simNodes.forEach((n) => {
        const isActive = n.id === activeNodeId;
        const isHovered = hoveredNodeRef.current?.id === n.id;

        // Halo exterior
        if (isActive || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fill();
        }

        // Círculo principal
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#FFFFFF' : isHovered ? '#E5E5E5' : '#262626';
        ctx.fill();

        ctx.strokeStyle = isActive ? '#FFFFFF' : '#525252';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        // Título del nodo
        ctx.font = `${isActive ? 'bold 12px' : '11px'} monospace`;
        ctx.fillStyle = isActive ? '#FFFFFF' : isHovered ? '#D4D4D4' : '#8A8A8A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.title.length > 24 ? n.title.substring(0, 22) + '...' : n.title, n.x, n.y + n.radius + 8);
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [links, activeNodeId]);

  // Manejo de interacción de ratón (hover, click, arrastre)
  const getMouseCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    return {
      x: rawX - canvas.width / 2 - panRef.current.x,
      y: rawY - canvas.height / 2 - panRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCanvasCoords(e);

    if (isPanningRef.current) {
      panRef.current.x += e.clientX - lastMousePosRef.current.x;
      panRef.current.y += e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (draggingNodeRef.current) {
      draggingNodeRef.current.x = coords.x;
      draggingNodeRef.current.y = coords.y;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
      return;
    }

    // Comprobar colisión de hover
    const found = simNodesRef.current.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    hoveredNodeRef.current = found || null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = found ? 'pointer' : 'grab';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCanvasCoords(e);
    const found = simNodesRef.current.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (found) {
      draggingNodeRef.current = found;
    } else {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingNodeRef.current) {
      const coords = getMouseCanvasCoords(e);
      const dx = draggingNodeRef.current.x - coords.x;
      const dy = draggingNodeRef.current.y - coords.y;
      // Si casi no se ha movido, se considera un click para seleccionar
      if (Math.sqrt(dx * dx + dy * dy) < 5) {
        onSelectNode(draggingNodeRef.current.id);
      }
      draggingNodeRef.current = null;
    }

    isPanningRef.current = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredNodeRef.current ? 'pointer' : 'grab';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-neutral-950/60 border border-white/10 overflow-hidden flex flex-col justify-between">
      {/* Controles y Leyenda superior */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 text-xs text-white/50 pointer-events-none font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          KNOWLEDGE GRAPH (OBSIDIAN STYLE)
        </span>
        <span>·</span>
        <span className="text-white/30 hidden sm:inline">Arrastra nodos o desplaza el lienzo</span>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="w-full h-full block"
      />

      {/* Indicador de ayuda inferior */}
      <div className="absolute bottom-3 right-4 z-10 text-[10px] text-white/40 font-mono pointer-events-none">
        {nodes.length} NODOS · {links.length} CONEXIONES
      </div>
    </div>
  );
}
