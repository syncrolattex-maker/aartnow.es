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
    title: "Jack & AI",
    client: "Jack & AI Inc.",
    year: "2026",
    category: "AI Platform & Branding",
    services: ["Brand Strategy", "AI Engine UX", "WebGL Shaders", "Creative Direction"],
    websiteUrl: "https://jackandai.com",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    subtitle: "AI Content Engine & Generative Platform for next-generation digital creators and automated asset workflows.",
    overview: "Jack & AI represents the frontier of automated generative branding. We designed a high-velocity visual identity and an ultra-responsive WebGL platform where users generate hyper-stylized digital assets in real time.",
    challenge: "Traditional creative tools create friction between prompt generation and real-time visual output. Jack & AI needed a seamless, zero-latency interface capable of rendering complex AI shader assets instantly.",
    solution: "We built an end-to-end digital experience with custom WebGL canvas shaders, intuitive prompt tokenization, and a studio monochrome design system that highlights generative visual outputs.",
    metrics: [
      { label: "Asset Render Velocity", value: "< 250ms" },
      { label: "Active User Growth", value: "+240%" },
      { label: "User Session Duration", value: "14.2 min" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop"
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
