import React, { useState, useEffect } from 'react';
import Header from './Header';
import StickyBar from './StickyBar';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import ExplosiveList, { ExplosiveLineItem } from './ExplosiveList';
import SmoothScroll from './SmoothScroll';
import { useLanguage } from '../context/LanguageContext';
import { useDitherTransition } from '../context/DitherTransitionContext';

// Líneas individuales rítmicas para que el efecto actúe estrictamente línea a línea con interlineado 100% uniforme
const ABOUT_LINE_ITEMS: ExplosiveLineItem[] = [
  // Nombre del autor en negrita (Bold) antes del texto
  { text: 'Aaron Primo Almarche', isBold: true },

  // Párrafo 1 (Tipografía Light / Regular)
  { text: 'Diseñador gráfico, desarrollador web' },
  { text: 'y creador de experiencias digitales con base en Alcàsser.' },
  { text: 'Entiendo cada proyecto como un todo' },
  { text: 'donde la estética visual y el rendimiento técnico' },
  { text: 'deben ir siempre de la mano.' },

  // Párrafo 2 (Tipografía Light / Regular)
  { text: 'Para dar forma a la dirección de arte,' },
  { text: 'mi ecosistema natural es Adobe' },
  { text: '(Photoshop, Illustrator, InDesign, After Effects).' },
  { text: 'Cuando el proyecto exige dar el salto al volumen y al fotorrealismo,' },
  { text: 'construyo los entornos en Cinema 4D o Autodesk 3ds Max,' },
  { text: 'creo materiales complejos con Substance 3D (Designer y Sampler)' },
  { text: 'y exprimo la iluminación con el motor de render que mejor pida la escena,' },
  { text: 'ya sea Corona, V-Ray, Octane, Arnold o Keyshot.' },

  // Párrafo 3 (Tipografía Light / Regular)
  { text: 'En el lado del desarrollo, traduzco todo ese diseño' },
  { text: 'a código limpio y eficiente (React, Next.js, Tailwind).' },
  { text: 'Para ello, me apoyo en entornos de trabajo robustos' },
  { text: 'como IntelliJ para la programación' },
  { text: 'y DataGrip para la gestión de bases de datos,' },
  { text: 'controlando ágilmente los despliegues' },
  { text: 'y las conexiones a servidores con herramientas como FileZilla y CyberDuck.' },
  { text: 'Disfruto teniendo el control de cada detalle,' },
  { text: 'desde el primer boceto y render, hasta el último commit en Vercel.' },

  // Párrafo 4 (Tipografía Light / Regular)
  { text: 'Y cuando no estoy texturizando escenas 3D,' },
  { text: 'diseñando interfaces o picando código,' },
  { text: 'es muy probable que me encuentres' },
  { text: 'desconectando sobre la bicicleta o ensayando con mi tabal' },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();
  const [showSubfooter, setShowSubfooter] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Asegurar registro de Cal.com para el botón de programar llamada
    const w = window as any;
    if (w.Cal && w.Cal.ns && w.Cal.ns['15min']) {
      try {
        w.Cal.ns['15min']('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } catch {
        // silent
      }
    }

    // Detectar cuando el scroll llega al fondo absoluto (al tope de abajo) de forma eficiente
    let ticking = false;
    const checkScrollBottom = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          // Aparece únicamente cuando se llega al fondo de la página (dentro de los últimos 70px)
          setShowSubfooter(scrollPos >= docHeight - 70);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', checkScrollBottom, { passive: true });
    window.addEventListener('resize', checkScrollBottom, { passive: true });
    checkScrollBottom();

    return () => {
      window.removeEventListener('scroll', checkScrollBottom);
      window.removeEventListener('resize', checkScrollBottom);
    };
  }, []);

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    triggerTransition(() => {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo(0, 0);
    }, { x: e.clientX, y: e.clientY });
  };

  return (
    <SmoothScroll>
      {/* Fondo 100% negro puro, sin WebGL 3D, sin dither ni ruido */}
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
        {/* Cursor y semitono interactivo */}
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />

        {/* Floating Menu */}
        <Header />

        {/* Fullwidth Line-by-Line Explosive Experience */}
        <main className="w-full flex-1 pt-[34vh] pb-28 sm:pb-36 relative z-10 flex flex-col items-center justify-center">
          <ExplosiveList items={ABOUT_LINE_ITEMS} />

          {/* Bloque final: Enlaces de contacto y los 2 botones de acción */}
          <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-10 md:px-16 pt-10 sm:pt-14 space-y-8 text-center">
            
            {/* Enlaces de contacto (Email, LinkedIn, Instagram) */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-base sm:text-lg md:text-xl font-light text-white/80">
              <a
                href="mailto:prologmac@gmail.com"
                data-cursor-text="EMAIL"
                className="text-white hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/30"
              >
                info@aartnow.es
              </a>
              <span className="text-white/25 hidden sm:inline">/</span>
              <a
                href="https://www.linkedin.com/in/aaron-almarche-457a6b55/"
                target="_blank"
                rel="noreferrer"
                data-cursor-text="LINKEDIN"
                className="text-white/80 hover:text-white transition-colors"
              >
                LinkedIn ↗
              </a>
              <span className="text-white/25 hidden sm:inline">/</span>
              <a
                href="https://www.instagram.com/aaron_primdesign/"
                target="_blank"
                rel="noreferrer"
                data-cursor-text="INSTAGRAM"
                className="text-white/80 hover:text-white transition-colors"
              >
                Instagram ↗
              </a>
            </div>

            {/* Los 2 botones de Contact */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md mx-auto pt-2">
              {/* 1. Programar una llamada (Cal.com popup) */}
              <button
                type="button"
                data-cal-link="aaron-primo-jacnmp/15min"
                data-cal-namespace="15min"
                data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                data-magnetic="true"
                data-cursor-text="CAL.COM"
                className="w-full sm:w-1/2 min-h-[52px] px-6 py-3.5 bg-[#F5F2EB] hover:bg-white text-black text-xs font-mono font-normal uppercase tracking-wider rounded-md transition-colors text-center cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                {t.scheduleCallBtn}
              </button>

              {/* 2. Comenzar un proyecto */}
              <button
                type="button"
                onClick={(e) => handleNavClick('/contact', e)}
                data-magnetic="true"
                data-cursor-text="CONTACT"
                className="w-full sm:w-1/2 min-h-[52px] px-6 py-3.5 bg-black hover:bg-white/10 text-white border border-white/25 hover:border-white text-xs font-mono font-normal uppercase tracking-wider rounded-md transition-all text-center cursor-pointer"
              >
                {t.startProjectBtn}
              </button>
            </div>
          </div>
        </main>

        {/* Subfooter inferior (StickyBar con idiomas y reloj) que aparece SOLO al llegar al tope de abajo */}
        <StickyBar isVisible={showSubfooter} />
      </div>
    </SmoothScroll>
  );
}
