import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';
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
  categories?: string[];
}

interface ProjectAccordionProps {
  projects?: ProjectItem[];
}

/**
 * ProjectAccordion
 * Lista de proyectos tipo lamalama.com/work:
 * - Seccion full-width.
 * - Al desplegarse, las imagenes se deslizan con arrastre horizontal ultra-fluido (inercia e impulso) sin flechas.
 */
export default function ProjectAccordion({ projects = [] }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenIndex(null);
  }, [projects]);

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

  const handleCaseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (caseUrl) {
      if (caseUrl.startsWith('/cases/')) {
        window.history.pushState({}, '', caseUrl);
        window.dispatchEvent(new Event('popstate'));
        window.scrollTo(0, 0);
      } else {
        window.location.href = caseUrl;
      }
    }
  };

  const handleSiteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  const displayImages = gallery.length > 0 ? gallery : thumbnails;

  return (
    <motion.div 
      layout
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }} 
      className="overflow-hidden w-full"
    >
      {/* Fila principal del acordeon */}
      <div
        ref={headerRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={onMouseMove}
        onClick={onToggle}
        className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-5 md:py-7 px-2 md:px-0 cursor-pointer text-[#eee] group w-full"
      >
        {/* Titulo y Toggle en Movil */}
        <div className="w-full md:w-[220px] flex justify-between items-center flex-shrink-0">
          <div style={{ fontSize: 22, fontWeight: 400 }} className="text-xl md:text-[22px] font-normal">
            <GlitchText text={title} />
          </div>

          <motion.span 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden text-xs text-white/70 font-sans font-normal"
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
                fontWeight: "normal",
                zIndex: 20,
              }}
            >
              {t.viewCaseBadge}
            </span>
          )}
        </div>

        {/* Colapsado: miniaturas compactas */}
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

      {/* Contenido expandido con navegacion horizontal ultra-fluida */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden w-full"
          >
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="pb-8 pt-2 w-full"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                
                {/* Botones de Accion */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                  {caseUrl && (
                    <a
                      href={caseUrl}
                      onClick={handleCaseClick}
                      className="px-6 py-3.5 bg-white text-black text-xs font-normal uppercase text-center hover:bg-neutral-200 transition-colors shadow-lg active:scale-95 touch-manipulation cursor-pointer"
                    >
                      {t.viewCaseBtn}
                    </a>
                  )}
                  {siteUrl && (
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleSiteClick}
                      className="px-6 py-3.5 border border-white/40 text-white text-xs font-normal uppercase text-center hover:bg-white hover:text-black transition-colors active:scale-95 touch-manipulation cursor-pointer"
                    >
                      {t.visitWebsiteBtn}
                    </a>
                  )}
                </div>

                {/* Descripcion */}
                <p className="max-w-xl text-xs md:text-sm leading-relaxed opacity-85">
                  {description}
                </p>
              </div>

              {/* Galeria horizontal ultra-fluida con inercia y arrastre con raton */}
              <HorizontalImageScroller
                images={displayImages}
                title={title}
                caseUrl={caseUrl}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * HorizontalImageScroller
 * Deslizamiento horizontal ultra-fluido en desktop y movil:
 * - Sin flechas prev/next.
 * - Motor de fisica con inercia y friccion (gliding momentum).
 * - Arrastre con raton (mouse drag) que distingue clic de navegacion.
 * - Rueda del raton con interpolacion fluida.
 */
function HorizontalImageScroller({
  images,
  title,
  caseUrl,
}: {
  images: string[];
  title: string;
  caseUrl?: string;
}) {
  const { triggerTransition } = useDitherTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const dragDistance = useRef(0);
  const rafId = useRef<number | null>(null);

  const stopMomentum = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const startMomentum = () => {
    stopMomentum();
    const tick = () => {
      const el = containerRef.current;
      if (!el) return;

      if (Math.abs(velocity.current) > 0.25) {
        el.scrollLeft -= velocity.current;
        velocity.current *= 0.94; // Friccion natural y fluida
        rafId.current = requestAnimationFrame(tick);
      } else {
        velocity.current = 0;
        rafId.current = null;
      }
    };
    rafId.current = requestAnimationFrame(tick);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    stopMomentum();
    isDragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    dragDistance.current = 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const currentX = e.clientX;
    const delta = currentX - lastX.current;
    lastX.current = currentX;

    containerRef.current.scrollLeft -= delta;
    dragDistance.current += Math.abs(delta);

    // Suavizado exponencial de velocidad para el impulso al soltar
    velocity.current = delta * 0.8 + velocity.current * 0.2;
  };

  const onMouseUpOrLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(velocity.current) > 0.4) {
      startMomentum();
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      velocity.current -= e.deltaY * 0.38;
      startMomentum();
    }
  };

  useEffect(() => {
    return () => stopMomentum();
  }, []);

  const handleImageClick = (e: React.MouseEvent) => {
    if (dragDistance.current > 6) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if (caseUrl) {
      e.stopPropagation();
      if (caseUrl.startsWith('/cases/')) {
        triggerTransition(() => {
          window.history.pushState({}, '', caseUrl);
          window.dispatchEvent(new Event('popstate'));
          window.scrollTo(0, 0);
        }, { x: e.clientX, y: e.clientY });
      } else {
        window.location.href = caseUrl;
      }
    }
  };

  return (
    <div className="relative w-full select-none pt-2">
      {/* Contenedor horizontal ultra-fluido sin flechas */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onWheel={onWheel}
        className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 cursor-grab active:cursor-grabbing no-scrollbar touch-pan-x w-full"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            onClick={handleImageClick}
            className="flex-none relative h-64 sm:h-80 md:h-[420px] lg:h-[480px] aspect-[16/10] bg-neutral-900 overflow-hidden group/img cursor-pointer border border-white/10 hover:border-white/40 transition-colors shadow-2xl"
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-4 py-2 bg-white text-black text-xs font-normal uppercase font-sans tracking-widest shadow-2xl">
                VER CASO ↗
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}