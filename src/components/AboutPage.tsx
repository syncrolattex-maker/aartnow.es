import React, { useEffect } from 'react';
import Header from './Header';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import ExplosiveList, { ExplosiveLineItem } from './ExplosiveList';
import SmoothScroll from './SmoothScroll';

// Líneas individuales rítmicas para que el efecto actúe estrictamente línea a línea
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <main className="w-full flex-1 pt-[34vh] pb-[38vh] relative z-10 flex flex-col items-center justify-center">
          <ExplosiveList items={ABOUT_LINE_ITEMS} />

          {/* Información de contacto al final del texto */}
          <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-10 md:px-16 pt-8 sm:pt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-base sm:text-lg md:text-xl font-light text-white/80 text-center">
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
        </main>
      </div>
    </SmoothScroll>
  );
}
