import { useEffect, useRef, useState } from 'react';
import HalftoneHoverField from './HalftoneHoverField';
import GlitchText from './GlitchText';

export interface ProjectItem {
  title: string;
  tags?: string[];
  description: string;
  caseUrl?: string;
  siteUrl?: string;
  thumbnails?: string[];
  gallery?: string[];
}

interface ProjectAccordionProps {
  projects?: ProjectItem[];
}

export default function ProjectAccordion({ projects = [] }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full border-t border-white/15 font-mono select-none">
      {projects.map((project, i) => (
        <ProjectRow
          key={project.title}
          project={project}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

interface ProjectRowProps {
  project: ProjectItem;
  isOpen: boolean;
  onToggle: () => void;
}

function ProjectRow({ project, isOpen, onToggle }: ProjectRowProps) {
  const { title, tags = [], description, caseUrl, siteUrl, thumbnails = [], gallery = [] } = project;

  const headerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  // La etiqueta "( VIEW + )" sigue al cursor con lerp magnético suave
  useEffect(() => {
    function tick() {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      setLabel({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  return (
    <div className="border-b border-white/15 transition-colors bg-black/40 hover:bg-white/[0.02]">
      {/* Fila principal: título / tags / campo de hover con toggle / miniaturas */}
      <div
        ref={headerRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={onMouseMove}
        onClick={onToggle}
        className="relative flex flex-col md:flex-row items-start md:items-center gap-6 py-7 px-4 md:px-8 cursor-pointer text-[#EEEEEE] group"
      >
        {/* Título del Proyecto */}
        <div className="w-full md:w-56 text-2xl md:text-3xl font-black uppercase text-white font-sans flex-shrink-0 group-hover:text-white/80 transition-colors">
          <GlitchText text={title} />
        </div>

        {/* Tags del Proyecto */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white px-2.5 py-1 border border-white/15"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Zona Central: Campo de Puntos Halftone + Etiqueta Flotante Lerp */}
        <div className="relative flex-1 h-14 min-w-[40px] w-full flex items-center justify-between px-2">
          <HalftoneHoverField />

          <span className="text-xs text-white/50 font-bold z-10">
            {isOpen ? '( − )' : '( + )'}
          </span>

          {hovering && !isOpen && (
            <span
              style={{
                position: 'absolute',
                left: label.x,
                top: label.y,
                transform: 'translate(-50%, -140%)',
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-black bg-white px-2 py-0.5 whitespace-nowrap pointer-events-none shadow-lg z-20"
            >
              ( VIEW + )
            </span>
          )}
        </div>

        {/* Vista Colapsada: Tira de Miniaturas */}
        {!isOpen && thumbnails.length > 0 && (
          <div className="hidden md:flex gap-2 flex-shrink-0 h-20 overflow-hidden border border-white/10 p-1 bg-black/60">
            {thumbnails.slice(0, 5).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-20 h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido Expandido */}
      {isOpen && (
        <div className="pb-10 pt-4 px-4 md:px-8 space-y-8 bg-[#0B0B0B] border-t border-white/10">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/10 pb-6">
            
            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-4">
              {caseUrl && (
                <a
                  href={caseUrl}
                  className="px-6 py-3 border border-white/30 text-white text-xs font-bold uppercase hover:bg-white hover:text-black transition-all shadow-md"
                >
                  View case ↗
                </a>
              )}
              {siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 border border-white/30 text-white text-xs font-bold uppercase hover:bg-white hover:text-black transition-all shadow-md"
                >
                  Visit website ↗
                </a>
              )}
            </div>

            {/* Descripción del Proyecto */}
            <p className="max-w-xl text-xs md:text-sm leading-relaxed text-white/80 font-mono text-justify">
              {description}
            </p>
          </div>

          {/* Galería Grande Horizontal Scrollable */}
          {gallery.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20">
              {gallery.map((src, i) => (
                <div key={i} className="flex-none h-80 md:h-96 aspect-[16/10] bg-neutral-900 border border-white/15 overflow-hidden shadow-2xl">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
