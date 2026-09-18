import React from 'react';
import { WikiNote, getBacklinks, wikiNotes } from '../../data/wikiIndex';

interface WikiArticleReaderProps {
  note: WikiNote;
  onNavigateNote: (noteId: string) => void;
}

export default function WikiArticleReader({ note, onNavigateNote }: WikiArticleReaderProps) {
  const backlinks = getBacklinks(note.id);

  // Renderizar contenido markdown y convertir [[wikilinks]] en enlaces interactivos
  const renderFormattedContent = (content: string) => {
    // Dividir por líneas
    const lines = content.trim().split('\n');

    return lines.map((line, idx) => {
      // Título H1
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mb-6 mt-2 font-sans">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // Subtítulo H2
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-bold uppercase text-white/90 tracking-wide mt-8 mb-4 border-b border-white/10 pb-2 font-sans flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white inline-block" />
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Bloque de Cita
      if (line.startsWith('> ')) {
        const textInside = line.replace('> ', '');
        return (
          <blockquote key={idx} className="border-l-2 border-white/40 pl-4 py-2 my-5 text-sm italic text-white/70 bg-white/5">
            {parseWikiLinks(textInside)}
          </blockquote>
        );
      }
      // Lista no ordenada
      if (line.startsWith('- ')) {
        const textInside = line.replace('- ', '');
        return (
          <li key={idx} className="ml-5 list-disc text-sm sm:text-base text-white/80 leading-relaxed my-1.5 font-light">
            {parseWikiLinks(textInside)}
          </li>
        );
      }
      // Párrafo vacío
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }
      // Párrafo estándar
      return (
        <p key={idx} className="text-sm sm:text-base text-white/80 leading-relaxed my-3 font-light">
          {parseWikiLinks(line)}
        </p>
      );
    });
  };

  // Convertir sintaxis [[slug]] en botones de navegación a la nota
  const parseWikiLinks = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const targetId = part.slice(2, -2).trim();
        const targetNote = wikiNotes.find((n) => n.id === targetId);
        const label = targetNote ? targetNote.title : targetId;
        return (
          <button
            key={i}
            onClick={() => onNavigateNote(targetId)}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white/10 hover:bg-white text-white hover:text-black transition-colors rounded text-xs font-mono font-normal border border-white/20"
            title={`Abrir nota: ${label}`}
          >
            <span>[[</span>
            <span className="underline decoration-white/40">{label}</span>
            <span>]]</span>
          </button>
        );
      }
      // Soporte simple para negrita **texto**
      if (part.includes('**')) {
        const subParts = part.split(/(\*\*.*?\*\*)/g);
        return subParts.map((sub, j) => {
          if (sub.startsWith('**') && sub.endsWith('**')) {
            return <strong key={j} className="text-white font-semibold">{sub.slice(2, -2)}</strong>;
          }
          return sub;
        });
      }
      return part;
    });
  };

  return (
    <article className="w-full bg-neutral-950/80 border border-white/10 p-6 sm:p-10 text-white relative">
      {/* Cabecera de metadatos de la nota */}
      <div className="border-b border-white/10 pb-6 mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/50">
          <span className="px-2.5 py-1 bg-white/10 border border-white/15 uppercase text-white">
            [ {note.category} ]
          </span>
          <div className="flex items-center gap-4">
            <span>ACTUALIZADO: {note.lastUpdated}</span>
            <span>·</span>
            <span>LECTURA: {note.readTime}</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-white/70 italic leading-relaxed">
          {note.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {note.tags.map((tag, i) => (
            <span key={i} className="text-[11px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Cuerpo formateado */}
      <div className="space-y-1 font-sans">
        {renderFormattedContent(note.content)}
      </div>

      {/* Panel de Enlaces Bidireccionales (Backlinks estilo Obsidian) */}
      <div className="mt-14 pt-8 border-t border-white/15">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-white/60 flex items-center gap-2">
            <span className="w-2 h-2 bg-white/60 inline-block" />
            NOTAS CONECTADAS QUE ENLAZAN AQUÍ (BACKLINKS)
          </h3>
          <span className="text-xs font-mono text-white/40">[ {backlinks.length} ]</span>
        </div>

        {backlinks.length === 0 ? (
          <p className="text-xs text-white/40 font-mono italic">
            Ninguna otra nota enlaza directamente a este documento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {backlinks.map((b) => (
              <button
                key={b.id}
                onClick={() => onNavigateNote(b.id)}
                className="text-left p-3.5 bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 transition-colors group"
              >
                <span className="text-xs font-mono text-white/40 block mb-1 uppercase">[[ {b.category} ]]</span>
                <span className="text-sm font-medium text-white group-hover:text-white/80 block">{b.title}</span>
                <span className="text-xs text-white/50 block mt-1 line-clamp-1">{b.summary}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
