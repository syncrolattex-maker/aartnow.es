export interface ProjectType {
  id: string;
  label: string;
  description: string;
  base: number;
}

export interface ProjectOption {
  id: string;
  label: string;
  impact: number;
}

export interface TimelineOption {
  id: string;
  label: string;
  multiplier: number;
}

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: "branding",
    label: "Branding & Identidad Visual",
    description: "Estrategia de marca, logotipo, universo tipográfico, colores y brand book.",
    base: 1200,
  },
  {
    id: "design",
    label: "Diseño UX/UI & Producto",
    description: "Diseño de interfaz a medida, prototipado interactivo y arquitectura de usuario.",
    base: 1500,
  },
  {
    id: "web",
    label: "Desarrollo Web & WebGL",
    description: "Sitio web a medida ultra-rápido, animaciones creativas, 3D e integración CMS.",
    base: 2000,
  },
  {
    id: "full",
    label: "Proyecto Integral 360°",
    description: "Branding completo + Desarrollo WebGL / 3D + Estrategia digital de lanzamiento.",
    base: 3800,
  },
];

export const OPTIONS_BY_TYPE: Record<string, ProjectOption[]> = {
  branding: [
    { id: "designSystem", label: "Sistema de diseño y guía de marca interactiva (+450€)", impact: 450 },
    { id: "naming", label: "Estrategia de Naming & Registro de marca (+350€)", impact: 350 },
    { id: "packaging", label: "Diseño de Packaging y material impreso (+400€)", impact: 400 },
  ],
  design: [
    { id: "designTokens", label: "Design System escalable con Tokens UI (+500€)", impact: 500 },
    { id: "userTesting", label: "Test de Usabilidad y mapas de empatía (+350€)", impact: 350 },
    { id: "microInteractions", label: "Micro-interacciones y animaciones Lottie (+300€)", impact: 300 },
  ],
  web: [
    { id: "webgl3d", label: "Experiencia 3D con Shaders WebGL personalizadas (+850€)", impact: 850 },
    { id: "cms", label: "CMS Headless Autogestionable (+400€)", impact: 400 },
    { id: "ecommerce", label: "Integración Tienda Online E-commerce (+600€)", impact: 600 },
    { id: "seoAdvanced", label: "Auditoría y Posicionamiento SEO Avanzado (+350€)", impact: 350 },
  ],
  full: [
    { id: "3dModeling", label: "Modelado de Producto 3D fotorrealista (+650€)", impact: 650 },
    { id: "marketing360", label: "Campaña de Lanzamiento & Contenido Social (+750€)", impact: 750 },
    { id: "maintenance", label: "Soporte y mantenimiento prioritario 6 meses (+500€)", impact: 500 },
  ],
};

export const TIMELINE_OPTIONS: TimelineOption[] = [
  { id: "standard", label: "Plazo Estándar (Recomendado)", multiplier: 1 },
  { id: "rush", label: "Entrega Prioritaria / Express (+25%)", multiplier: 1.25 },
];

export function calculateEstimate({
  typeId,
  optionIds,
  timelineId,
}: {
  typeId: string;
  optionIds: string[];
  timelineId: string;
}): { min: number; max: number } | null {
  const type = PROJECT_TYPES.find((t) => t.id === typeId);
  if (!type) return null;

  const options = OPTIONS_BY_TYPE[typeId] || [];
  const optionsTotal = options
    .filter((o) => optionIds.includes(o.id))
    .reduce((sum, o) => sum + o.impact, 0);

  const timeline = TIMELINE_OPTIONS.find((t) => t.id === timelineId) || TIMELINE_OPTIONS[0];

  const mid = (type.base + optionsTotal) * timeline.multiplier;

  return {
    min: Math.round((mid * 0.85) / 50) * 50,
    max: Math.round((mid * 1.15) / 50) * 50,
  };
}
