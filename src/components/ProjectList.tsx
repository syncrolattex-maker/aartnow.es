import { useLanguage } from '../context/LanguageContext';
import ProjectAccordion, { ProjectItem } from './ProjectAccordion';
import PowerGlitchText from './PowerGlitchText';

export default function ProjectList() {
  const { t } = useLanguage();

  const projectsData: ProjectItem[] = [
    {
      title: "Jack & AI",
      tags: [t.s01Title, "AI Platform"],
      description: t.p1Desc,
      caseUrl: "/cases/jack-and-ai",
      siteUrl: "https://jackandai.com",
      thumbnails: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=75&w=600&auto=format&fit=crop"
      ],
      gallery: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=75&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=1200&auto=format&fit=crop"
      ]
    },
    {
      title: "Refraction House",
      tags: [t.s01Title, t.s02Title],
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
      tags: [t.s04Title, "Interactive Web"],
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
      tags: ["Spatial", t.s03Title],
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
      tags: [t.s01Title, "Motion System"],
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
    }
  ];

  return (
    <section id="work" className="py-24 w-full bg-[#000000] border-b border-white/15 text-[#FFFFFF] font-mono overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-16 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8">
          <div>
            <span className="px-3 py-1 bg-white/10 text-white border border-white/15 rounded-none text-xs font-bold uppercase tracking-widest block w-max mb-3 shadow-md">
              {t.casesTag}
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-white font-sans tracking-tight">
              <PowerGlitchText text={t.casesTitle} as="h2" />
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60 font-mono font-bold uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-none flex-shrink-0">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>{t.casesInstruction}</span>
          </div>
        </div>

        {/* Official Lama Lama Work Accordion */}
        <ProjectAccordion projects={projectsData} />

      </div>
    </section>
  );
}
