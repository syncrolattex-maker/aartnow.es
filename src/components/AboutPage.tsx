import React, { useEffect } from 'react';
import Header from './Header';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import Scene from './WebGL/Scene';
import ExplosiveList from './ExplosiveList';
import SmoothScroll from './SmoothScroll';

// Texto exacto suministrado por el usuario, dividido rítmicamente en líneas para el efecto explosivo
const ABOUT_PARAGRAPHS = [
  // Párrafo 1
  [
    'Diseñador gráfico, desarrollador web y creador de experiencias digitales con base en Alcàsser.',
    'Entiendo cada proyecto como un todo donde la estética visual y el rendimiento técnico deben ir siempre de la mano.',
  ],

  // Párrafo 2
  [
    'Para dar forma a la dirección de arte, mi ecosistema natural es Adobe (Photoshop, Illustrator, InDesign, After Effects).',
    'Cuando el proyecto exige dar el salto al volumen y al fotorrealismo, construyo los entornos en Cinema 4D o Autodesk 3ds Max,',
    'creo materiales complejos con Substance 3D (Designer y Sampler)',
    'y exprimo la iluminación con el motor de render que mejor pida la escena, ya sea Corona, V-Ray, Octane, Arnold o Keyshot.',
  ],

  // Párrafo 3
  [
    'En el lado del desarrollo, traduzco todo ese diseño a código limpio y eficiente (React, Next.js, Tailwind).',
    'Para ello, me apoyo en entornos de trabajo robustos como IntelliJ para la programación y DataGrip para la gestión de bases de datos,',
    'controlando ágilmente los despliegues y las conexiones a servidores con herramientas como FileZilla y CyberDuck.',
    'Disfruto teniendo el control de cada detalle, desde el primer boceto y render, hasta el último commit en Vercel.',
  ],

  // Párrafo 4
  [
    'Y cuando no estoy texturizando escenas 3D, diseñando interfaces o picando código,',
    'es muy probable que me encuentres desconectando sobre la bicicleta o ensayando con mi tabal',
  ],
];

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
        {/* Background Atmosphere */}
        <Scene />
        <div className="dither-bg-overlay" />
        <div className="grain-overlay" />
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />

        {/* Floating Menu */}
        <Header />

        {/* Fullwidth Explosive Text Experience - ONLY effect and menu */}
        <main className="w-full flex-1 pt-[32vh] pb-[40vh] relative z-10 flex flex-col justify-center">
          <ExplosiveList paragraphs={ABOUT_PARAGRAPHS} />
        </main>
      </div>
    </SmoothScroll>
  );
}
