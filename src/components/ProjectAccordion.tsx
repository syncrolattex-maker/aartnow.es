import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
 * Lista de proyectos tipo lamalama.com/work: expansión gradual de tamaño en miniaturas con Framer Motion layoutId.
 */
export default function ProjectAccordion({ projects = [] }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
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

  // Lista de imágenes a mostrar (usando gallery o thumbnails como base compartida)
  const displayImages = gallery.length > 0 ? gallery : thumbnails;

  return (
    <motion.div 
      layout
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }} 
      className="overflow-hidden"
    >
      {/* Fila principal: título / tags / campo de hover con toggle / miniaturas colapsadas */}
      <div
        ref={headerRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={onMouseMove}
        onClick={onToggle}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "28px 0",
          cursor: "pointer",
          color: "#eee",
        }}
      >
        <div style={{ width: 220, fontSize: 22, flexShrink: 0, fontWeight: 700 }}>
          <GlitchText text={title} />
        </div>

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

        {/* Zona central: campo de puntos + indicador (+ / -) */}
        <div style={{ position: "relative", flex: 1, height: 60, minWidth: 40, display: "flex", itemsCenter: "center", justifyContent: "space-between", padding: "0 12px" }}>
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
              ( VIEW + )
            </span>
          )}
        </div>

        {/* Colapsado: miniaturas pequeñas (90x100px) que escalarán progresivamente al abrir */}
        {!isOpen && (
          <motion.div 
            layout
            style={{ display: "flex", gap: 4, flexShrink: 0, height: 100, overflow: "hidden" }}
          >
            {displayImages.slice(0, 5).map((src, i) => (
              <motion.img
                key={i}
                layoutId={`project-img-${title}-${i}`}
                src={src}
                alt=""
                style={{ width: 90, height: 100, objectFit: "cover" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Contenido expandido con aumento gradual de tamaño de imágenes de miniaturas a formato gigante */}
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
              style={{ paddingBottom: 32 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 40, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {caseUrl && (
                    <a
                      href={caseUrl}
                      style={{
                        padding: "14px 20px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "#eee",
                        textDecoration: "none",
                        fontSize: 12,
                        textTransform: "uppercase",
                        transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3ede4"; e.currentTarget.style.color = "#111"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#eee"; }}
                    >
                      View case ↗
                    </a>
                  )}
                  {siteUrl && (
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "14px 20px",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "#eee",
                        textDecoration: "none",
                        fontSize: 12,
                        textTransform: "uppercase",
                        transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3ede4"; e.currentTarget.style.color = "#111"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#eee"; }}
                    >
                      Visit website ↗
                    </a>
                  )}
                </div>
                <p style={{ maxWidth: 480, fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>
                  {description}
                </p>
              </div>

              {/* Galería desplegada: Las miniaturas aumentan de 90x100px a 420px de alto de forma continua */}
              <motion.div 
                layout
                style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 12 }}
              >
                {displayImages.map((src, i) => (
                  <motion.img
                    key={i}
                    layoutId={`project-img-${title}-${i}`}
                    src={src}
                    alt=""
                    style={{ height: 420, flex: "0 0 auto", objectFit: "cover" }}
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
