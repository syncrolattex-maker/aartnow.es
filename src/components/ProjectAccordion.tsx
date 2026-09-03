import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
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

/**
 * ProjectAccordion
 * Lista de proyectos tipo lamalama.com/work:
 * - Todos los proyectos permanecen cerrados por defecto (openIndex = null).
 * - Traducido dinámicamente según el idioma activo (es, val, en).
 */
export default function ProjectAccordion({ projects = [] }: ProjectAccordionProps) {
  // Por defecto todos los proyectos permanecen cerrados
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }} className="w-full">
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
  const { t } = useLanguage();
  const { title, tags = [], description, caseUrl, siteUrl, thumbnails = [], gallery = [] } = project;

  const headerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  // La etiqueta sigue al cursor con lerp magnético suave
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

  // Lista de imágenes a mostrar
  const displayImages = gallery.length > 0 ? gallery : thumbnails;

  return (
    <motion.div 
      layout
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }} 
      className="overflow-hidden"
    >
      {/* Fila principal del acordeón */}
      <div
        ref={headerRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={onMouseMove}
        onClick={onToggle}
        className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-5 md:py-7 px-2 md:px-0 cursor-pointer text-[#eee] group"
      >
        {/* Título y Toggle en Móvil */}
        <div className="w-full md:w-[220px] flex justify-between items-center flex-shrink-0">
          <div style={{ fontSize: 22, fontWeight: 700 }} className="text-xl md:text-[22px]">
            <GlitchText text={title} />
          </div>

          <motion.span 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden text-xs text-white/70 font-mono font-bold"
          >
            {isOpen ? '( − )' : '( + )'}
          </motion.span>
        </div>

        {/* Tags del Proyecto */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                background: "#111",
                padding: "6px 10px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Zona Central Desktop: campo de puntos + indicador (+ / -) */}
        <div className="hidden md:flex relative flex-1 h-[60px] min-w-[40px] items-center justify-between px-3">
          <HalftoneHoverField />
          <motion.span 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 12, opacity: 0.7, position: "relative", zIndex: 10 }}
          >
            {isOpen ? '( − )' : '( + )'}
          </motion.span>

          {hovering && !isOpen && (
            <span
              style={{
                position: "absolute",
                left: label.x,
                top: label.y,
                transform: "translate(-50%, -140%)",
                fontSize: 11,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                background: "#ffffff",
                color: "#000000",
                padding: "2px 8px",
                fontWeight: "bold",
                zIndex: 20,
              }}
            >
              {t.viewCaseBadge}
            </span>
          )}
        </div>

        {/* Colapsado: miniaturas colapsadas */}
        {!isOpen && (
          <motion.div 
            layout
            className="flex gap-1 md:gap-1.5 flex-shrink-0 h-16 md:h-[100px] overflow-hidden w-full md:w-auto"
          >
            {displayImages.slice(0, 5).map((src, i) => (
              <motion.img
                key={i}
                layoutId={`project-img-${title}-${i}`}
                src={src}
                alt=""
                className="w-16 h-16 md:w-[90px] md:h-[100px] object-cover flex-shrink-0"
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Contenido expandido */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="pb-8 pt-2"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                
                {/* Botones de Acción Traducidos */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {caseUrl && (
                    <a
                      href={caseUrl}
                      className="px-5 py-3 border border-white/30 text-white text-xs font-bold uppercase text-center hover:bg-[#f3ede4] hover:text-[#111] transition-colors"
                    >
                      {t.viewCaseBtn}
                    </a>
                  )}
                  {siteUrl && (
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 border border-white/30 text-white text-xs font-bold uppercase text-center hover:bg-[#f3ede4] hover:text-[#111] transition-colors"
                    >
                      {t.visitWebsiteBtn}
                    </a>
                  )}
                </div>

                {/* Descripción */}
                <p className="max-w-xl text-xs md:text-sm leading-relaxed opacity-85">
                  {description}
                </p>
              </div>

              {/* Galería grande desplegada */}
              <motion.div 
                layout
                className="flex gap-2.5 md:gap-4 overflow-x-auto pb-3 touch-pan-x"
              >
                {displayImages.map((src, i) => (
                  <motion.img
                    key={i}
                    layoutId={`project-img-${title}-${i}`}
                    src={src}
                    alt=""
                    className="h-64 md:h-[420px] flex-none object-cover"
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
