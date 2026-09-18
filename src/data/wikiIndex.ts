export interface WikiNote {
  id: string;
  slug: string;
  title: string;
  category: '3D & CGI' | 'Desarrollo Web' | 'Dirección de Arte' | 'Metodología & Negocio';
  summary: string;
  lastUpdated: string;
  readTime: string;
  tags: string[];
  linksTo: string[]; // IDs de otras notas a las que enlaza
  content: string; // Contenido en Markdown
}

export const wikiNotes: WikiNote[] = [
  {
    id: 'pipeline-3d',
    slug: 'pipeline-3d',
    title: 'Pipeline de Escultura Digital & Render Fotorrealista',
    category: '3D & CGI',
    summary: 'Metodología de modelado orgánico, creación de texturas procedurales y motores de render (Corona, V-Ray, Octane, Substance 3D).',
    lastUpdated: '2026-09-18',
    readTime: '4 min',
    tags: ['Cinema 4D', '3ds Max', 'Corona', 'V-Ray', 'Substance 3D', 'Marvelous Designer'],
    linksTo: ['direccion-de-arte', 'shaders-y-webgl'],
    content: `
# Pipeline de Escultura Digital & Render Fotorrealista

En mi práctica como artista 3D y diseñador, el 3D no es un simple añadido decorativo: es un lenguaje de volumen, peso visual e interacción con la luz.

## 1. Modelado & Topología
- **Cinema 4D**: Lo empleo principalmente para exploración volumétrica rápida, deformadores paramétricos, dinámicas de movimiento y sistemas MoGraph.
- **Autodesk 3ds Max**: Mi estándar para modelado de precisión arquitectónica, curvatura controlada y preparación de mallas limpias sin artefactos.
- **Marvelous Designer & CLO Standalone**: Para simulación física textil de alta fidelidad, caída natural de tejidos y drapeado realista.

## 2. Texturizado Procedural con Substance 3D
- **Substance 3D Designer**: Creación de mapas PBR desde cero (albedo, roughness, normal, displacement, metallic). Permite resolver patrones matemáticos complejos y microdetalles microscópicos en 8K.
- **Substance 3D Sampler**: Digitalización y remasterización de texturas físicas reales mediante escaneo fotográfico y filtrado procedural.

## 3. Iluminación y Motores de Render
Cada motor de render tiene una personalidad y respuesta física particular:
- **Corona Renderer**: Mi primera opción para realismo de estudio e interiores. Su cálculo de dispersión lumínica y control de balance de blancos produce una estética cinematográfica natural.
- **Chaos V-Ray**: El estándar para escenas complejas con millones de polígonos y shaders híbridos.
- **Octane & Arnold**: Utilizados para look-development acelerado por GPU y materiales dieléctricos o cáusticas complejas.

> *Conexión con la web*: Todo el aprendizaje sobre iluminación y materiales PBR alimenta directamente cómo diseño e implemento [[shaders-y-webgl]] en el navegador, manteniendo coherencia con la [[direccion-de-arte]].
`
  },
  {
    id: 'stack-web',
    slug: 'stack-web',
    title: 'Stack de Desarrollo Web Creativo & Alto Rendimiento',
    category: 'Desarrollo Web',
    summary: 'Arquitectura frontend reactiva, balance entre estética radical y tiempos de carga óptimos (React, Vite, GSAP, Tailwind, Three.js).',
    lastUpdated: '2026-09-18',
    readTime: '3 min',
    tags: ['React', 'TypeScript', 'Vite', 'GSAP', 'Three.js', 'Tailwind CSS'],
    linksTo: ['shaders-y-webgl', 'metodologia-y-tarifas'],
    content: `
# Stack de Desarrollo Web Creativo & Alto Rendimiento

Un buen diseño no sirve de nada si se siente pesado, tosco o tarda 5 segundos en reaccionar. Mi ecosistema de desarrollo busca la fluidez total: 60 FPS estables, interacción inercial y tipografía nítida.

## 1. Base Tecnológica
- **React & TypeScript**: Tipado riguroso de cada componente, previniendo fallos en tiempo de compilación y permitiendo escalabilidad limpia.
- **Vite**: Bundling ultrarrápido con Rollup, HMR instantáneo y optimización de chunks menores de 500 KB para despliegues ligeros.
- **Tailwind CSS**: Control milimétrico de espaciado, rejillas responsive fluidas y utilidades de diseño sin CSS muerto en el bundle final.

## 2. Animación & Microinteracciones
- **GSAP (GreenSock) & ScrollTrigger**: El motor principal para orquestar coreografías de scroll sin tirones (*scrubbing*), animaciones cronometradas y transiciones de página.
- **Lenis Smooth Scroll**: Suavizado de inercia que desacopla el tick de scroll del navegador, alimentando a GSAP para una respuesta sedosa tanto en escritorio como en móvil.

## 3. Entorno de Trabajo
- Programación pura en **IntelliJ IDEA** y gestión de datos con **DataGrip**, manteniendo un flujo de trabajo profesional, robusto y automatizado.

> Consulta también nuestra [[metodologia-y-tarifas]] para ver cómo se traduce este stack en tiempos de entrega y costes de proyecto.
`
  },
  {
    id: 'direccion-de-arte',
    slug: 'direccion-de-arte',
    title: 'Dirección de Arte: Monocromatismo, Editorial y Brutalismo Digital',
    category: 'Dirección de Arte',
    summary: 'Principios estéticos: contraste extremo, tipografía estructural de gran escala y microdetalles que generan tensión visual.',
    lastUpdated: '2026-09-18',
    readTime: '3 min',
    tags: ['Tipografía', 'Brutalismo', 'Diseño Editorial', 'UI/UX', 'Fotografía'],
    linksTo: ['pipeline-3d', 'stack-web'],
    content: `
# Dirección de Arte: Monocromatismo, Editorial y Brutalismo Digital

Entiendo la dirección de arte como la eliminación de todo artificio innecesario para dejar que la idea y la forma hablen con máxima fuerza.

## 1. El Poder del Contraste Monocromático
- El uso de una paleta estricta en blanco, negro y escala de grises obliga a que la composición dependa de la luz, el volumen y la jerarquía tipográfica, no de colores de distracción.
- Los toques sutiles de color (señales rojas, degradados selectivos) solo aparecen para indicar interactividad o tensión visual.

## 2. Tipografía como Arquitectura
- Grandes titulares sin serifa (Suisse Int'l, Neue Haas Grotesk, PP Neue Montreal) que estructuran el espacio en pantalla como columnas arquitectónicas.
- Ritmo vertical cuidado: interlineados ajustados (*tight leading*) para titulares y espaciado generoso para lectura de textos densos.

## 3. Diálogo entre 3D y Código
- No concibo el diseño gráfico como un plano 2D estático. Al combinar renders generados en [[pipeline-3d]] con transiciones interactivas en [[stack-web]], el usuario percibe la web como una galería táctil y contemporánea.
`
  },
  {
    id: 'shaders-y-webgl',
    slug: 'shaders-y-webgl',
    title: 'Shaders GLSL, Halftones y Distorsión Interactiva',
    category: 'Desarrollo Web',
    summary: 'Técnicas de renderizado en tiempo real en el navegador: tramados de semitonos (halftone), dithering post-procesado y deformación de píxeles.',
    lastUpdated: '2026-09-18',
    readTime: '5 min',
    tags: ['Three.js', 'GLSL', 'Shaders', 'WebGL', 'Post-Processing', 'Halftone'],
    linksTo: ['stack-web', 'pipeline-3d', 'direccion-de-arte'],
    content: `
# Shaders GLSL, Halftones y Distorsión Interactiva

WebGL nos permite delegar el cálculo visual a la tarjeta gráfica (GPU) del usuario, logrando efectos de refracción y deformación que el DOM tradicional no puede procesar a 60 FPS.

## 1. Tramas de Semitonos (Halftones Adaptativos)
- Inspirado en la serigrafía tradicional y los cómics de imprenta analógica.
- Un fragment shader calcula la luminancia de la textura subyacente y genera una cuadrícula de puntos cuyo radio varía según la intensidad de luz y la proximidad del cursor.

## 2. Dithering & Grano Fílmico
- Para evitar el aspecto "plástico" de los renders digitales, aplicamos una capa de dither procedural en el pase final.
- Esto elimina las bandas de color en degradados sutiles y confiere una textura orgánica e impresa a la pantalla.

## 3. Pixel Distortion y Chromatic Shift
- Interceptando las coordenadas UV en el vertex y fragment shader, podemos modular la posición de cada pixel con respecto al movimiento inercial del scroll, creando glitches controlados y aberración cromática en los bordes.

> Estos shaders son el puente tecnológico que conecta el fotorrealismo de [[pipeline-3d]] con la estética gráfica de [[direccion-de-arte]].
`
  },
  {
    id: 'metodologia-y-tarifas',
    slug: 'metodologia-y-tarifas',
    title: 'Metodología de Trabajo, Fases y Filosofía de Presupuestos',
    category: 'Metodología & Negocio',
    summary: 'Cómo gestiono proyectos de inicio a fin: descubrimiento, diseño conceptual, desarrollo a medida y transparencia económica.',
    lastUpdated: '2026-09-18',
    readTime: '4 min',
    tags: ['Presupuestos', 'Proceso', 'Freelance', 'Consultoría', 'Estrategia'],
    linksTo: ['stack-web', 'direccion-de-arte'],
    content: `
# Metodología de Trabajo, Fases y Filosofía de Presupuestos

Cada encargo se aborda como una pieza de autor. No uso plantillas prediseñadas ni soluciones genéricas de bajo impacto.

## 1. Las Cuatro Fases Clave
1. **Descubrimiento y Dirección de Arte**: Alineamiento con el cliente, definición de referencias visuales, tono y arquitectura de información.
2. **Prototipado y Modelado (si incluye 3D)**: Construcción de assets visuales, maquetas de alta fidelidad y pruebas de interacción.
3. **Desarrollo en Código Limpio**: Programación desde cero utilizando [[stack-web]], con optimización extrema para SEO, accesibilidad y rendimiento en todos los dispositivos.
4. **Despliegue y Pruebas de Estrés**: Lanzamiento en servidores cloud con CD/CI, control de dominio y soporte post-lanzamiento.

## 2. Transparencia en Precios y Plazos
- **Landing page o Portfolio creativo**: Típicamente entre 2 a 4 semanas de desarrollo.
- **Identidad completa + Experiencia 3D/WebGL interactiva**: Entre 4 a 8 semanas según complejidad.
- Para obtener un cálculo inmediato orientativo según las características exactas del proyecto, disponemos de la herramienta interactiva en **/presupuesto**.
`
  }
];

export interface WikiGraphNode {
  id: string;
  title: string;
  category: string;
  linksCount: number;
}

export interface WikiGraphLink {
  source: string;
  target: string;
}

export function getWikiGraphData(): { nodes: WikiGraphNode[]; links: WikiGraphLink[] } {
  const nodes: WikiGraphNode[] = wikiNotes.map((note) => ({
    id: note.id,
    title: note.title,
    category: note.category,
    linksCount: note.linksTo.length,
  }));

  const links: WikiGraphLink[] = [];
  wikiNotes.forEach((note) => {
    note.linksTo.forEach((targetId) => {
      // Evitar duplicados y enlaces rotos
      if (wikiNotes.some((n) => n.id === targetId)) {
        links.push({
          source: note.id,
          target: targetId,
        });
      }
    });
  });

  return { nodes, links };
}

export function getBacklinks(noteId: string): WikiNote[] {
  return wikiNotes.filter((n) => n.linksTo.includes(noteId));
}
