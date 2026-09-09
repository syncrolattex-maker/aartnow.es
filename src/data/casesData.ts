export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  year: string;
  category: string;
  services: string[];
  websiteUrl: string;
  heroImage: string;
  subtitle: string;
  overview: string;
  challenge: string;
  solution: string;
  metrics: { label: string; value: string }[];
  gallery: string[];
  nextSlug: string;
  nextTitle: string;
}

export const casesData: Record<string, CaseStudy> = {
  "jack-and-ai": {
    slug: "jack-and-ai",
    title: "3D Kinetic Sculpture",
    client: "Exploración Tipográfica 3D",
    year: "2026",
    category: "Diseño 3D & Escultura Digital",
    services: ["Diseño 3D", "Cinema 4D", "3ds Max", "Corona Renderer", "V-Ray"],
    websiteUrl: "https://aartnow.es",
    heroImage: "/projects/project1-1.jpg",
    subtitle: "Exploración volumétrica y tipografía escultórica tridimensional desarrollada en Cinema 4D y 3ds Max, con renderizado fotorrealista en Corona y V-Ray.",
    overview: "Este proyecto aborda la escultura digital y la tipografía experimental desde una perspectiva de modelado volumétrico de alta precisión. Empleando herramientas avanzadas en Cinema 4D y 3ds Max, se crean formas curvadas continuas con complejas transiciones de materiales físicos, desde piel orgánica escamada hasta franjas ópticas cinéticas en blanco y negro.",
    challenge: "El desafío principal consistió en calibrar la curvatura de deformación y la tensión poligonal de las mallas 3D sin artefactos de suavizado, así como simular con absoluta fidelidad la interacción lumínica de materiales contrastantes (dispersión subsuperficial orgánica frente a reflectancia especular satinada).",
    solution: "Se estructuró un pipeline híbrido: modelado orgánico y deformación paramétrica en Cinema 4D complementado con topología precisa en 3ds Max. La iluminación y el renderizado final se ejecutaron en Corona Renderer y V-Ray mediante esquemas de luces de estudio en clave baja, realzando cada microtextura, profundidad de sombras y nitidez de contorno.",
    metrics: [
      { label: "Software Modelado", value: "Cinema 4D & 3ds Max" },
      { label: "Motores de Render", value: "Corona & V-Ray" },
      { label: "Definición de Textura", value: "8K Procedural Shading" }
    ],
    gallery: [
      "/projects/project1-1.jpg",
      "/projects/project1-2.jpg"
    ],
    nextSlug: "refraction-house",
    nextTitle: "Refraction House"
  },
  "refraction-house": {
    slug: "refraction-house",
    title: "Refraction House",
    client: "Refraction Studio",
    year: "2026",
    category: "Branding & Design System",
    services: ["Visual Identity", "Typography System", "Spatial Design", "Digital Identity"],
    websiteUrl: "https://aartnow.es/#contact",
    heroImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop",
    subtitle: "Contemporary Art & Design System with high-definition typography, spatial layout mechanics and brand identity.",
    overview: "Refraction House is a luxury contemporary art space. We developed a timeless design system rooted in architectural minimalism and high-contrast typography.",
    challenge: "Establishing a visual language that respects fine art while standing out as a forward-looking digital institution.",
    solution: "A high-definition typography framework paired with fluid layout mechanics and real-time interactive exhibition showcases.",
    metrics: [
      { label: "Exhibition Enquiries", value: "+180%" },
      { label: "Brand Retention", value: "98%" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop"
    ],
    nextSlug: "structural-studio",
    nextTitle: "Structural Studio"
  },
  "structural-studio": {
    slug: "structural-studio",
    title: "Structural Studio",
    client: "Structural Labs",
    year: "2026",
    category: "Next-Gen Interactive Web",
    services: ["E-Commerce", "Real-Time 3D", "Custom WebGL", "Headless Tech"],
    websiteUrl: "https://aartnow.es/#contact",
    heroImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1600&auto=format&fit=crop",
    subtitle: "Next-Gen E-Commerce & Interactive WebGL Experience with real-time 3D product customizer and physics shaders.",
    overview: "An immersive 3D e-commerce platform allowing customers to configure custom products with physical material shaders.",
    challenge: "Delivering desktop-grade 3D graphics on mobile browsers without sacrificing loading speeds.",
    solution: "Optimized WebGL pipeline with procedural shaders and smooth touch interaction physics.",
    metrics: [
      { label: "Mobile Conversion Rate", value: "+65%" },
      { label: "Page Load Speed", value: "0.8s" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1400&auto=format&fit=crop"
    ],
    nextSlug: "monolith-digital",
    nextTitle: "Monolith Digital"
  },
  "monolith-digital": {
    slug: "monolith-digital",
    title: "Monolith Digital",
    client: "Monolith Architecture",
    year: "2026",
    category: "Spatial & WebGL",
    services: ["Spatial Computing", "Architectural 3D", "WebGL Identity"],
    websiteUrl: "https://aartnow.es/#contact",
    heroImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    subtitle: "Spatial Computing & WebGL Identity for luxury architecture studio elevating digital brand perception.",
    overview: "Monolith Digital transforms physical architectural blueprints into interactive spatial web environments.",
    challenge: "Translating large-scale architectural CAD models into lightweight web experiences.",
    solution: "Custom WebGL compression algorithm and minimalist studio layout.",
    metrics: [
      { label: "3D Asset Optimization", value: "85%" },
      { label: "Client Inquiries", value: "+310%" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1400&auto=format&fit=crop"
    ],
    nextSlug: "kinetic-motion",
    nextTitle: "Kinetic Motion"
  },
  "kinetic-motion": {
    slug: "kinetic-motion",
    title: "Kinetic Motion",
    client: "Kinetic Productions",
    year: "2026",
    category: "Brand Strategy & Motion",
    services: ["Brand Strategy", "Motion Systems", "Interactive Direction"],
    websiteUrl: "https://aartnow.es/#contact",
    heroImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1600&auto=format&fit=crop",
    subtitle: "Brand Strategy & Interactive Motion System for global audiovisual production studio.",
    overview: "A dynamic identity system driven by real-time motion and generative video shaders for modern film studios.",
    challenge: "Creating a kinetic brand system that looks seamless across social media, cinema screens, and web.",
    solution: "Modular motion design system with automated export presets and interactive portfolio showcase.",
    metrics: [
      { label: "Brand Awareness Rate", value: "+195%" },
      { label: "Award Nominations", value: "4" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop"
    ],
    nextSlug: "jack-and-ai",
    nextTitle: "Jack & AI"
  }
};
