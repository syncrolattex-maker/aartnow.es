import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import HalftoneCursorTrail from './HalftoneCursorTrail';
import GlitchText from './GlitchText';
import PowerGlitchText from './PowerGlitchText';

const cases = [
  { 
    id: 1, 
    num: '01',
    title: 'Jack & AI', 
    headline: 'AI Content Engine & Generative Platform',
    url: 'https://jackandai.com',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/9]',
    widthClass: 'w-[88vw] md:w-[68vw] lg:w-[58vw]',
    offsetClass: 'self-center',
  },
  { 
    id: 2, 
    num: '02',
    title: 'Refraction House', 
    headline: 'Contemporary Art & Design System',
    url: '#',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=75&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
    widthClass: 'w-[75vw] md:w-[48vw] lg:w-[38vw]',
    offsetClass: 'self-start mt-12',
  },
  { 
    id: 3, 
    num: '03',
    title: 'Structural Studio', 
    headline: 'Next-Gen E-Commerce & Interactive Web',
    url: '#',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=75&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[21/9]',
    widthClass: 'w-[95vw] md:w-[78vw] lg:w-[68vw]',
    offsetClass: 'self-end mb-10',
  },
  { 
    id: 4, 
    num: '04',
    title: 'Monolith Digital', 
    headline: 'Spatial Computing & WebGL Identity',
    url: '#',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=75&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[1/1]',
    widthClass: 'w-[80vw] md:w-[52vw] lg:w-[42vw]',
    offsetClass: 'self-start mt-16',
  },
  { 
    id: 5, 
    num: '05',
    title: 'Kinetic Motion', 
    headline: 'Brand Strategy & Interactive Motion System',
    url: '#',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=75&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/10]',
    widthClass: 'w-[85vw] md:w-[65vw] lg:w-[54vw]',
    offsetClass: 'self-center',
  },
];

export default function ProjectList() {
  const { t } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (carouselRef.current) {
        setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="work" className="py-24 w-full bg-[#FFFDF3] border-b border-black/15 text-[#000000] font-mono overflow-hidden">
      <div className="w-full space-y-12">
        
        {/* Section Header & Drag Instructions */}
        <div className="px-6 md:px-16 max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/15 pb-8">
          <div>
            <span className="px-3 py-1 bg-[#FF1300] text-[#FFFDF3] border border-black/10 rounded-none text-xs font-bold uppercase tracking-widest block w-max mb-3 shadow-md">
              {t.casesTag}
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-[#000000] font-sans tracking-tight">
              <PowerGlitchText text={t.casesTitle} as="h2" />
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#FF1300] font-mono font-bold uppercase bg-black/5 border border-black/10 px-4 py-2 rounded-none flex-shrink-0">
            <span className="w-2 h-2 bg-[#FF1300] animate-pulse"></span>
            <span>[ ARRASTRA HORIZONTALMENTE CON EL CURSOR ]</span>
          </div>
        </div>

        {/* Full-Width Irregular Drag Carousel Track with Official Lama Lama Halftone Grid Bulge Component */}
        <div ref={carouselRef} className="w-full cursor-grab active:cursor-grabbing overflow-hidden px-6 md:px-16 min-h-[70vh] flex items-center">
          <motion.div 
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            className="flex items-center gap-12 md:gap-16 w-max py-8"
          >
            {cases.map((c) => {
              const isHovered = hoveredId === c.id;

              return (
                <div 
                  key={c.id} 
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  data-cursor-text={isHovered ? t.caseCursorText : 'DRAG TO SWIPE'}
                  className={`${c.widthClass} ${c.offsetClass} flex-shrink-0 relative group space-y-4`}
                >
                  {/* Outer Wrapper with SVG Marching Dashed Border along Rectangular Perimeter */}
                  <div className="relative p-2">
                    
                    {/* SVG Marching Dashed Border Overlay */}
                    <svg className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 z-20 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        fill="none"
                        stroke="#FF1300"
                        strokeWidth="2"
                        className="animate-marching-dashes"
                      />
                    </svg>

                    {/* Official Lama Lama Halftone Grid & Bulge Distortion Canvas Container */}
                    <div className={`${c.aspect} w-full rounded-none overflow-hidden bg-neutral-950 border border-black/15 relative shadow-2xl`}>
                      <HalftoneCursorTrail 
                        src={c.image} 
                        type="image" 
                        gridSize={10}
                        influenceRadius={100}
                        dotRadius={3.5}
                        decay={0.93}
                        warpStrength={22}
                        dotColor="255,19,0"
                      />

                      {/* Centered Main Title Overlay on top of the image */}
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none z-10 bg-black/30 group-hover:bg-transparent transition-colors">
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-[#FFFDF3] tracking-tight font-sans drop-shadow-2xl">
                          <GlitchText key={`${c.id}-${isHovered}`} text={c.title} />
                        </h3>
                      </div>
                    </div>

                  </div>

                  {/* Metadata & Actions Details BELOW the Image */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-black/15 pt-4 px-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#FF1300]">[{c.num} / 05]</span>
                        <span className="text-xs text-black/40 font-bold">[{c.year}]</span>
                      </div>
                      <p className="text-xs text-black/80 max-w-md font-bold">{c.headline}</p>
                    </div>

                    <a 
                      href={c.url !== '#' ? c.url : '#contact'}
                      target={c.url !== '#' ? '_blank' : '_self'}
                      rel="noreferrer"
                      data-magnetic="true"
                      className="px-6 py-3 bg-[#FF1300] text-[#FFFDF3] font-bold uppercase text-xs rounded-none hover:bg-[#000000] hover:text-[#FFFDF3] transition-colors flex items-center gap-2 flex-shrink-0 shadow-lg"
                    >
                      <span>{t.viewCase}</span>
                      <span>↗</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
