import React, { useEffect } from 'react';
import Header from './Header';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import Scene from './WebGL/Scene';
import ExplosiveList, { ExplosiveLineItem } from './ExplosiveList';
import SmoothScroll from './SmoothScroll';

// Líneas individuales rítmicas para que el efecto actúe estrictamente línea a línea
const ABOUT_LINE_ITEMS: ExplosiveLineItem[] = [
  // Nombre del autor en negrita (Bold) antes del texto
  { 
    text: 'Aaron Primo Almarche', 
    isBold: true, 
    isParagraphBreak: true 
  },

  // Párrafo 1 (Tipografía Light / Regular)
  { text: 'Diseñador gráfico, desarrollador web' },
  { text: 'y creador de experiencias digitales con base en Alcàsser.' },
  { text: 'Entiendo cada proyecto como un todo' },
  { text: 'donde la estética visual y el rendimiento técnico' },
  { text: 'deben ir siempre de la mano.', isParagraphBreak: true },

  // Párrafo 2 (Tipografía Light / Regular)
  { text: 'Para dar forma a la dirección de arte,' },
  { text: 'mi ecosistema natural es Adobe' },
  { text: '(Photoshop, Illustrator, InDesign, After Effects).' },
  { text: 'Cuando el proyecto exige dar el salto al volumen y al fotorrealismo,' },
  { text: 'construyo los entornos en Cinema 4D o Autodesk 3ds Max,' },
  { text: 'creo materiales complejos con Substance 3D (Designer y Sampler)' },
  { text: 'y exprimo la iluminación con el motor de render que mejor pida la escena,' },
  { text: 'ya sea Corona, V-Ray, Octane, Arnold o Keyshot.', isParagraphBreak: true },

  // Párrafo 3 (Tipografía Light / Regular)
  { text: 'En el lado del desarrollo, traduzco todo ese diseño' },
  { text: 'a código limpio y eficiente (React, Next.js, Tailwind).' },
  { text: 'Para ello, me apoyo en entornos de trabajo robustos' },
  { text: 'como IntelliJ para la programación' },
  { text: 'y DataGrip para la gestión de bases de datos,' },
  { text: 'controlando ágilmente los despliegues' },
  { text: 'y las conexiones a servidores con herramientas como FileZilla y CyberDuck.' },
  { text: 'Disfruto teniendo el control de cada detalle,' },
  { text: 'desde el primer boceto y render, hasta el último commit en Vercel.', isParagraphBreak: true },

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
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
        {/* Background Atmosphere */}
        <Scene />
        <div className="dither-bg-overlay" />
        <div className="grain-overlay" />
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />

        {/* Floating Menu */}
        <Header />

        {/* Fullwidth Line-by-Line Explosive Experience */}
        <main className="w-full flex-1 pt-[34vh] pb-[45vh] relative z-10 flex flex-col justify-center">
          <ExplosiveList items={ABOUT_LINE_ITEMS} />
        </main>
      </div>
    </SmoothScroll>
  );
}
