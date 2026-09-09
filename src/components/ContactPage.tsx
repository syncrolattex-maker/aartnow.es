import { useState, useEffect } from 'react';
import Header from './Header';
import StickyBar from './StickyBar';
import Cursor from './Cursor';
import GlobalAdaptiveHalftoneTrail from './GlobalAdaptiveHalftoneTrail';
import Scene from './WebGL/Scene';
import { useDecryptText } from './DecryptText';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectTypes, setProjectTypes] = useState<string[]>(['Branding']);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const scheduleCall = useDecryptText(t.scheduleCallBtn || 'Programar una llamada');
  const startProjectText = showProjectForm ? (t.closeFormBtn || 'Cerrar Formulario') : (t.startProjectBtn || 'Comenzar un proyecto');
  const startProject = useDecryptText(startProjectText);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Asegurar registro de Cal.com
    const w = window as any;
    if (w.Cal && w.Cal.ns && w.Cal.ns['15min']) {
      try {
        w.Cal.ns['15min']('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } catch {
        // silent
      }
    }
  }, []);

  const toggleProjectType = (type: string) => {
    setProjectTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black relative overflow-x-clip flex flex-col justify-between">
      <Scene />
      <div className="dither-bg-overlay" />
      <div className="grain-overlay" />
      <Cursor />
      <GlobalAdaptiveHalftoneTrail />
      <Header />
      <StickyBar />

      {/* Main Container - Centrado vertical en la pantalla */}
      <main className="w-full flex-1 flex flex-col justify-center pt-28 pb-24 sm:pb-28 px-6 md:px-12 lg:px-16 relative z-10">
        <div className="w-full max-w-[1700px] mx-auto my-auto">
          {/* Layout 2 Partes: 40% Izquierda / 60% Derecha - Centrado al medio */}
          <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-14 xl:gap-16 items-start lg:items-center">
            
            {/* Columna Izquierda (40%): Letras Grandes */}
            <div className="w-full lg:w-[40%] shrink-0">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.6vw] xl:text-[5vw] font-black uppercase tracking-tighter text-white leading-[0.90] font-sans break-words">
                Infórmanos<br />
                de algo<span className="text-white/40">.</span>
              </h1>
            </div>

            {/* Columna Derecha (60%): Justificado a la izquierda */}
            <div className="w-full lg:w-[60%] text-left space-y-8 md:space-y-10">
              
              {/* Arriba: Ponte en contacto */}
              <div className="space-y-2">
                <span className="text-xs md:text-sm uppercase tracking-widest text-white/50 font-normal font-sans block">
                  Ponte en contacto
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-white font-sans">
                  Hablemos de tu próximo proyecto.
                </h2>
              </div>

            {/* Medio: Estudio digital online | Email | Connect */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2">
              {/* 1. Estudio digital online */}
              <div className="space-y-1.5">
                <p className="text-base sm:text-lg font-normal text-white font-sans">
                  Estudio digital online
                </p>
                <p className="text-xs text-white/60 font-light font-sans leading-relaxed">
                  Colaboración directa y remota · Valencia / Global
                </p>
              </div>

              {/* 2. Email */}
              <div className="space-y-1.5">
                <a
                  href="mailto:prologmac@gmail.com"
                  className="text-base sm:text-lg font-normal text-white hover:text-white/70 transition-colors font-sans block hover:underline"
                >
                  info@aartnow.es
                </a>
                <p className="text-xs text-white/60 font-light font-sans">
                  Respuesta en 24h laborables
                </p>
              </div>

              {/* 3. Connect */}
              <div className="space-y-1.5">
                <div className="flex flex-col gap-2 text-xs font-light font-sans uppercase tracking-wider">
                  <a
                    href="https://www.instagram.com/aaron_primdesign/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-white/60 transition-colors font-light"
                  >
                    Instagram ↗
                  </a>
                  <a
                    href="https://www.linkedin.com/in/aaron-almarche-457a6b55/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-white/60 transition-colors font-light"
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Debajo: Los 2 botones del menú */}
            <div className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
                {/* 1. Programar una llamada (Cal.com popup) */}
                <button
                  type="button"
                  data-cal-link="aaron-primo-jacnmp/15min"
                  data-cal-namespace="15min"
                  data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                  onMouseEnter={scheduleCall.onMouseEnter}
                  onMouseLeave={scheduleCall.onMouseLeave}
                  className="min-h-[64px] sm:min-h-[72px] px-6 py-4 bg-transparent hover:bg-[#FFFFFF] hover:text-black border border-white/30 hover:border-white rounded-[4px] flex items-center justify-center font-normal font-sans text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 text-center leading-snug cursor-pointer group"
                >
                  <span className="pointer-events-none select-none font-sans font-normal">{scheduleCall.displayText}</span>
                </button>

                {/* 2. Comenzar un proyecto */}
                <button
                  type="button"
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  onMouseEnter={startProject.onMouseEnter}
                  onMouseLeave={startProject.onMouseLeave}
                  className="min-h-[64px] sm:min-h-[72px] px-6 py-4 bg-transparent hover:bg-[#FFFFFF] hover:text-black border border-white/30 hover:border-white rounded-[4px] flex items-center justify-center font-normal font-sans text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 text-center leading-snug cursor-pointer group"
                >
                  <span className="pointer-events-none select-none font-sans font-normal">{startProject.displayText}</span>
                </button>
              </div>

              {/* Formulario Desplegable '¿Qué tipo de servicio necesitas?' */}
              {showProjectForm && (
                <div className="p-6 bg-black/80 border border-white/15 rounded-lg max-w-xl space-y-4 font-normal font-sans">
                  {formSubmitted ? (
                    <div className="p-6 bg-white/5 border border-[#FFFFFF] rounded text-center space-y-2">
                      <p className="text-[#FFFFFF] font-normal text-sm">{t.successTitle}</p>
                      <p className="text-xs text-white/60 font-light">{t.successDesc}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormSubmitted(false);
                          setShowProjectForm(false);
                        }}
                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white hover:text-black rounded text-xs uppercase font-normal cursor-pointer"
                      >
                        {t.closeFormBtn}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setFormSubmitted(true);
                      }}
                      className="space-y-4 font-normal"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60 font-normal uppercase">
                          {t.questionProject}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowProjectForm(false)}
                          className="text-[10px] text-white/40 hover:text-white uppercase font-normal cursor-pointer"
                        >
                          ✕ {t.closeFormBtn}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((type) => {
                          const isSelected = projectTypes.includes(type);
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => toggleProjectType(type)}
                              className={`px-3 py-1.5 rounded text-xs transition-all ${
                                isSelected
                                  ? 'bg-[#FFFFFF] text-black font-normal'
                                  : 'bg-white/5 text-white/60 border border-white/10 font-light'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder={t.nameLabel}
                        className="w-full bg-[#111111] border border-white/15 rounded px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#FFFFFF] font-normal"
                      />
                      <input
                        type="email"
                        required
                        placeholder={t.emailLabel}
                        className="w-full bg-[#111111] border border-white/15 rounded px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#FFFFFF] font-normal"
                      />
                      <textarea
                        rows={3}
                        placeholder={t.messageLabel}
                        className="w-full bg-[#111111] border border-white/15 rounded px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#FFFFFF] font-normal"
                      />

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#FFFFFF] text-black font-normal uppercase text-xs rounded hover:bg-white transition-colors cursor-pointer"
                      >
                        {t.submitBtn} →
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
