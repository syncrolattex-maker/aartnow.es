import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Cursor from '../Cursor';
import GlobalAdaptiveHalftoneTrail from '../GlobalAdaptiveHalftoneTrail';
import Scene from '../WebGL/Scene';
import SmoothScroll from '../SmoothScroll';
import WikiGraphView from './WikiGraphView';
import WikiArticleReader from './WikiArticleReader';
import BrainAgentModal from './BrainAgentModal';
import { wikiNotes, getWikiGraphData, WikiNote } from '../../data/wikiIndex';

export default function WikiPage() {
  const [activeNoteId, setActiveNoteId] = useState<string>('pipeline-3d');
  const [viewMode, setViewMode] = useState<'both' | 'graph' | 'reader'>('both');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const graphData = getWikiGraphData();
  const currentNote = wikiNotes.find((n) => n.id === activeNoteId) || wikiNotes[0];

  // Comprobar si la URL trae un parámetro de nota inicial (ej: /wiki?note=stack-web)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const noteParam = params.get('note');
    if (noteParam && wikiNotes.some((n) => n.id === noteParam)) {
      setActiveNoteId(noteParam);
    }
  }, []);

  const categories = ['ALL', '3D & CGI', 'Desarrollo Web', 'Dirección de Arte', 'Metodología & Negocio'];

  const filteredNotes = wikiNotes.filter((note) => {
    const matchCat = selectedCategory === 'ALL' || note.category === selectedCategory;
    const matchQuery =
      searchFilter === '' ||
      note.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchCat && matchQuery;
  });

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    // Si la pantalla es pequeña y está en modo graph, cambiar a reader automáticamente
    if (window.innerWidth < 1024 && viewMode === 'graph') {
      setViewMode('reader');
    }
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen w-full bg-[#000000] text-[#FFFDF3] font-sans selection:bg-white selection:text-black relative overflow-x-clip">
        <Scene />
        <div className="dither-bg-overlay" />
        <div className="grain-overlay" />
        <Cursor />
        <GlobalAdaptiveHalftoneTrail />
        <Header />

        <main className="w-full pt-28 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 max-w-[1700px] mx-auto space-y-8">
          {/* Barra Superior: Título Editorial, Modo y Botón del Asistente */}
          <div className="border-b border-white/15 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-white/50 block mb-2">
                [ SECOND BRAIN · LLM WIKI · BASE DE CONOCIMIENTO VIVA ]
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-sans">
                Wiki &amp; Digital Garden
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de Vistas */}
              <div className="flex bg-neutral-900 border border-white/20 p-1 text-xs font-mono uppercase">
                <button
                  onClick={() => setViewMode('both')}
                  className={`px-3 py-1.5 transition-colors ${
                    viewMode === 'both' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  DUAL
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 transition-colors ${
                    viewMode === 'graph' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  GRAFO
                </button>
                <button
                  onClick={() => setViewMode('reader')}
                  className={`px-3 py-1.5 transition-colors ${
                    viewMode === 'reader' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  NOTA
                </button>
              </div>

              {/* Botón Asistente IA */}
              <button
                onClick={() => setIsAgentOpen(true)}
                className="px-4 py-2.5 bg-white text-black font-mono text-xs uppercase font-semibold hover:bg-neutral-200 transition-all shadow-lg flex items-center gap-2 cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CONSULTAR AL AGENTE IA</span>
                <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>
            </div>
          </div>

          {/* Filtros por Categoría y Buscador */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-2 text-xs font-mono">
            {/* Categorías */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 border uppercase transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white/20 border-white text-white font-semibold'
                      : 'border-white/15 text-white/50 hover:text-white hover:border-white/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Input de Búsqueda */}
            <div className="w-full lg:w-72">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar notas o #tags..."
                className="w-full bg-neutral-950 border border-white/20 px-3 py-1.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Contenido Principal: Split-Screen o Pantalla Completa */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[600px]">
            {/* Columna Izquierda: Grafo o Lista de Notas filtradas */}
            {(viewMode === 'both' || viewMode === 'graph') && (
              <div className={`${viewMode === 'graph' ? 'lg:col-span-12 h-[75vh]' : 'lg:col-span-5 h-[680px]'} flex flex-col gap-4`}>
                <div className="flex-1 h-full">
                  <WikiGraphView
                    nodes={graphData.nodes}
                    links={graphData.links}
                    activeNodeId={activeNoteId}
                    onSelectNode={handleSelectNote}
                  />
                </div>

                {/* Directorio de Notas */}
                <div className="bg-neutral-950/60 border border-white/10 p-4 max-h-56 overflow-y-auto space-y-2">
                  <div className="text-[11px] font-mono text-white/40 uppercase mb-2">
                    ÍNDICE DE NOTAS ({filteredNotes.length})
                  </div>
                  {filteredNotes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectNote(n.id)}
                      className={`w-full text-left p-2 border transition-colors flex items-center justify-between text-xs font-mono ${
                        n.id === activeNoteId
                          ? 'bg-white/15 border-white text-white font-semibold'
                          : 'border-white/5 text-white/70 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="truncate pr-2">{n.title}</span>
                      <span className="text-[10px] text-white/40 uppercase shrink-0">[{n.readTime}]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Columna Derecha: Lector Editorial de la Nota Activa */}
            {(viewMode === 'both' || viewMode === 'reader') && (
              <div className={`${viewMode === 'reader' ? 'lg:col-span-12' : 'lg:col-span-7'}`}>
                <WikiArticleReader
                  note={currentNote}
                  onNavigateNote={handleSelectNote}
                />
              </div>
            )}
          </div>
        </main>

        {/* Modal del Asistente IA */}
        <BrainAgentModal
          isOpen={isAgentOpen}
          onClose={() => setIsAgentOpen(false)}
          onNavigateNote={handleSelectNote}
        />
      </div>
    </SmoothScroll>
  );
}
