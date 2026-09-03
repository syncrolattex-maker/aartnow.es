import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import GlitchText from './GlitchText';
import PowerGlitchText from './PowerGlitchText';

export default function About() {
  const { t } = useLanguage();
  const [openService, setOpenService] = useState<number | null>(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Websites']);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const services = [
    {
      id: 0,
      code: '(001)',
      num: '01',
      title: t.s01Title,
      description: t.s01Desc,
      capabilities: ['Brand Strategy', 'Visual Identity', 'Tone of Voice', 'Design Systems', 'Packaging & Print']
    },
    {
      id: 1,
      code: '(002)',
      num: '02',
      title: t.s02Title,
      description: t.s02Desc,
      capabilities: ['UX / UI Architecture', 'Product Design', 'Design Systems', 'Interactive Mockups', 'Design Tokens']
    },
    {
      id: 2,
      code: '(003)',
      num: '03',
      title: t.s03Title,
      description: t.s03Desc,
      capabilities: ['WebGL & Shader Shaders', 'Three.js Motion', '3D Asset Modeling', 'Interactive Scenes', 'Real-Time Graphics']
    },
    {
      id: 3,
      code: '(004)',
      num: '04',
      title: t.s04Title,
      description: t.s04Desc,
      capabilities: ['Creative Frontend', 'React / Next.js', 'Headless CMS', 'Performance Audit', 'Shopify E-Commerce']
    },
    {
      id: 4,
      code: '(005)',
      num: '05',
      title: t.s05Title,
      description: t.s05Desc,
      capabilities: ['Digital Strategy', 'Social Content', 'Performance Campaigns', 'Growth Marketing', 'Analytics & SEO']
    }
  ];

  const toggleService = (id: number) => {
    setOpenService(openService === id ? null : id);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <section id="about" className="py-32 px-6 md:px-16 bg-[#0A0A0A] border-b border-white/10 text-[#FFFDF3] font-mono">
      <div className="max-w-[1400px] mx-auto space-y-28">
        
        {/* Minimalist Studio Full-Width Accordion Services Section */}
        <div className="space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono font-bold">
                {t.servicesTag}
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#FFFDF3] font-sans">
                <PowerGlitchText text={t.servicesTitle} as="h2" />
              </h2>
            </div>

            <span className="text-xs text-white/40 font-mono font-bold">
              {t.servicesCount}
            </span>
          </div>

          {/* Accordion Steps Container */}
          <div className="border-t border-white/15 border-solid flex flex-col">
            {services.map((s) => {
              const isOpen = openService === s.id;

              return (
                <div 
                  key={s.id}
                  className="border-b border-white/15 border-solid transition-colors bg-black/40 hover:bg-white/[0.02]"
                >
                  {/* Step Header Button */}
                  <button 
                    onClick={() => toggleService(s.id)}
                    data-magnetic="true"
                    className="w-full py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left cursor-pointer group px-2"
                  >
                    <div className="flex items-center gap-6 md:gap-12">
                      <span className="text-sm md:text-base text-white/40 font-bold">
                        {s.code}
                      </span>
                      <h3 className="text-2xl md:text-4xl font-black uppercase text-[#FFFDF3] font-sans tracking-tight group-hover:text-white/70 transition-colors">
                        <GlitchText text={s.title} />
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-2xl md:text-4xl font-mono font-black text-white/30 group-hover:text-white transition-colors">
                        [{s.num}]
                      </span>
                      <span className="text-xl text-white font-bold">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {/* Expandable Content Area */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden bg-[#121212] border-t border-white/10"
                      >
                        <div className="p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          
                          {/* Left Column */}
                          <div className="lg:col-span-7 space-y-6">
                            <div className="space-y-2">
                              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                                [{s.num} / FREELANCE CAPABILITIES]
                              </span>
                              <h4 className="text-2xl md:text-3xl font-black uppercase text-[#FFFDF3] font-sans">
                                <GlitchText text={s.title} />
                              </h4>
                            </div>

                            <p className="text-xs text-white/70 leading-relaxed max-w-2xl text-justify font-mono">
                              {s.description}
                            </p>
                          </div>

                          {/* Right Column: Deliverables Checklist */}
                          <div className="lg:col-span-5 bg-[#000000] border border-white/15 p-6 md:p-8 space-y-6 rounded-none shadow-2xl">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                                {t.deliverablesLabel}
                              </span>
                              <span className="text-2xl font-black text-white font-mono">
                                <GlitchText text={`[${s.num}]`} />
                              </span>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {s.capabilities.map((cap, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs text-white/80 font-mono py-1.5 border-b border-white/5 last:border-0 hover:text-white transition-colors">
                                  <span className="text-white/40 font-bold">›</span>
                                  <GlitchText text={cap} />
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

        </div>

        {/* Studio Contact Banner (Monochrome Pitch Black #000000 Container) */}
        <div id="contact" className="pt-12">
          <div className="bg-[#000000] text-[#FFFDF3] border border-white/20 rounded-none p-8 md:p-14 relative overflow-hidden shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/15 pb-8 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold block mb-2">
                  {t.contactTag}
                </span>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white font-sans">
                  <GlitchText text={t.contactTitle} /> <span className="italic font-serif font-light text-white/60">{t.contactTitleAccent}</span>.
                </h3>
              </div>

              <div className="font-mono text-xs text-white/40 font-bold">
                {t.contactResponseTime}
              </div>
            </div>

            {formSubmitted ? (
              <div className="p-8 bg-[#111111] text-[#FFFDF3] border border-white/15 rounded-none text-center font-mono space-y-2">
                <p className="text-white font-bold text-lg">{t.successTitle}</p>
                <p className="text-xs text-white/60">{t.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-6">
                <div>
                  <p className="text-xs uppercase text-white/60 mb-3 font-black">{t.questionProject}</p>
                  <div className="flex flex-wrap gap-2">
                    {['Branding', 'Diseño', '3D', 'Websites', 'Marketing'].map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <button
                          type="button"
                          key={type}
                          data-magnetic="true"
                          onClick={() => toggleType(type)}
                          className={`px-4 py-2 rounded-none text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-white text-black' 
                              : 'bg-white/5 text-white/70 border border-white/15 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-white/60 font-bold mb-2">{t.nameLabel}</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-bold outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/60 font-bold mb-2">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-bold outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-white/60 font-bold mb-2">{t.messageLabel}</label>
                  <textarea 
                    rows={3} 
                    placeholder={t.messagePlaceholder}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-bold outline-none focus:border-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-white/40 font-bold">{t.requiredFields}</span>
                  <button 
                    type="submit" 
                    data-magnetic="true"
                    className="px-8 py-3.5 bg-white text-black font-black uppercase text-xs rounded-none hover:bg-neutral-300 transition-all cursor-pointer shadow-xl"
                  >
                    {t.submitBtn} →
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
