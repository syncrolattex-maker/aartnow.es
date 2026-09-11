import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProjectAccordion, { ProjectItem } from './ProjectAccordion';
import PowerGlitchText from './PowerGlitchText';
import PortfolioSubmenu, { PortfolioCategory, PORTFOLIO_CATEGORIES } from './PortfolioSubmenu';

export default function ProjectList() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('TODO');
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false);

  const projectsData: ProjectItem[] = [
    {
      title: "3D Kinetic Sculpture",
      tags: [t.tag3DDesign || "Diseño 3D", "Cinema 4D / 3ds Max", "Corona & V-Ray"],
      categories: ['3D', 'BRANDING', 'CARTELES'],
      description: t.p1Desc,
      caseUrl: "/cases/jack-and-ai",
      siteUrl: "https://jackandai.com",
      thumbnails: [
        "/projects/project1-1.jpg",
        "/projects/project1-2.jpg"
      ],
      gallery: [
        "/projects/project1-1.jpg",
        "/projects/project1-2.jpg"
      ]
    },
    {
      title: "Refraction House",
      tags: [t.s01Title, t.s02Title, "BRANDING"],
      categories: ['BRANDING', 'CARTELES', 'LOGO'],
      description: t.p2Desc,
      caseUrl: "/cases/refraction-house",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Structural Studio",
      tags: [t.s04Title, "E-Commerce", "COMMERCE"],
      categories: ['COMMERCE', 'CORPORATE'],
      description: t.p3Desc,
      caseUrl: "/cases/structural-studio",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Monolith Digital",
      tags: ["Spatial", t.s03Title, "CORPORATE"],
      categories: ['CORPORATE', 'BRANDING'],
      description: t.p4Desc,
      caseUrl: "/cases/monolith-digital",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Kinetic Motion",
      tags: [t.s01Title, "Motion", "CARTELES"],
      categories: ['CARTELES', 'BRANDING', 'LOGO'],
      description: t.p5Desc,
      caseUrl: "/cases/kinetic-motion",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Poster Lab · Vol. II",
      tags: ["Print & Poster", "Typography", "CARTELES"],
      categories: ['CARTELES', 'BRANDING'],
      description: t.p6Desc || "Serie experimental de cartelería serigráfica y gráficos tipográficos de gran formato para festivales de arte contemporáneo.",
      caseUrl: "/cases/refraction-house",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Logofolio 2026",
      tags: ["Identity System", "Logos", "LOGO"],
      categories: ['LOGO', 'BRANDING'],
      description: t.p7Desc || "Catálogo de marcas vectoriales, monogramas geométricos y símbolos de identidad para startups de inteligencia artificial.",
      caseUrl: "/cases/jack-and-ai",
      siteUrl: "#contact",
      thumbnails: [
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=1200&auto=format&fit=crop"
      ]
    }
  ];

  // Conteo de proyectos por seccion
  const categoryCounts = useMemo(() => {
    const counts: Record<PortfolioCategory, number> = {
      TODO: projectsData.length,
      BRANDING: 0,
      CARTELES: 0,
      COMMERCE: 0,
      CORPORATE: 0,
      LOGO: 0,
    };
    projectsData.forEach((p) => {
      p.categories?.forEach((cat) => {
        if (cat in counts && cat !== 'TODO') {
          counts[cat as PortfolioCategory] = (counts[cat as PortfolioCategory] || 0) + 1;
        }
      });
    });
    return counts;
  }, [projectsData]);

  // Lista filtrada de proyectos segun categoria activa
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'TODO') return projectsData;
    return projectsData.filter((p) => p.categories?.includes(selectedCategory));
  }, [selectedCategory, projectsData]);

  // Deteccion de scroll para activar el submenu flotante
  useEffect(() => {
    const handleScroll = () => {
      const workEl = document.getElementById('work');
      if (!workEl) return;

      const rect = workEl.getBoundingClientRect();
      // Aparece cuando se hace scroll a la seccion del portfolio y permanece visible mientras se navega en ella
      const inView = rect.top <= window.innerHeight * 0.85 && rect.bottom >= 120;
      setIsSubmenuVisible(inView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategorySelect = (cat: PortfolioCategory) => {
    setSelectedCategory(cat);
    const workEl = document.getElementById('work');
    if (workEl) {
      const rect = workEl.getBoundingClientRect();
      // Si el usuario esta demasiado abajo, reposicionar suavemente al inicio de la lista
      if (rect.top < -80) {
        workEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section id="work" className="py-24 w-full bg-[#000000] border-b border-white/15 text-[#FFFFFF] font-sans overflow-hidden relative">
      {/* Submenu flotante que aparece al hacer scroll a la seccion */}
      <PortfolioSubmenu
        activeCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        isVisible={isSubmenuVisible}
        categoryCounts={categoryCounts}
      />

      {/* Full-width container for Featured Work section */}
      <div className="w-full px-6 md:px-12 lg:px-16 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8">
          <div>
            <span className="px-3 py-1 bg-white/10 text-white border border-white/15 rounded-none text-xs font-normal uppercase tracking-widest block w-max mb-3 shadow-md">
              {t.casesTag}
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white font-sans tracking-tight">
              <PowerGlitchText text={t.casesTitle} as="h2" />
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60 font-sans font-normal uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-none flex-shrink-0">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>{t.casesInstruction}</span>
          </div>
        </div>

        {/* Official Lama Lama Work Accordion filtrado */}
        <ProjectAccordion projects={filteredProjects} />

      </div>
    </section>
  );
}