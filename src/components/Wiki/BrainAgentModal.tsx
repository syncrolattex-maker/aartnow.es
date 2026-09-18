import React, { useState } from 'react';
import { wikiNotes, WikiNote } from '../../data/wikiIndex';

interface BrainAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateNote: (noteId: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sourceNoteIds?: string[];
}

export default function BrainAgentModal({
  isOpen,
  onClose,
  onNavigateNote,
}: BrainAgentModalProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hola. Soy el Asistente IA de la Wiki de Aaron. Puedo responder preguntas sobre su pipeline 3D, stack técnico, tarifas orientativas o filosofía de diseño consultando sus notas estructuradas.',
      sourceNoteIds: ['pipeline-3d', 'stack-web', 'metodologia-y-tarifas'],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  // Sugerencias de preguntas predefinidas
  const suggestions = [
    '¿Qué software y motores de render utiliza para 3D?',
    '¿Cómo trabaja el desarrollo web y qué stack utiliza?',
    '¿Cuáles son los plazos y metodología de un proyecto?',
    '¿Qué técnicas de shaders y WebGL implementa en sus webs?',
  ];

  const handleAsk = (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Motor de respuesta semántica local basado en la base de conocimiento
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';
      const matchedNoteIds: string[] = [];

      if (lower.includes('3d') || lower.includes('render') || lower.includes('corona') || lower.includes('cinema') || lower.includes('v-ray') || lower.includes('textura')) {
        reply =
          'Para proyectos 3D y escultura digital, Aaron estructura su pipeline combinando Cinema 4D (para exploración paramétrica y MoGraph) y Autodesk 3ds Max (para modelado arquitectónico de precisión). Para texturizado procedural en 8K recurre a la suite Substance 3D (Designer y Sampler) y simula textiles con Marvelous Designer. La iluminación y cálculo fotorrealista se ejecutan principalmente en Corona Renderer y Chaos V-Ray.';
        matchedNoteIds.push('pipeline-3d', 'direccion-de-arte');
      } else if (lower.includes('web') || lower.includes('stack') || lower.includes('react') || lower.includes('código') || lower.includes('frontend')) {
        reply =
          'El stack web creativo de Aaron está centrado en rendimiento y animaciones a 60 FPS: React con TypeScript en el núcleo, bundling ultraligero con Vite, diseño milimétrico con Tailwind CSS y orquestación cinemática mediante GSAP ScrollTrigger y Lenis Smooth Scroll. Para entornos de desarrollo robustos programa en IntelliJ y administra datos con DataGrip.';
        matchedNoteIds.push('stack-web', 'shaders-y-webgl');
      } else if (lower.includes('precio') || lower.includes('tarifa') || lower.includes('presupuesto') || lower.includes('cuanto') || lower.includes('plazo') || lower.includes('metodolog')) {
        reply =
          'Aaron trabaja cada proyecto como una pieza de autor dividida en 4 fases: Descubrimiento & Dirección de Arte, Prototipado 3D/Visual, Desarrollo en Código Limpio y Despliegue en Servidores Cloud. Una landing creativa suele rondar entre 2 y 4 semanas, mientras que una identidad completa con experiencia 3D/WebGL toma de 4 a 8 semanas. Para una cotización personalizada dispone de la herramienta interactiva en /presupuesto.';
        matchedNoteIds.push('metodologia-y-tarifas');
      } else if (lower.includes('shader') || lower.includes('glsl') || lower.includes('three') || lower.includes('halftone') || lower.includes('distorsion')) {
        reply =
          'En el apartado WebGL, Aaron implementa shaders GLSL personalizados en Three.js delegados a la GPU del usuario. Sus técnicas habituales incluyen tramados de semitonos (halftones reactivos al cursor), grano dither de post-procesado para eliminar bandas de color y distorsión inercial de coordenadas UV según la velocidad del scroll.';
        matchedNoteIds.push('shaders-y-webgl', 'stack-web');
      } else if (lower.includes('arte') || lower.includes('diseño') || lower.includes('estética') || lower.includes('filosofía')) {
        reply =
          'Su dirección de arte se fundamenta en el brutalismo digital, el contraste monocromático estricto (blanco y negro) y la tipografía editorial de gran escala. Al eliminar el ruido visual superfluo, la composición se apoya en el peso del volumen 3D y la nitidez arquitectónica de la tipografía.';
        matchedNoteIds.push('direccion-de-arte', 'pipeline-3d');
      } else {
        // Respuesta integradora general
        reply =
          `Basándome en las notas de la Wiki de Aaron: es diseñador gráfico, artista 3D y desarrollador frontend con base en Alcàsser. Une dirección de arte contemporánea con ingeniería web (React, Vite, Three.js) y renderizado CGI fotorrealista (Cinema 4D, 3ds Max, Corona, V-Ray). Puedes profundizar en cualquiera de sus notas estructuradas en el panel lateral.`;
        matchedNoteIds.push('pipeline-3d', 'stack-web', 'direccion-de-arte');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          sourceNoteIds: matchedNoteIds,
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/20 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Cabecera Terminal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-white uppercase font-semibold">
              AARON'S BRAIN AGENT · LLM WIKI
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs font-mono uppercase px-2 py-1 hover:bg-white/10 transition-colors"
          >
            [ CERRAR ✕ ]
          </button>
        </div>

        {/* Zona de Mensajes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 border ${
                m.role === 'user'
                  ? 'bg-white/5 border-white/20 text-white ml-8'
                  : 'bg-neutral-950 border-white/10 text-white/90 mr-8'
              }`}
            >
              <div className="text-[10px] text-white/40 uppercase mb-1.5 flex items-center gap-2">
                <span>{m.role === 'user' ? '► PREGUNTA' : '◄ AARON BRAIN WIKI'}</span>
              </div>
              <p className="leading-relaxed font-sans text-sm">{m.content}</p>

              {/* Fuentes citadas de la Wiki */}
              {m.sourceNoteIds && m.sourceNoteIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-white/40">FUENTES CITADAS:</span>
                  {m.sourceNoteIds.map((noteId) => {
                    const found = wikiNotes.find((n) => n.id === noteId);
                    if (!found) return null;
                    return (
                      <button
                        key={noteId}
                        onClick={() => {
                          onNavigateNote(noteId);
                          onClose();
                        }}
                        className="text-[11px] px-2 py-0.5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-colors"
                      >
                        [[ {found.title} ]]
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="p-3 text-xs text-white/50 animate-pulse">
              Consultando índice de la wiki y sintetizando respuesta...
            </div>
          )}
        </div>

        {/* Sugerencias Rápidas */}
        <div className="px-5 py-2.5 border-t border-white/10 bg-neutral-950/80 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleAsk(s)}
              className="text-[11px] font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 border border-white/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Barra de Entrada */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-4 border-t border-white/15 bg-black flex gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Pregunta sobre 3D, shaders, stack web o metodología..."
            className="flex-1 bg-neutral-900 border border-white/20 px-3.5 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-black text-xs font-mono uppercase font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            CONSULTAR
          </button>
        </form>
      </div>
    </div>
  );
}
