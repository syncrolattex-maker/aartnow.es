import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import GlitchText from './GlitchText';
import PowerGlitchText from './PowerGlitchText';
import ServicesAccordion from './ServicesAccordion';

export default function About() {
  const { t } = useLanguage();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Websites']);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <section id="about" className="py-28 w-full bg-[#0A0A0A] border-b border-white/10 text-[#FFFDF3] font-sans overflow-hidden relative">
      {/* Full-width Services Section Header */}
      <div className="w-full px-6 md:px-12 lg:px-16 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-sans font-normal">
              {t.servicesTag}
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#FFFDF3] font-sans">
              <PowerGlitchText text={t.servicesTitle} as="h2" />
            </h2>
          </div>

          <span className="text-xs text-white/40 font-sans font-normal">
            {t.servicesCount}
          </span>
        </div>
      </div>

      {/* Full-width GSAP Interactive Accordion */}
      <ServicesAccordion />

      {/* Studio Contact Section */}
      <div id="contact" className="w-full px-6 md:px-12 lg:px-16 pt-24">
          <div className="bg-[#000000] text-[#FFFDF3] border border-white/20 rounded-none p-8 md:p-14 relative overflow-hidden shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/15 pb-8 gap-4">
              <div>
                <span className="text-xs font-sans uppercase tracking-widest text-white/50 font-normal block mb-2">
                  {t.contactTag}
                </span>
                <h3 className="text-3xl md:text-5xl font-normal uppercase tracking-tight text-white font-sans">
                  <GlitchText text={t.contactTitle} /> <span className="italic font-serif font-light text-white/60">{t.contactTitleAccent}</span>.
                </h3>
              </div>

              <div className="font-sans text-xs text-white/40 font-normal">
                {t.contactResponseTime}
              </div>
            </div>

            {formSubmitted ? (
              <div className="p-8 bg-[#111111] text-[#FFFDF3] border border-white/15 rounded-none text-center font-sans space-y-2">
                <p className="text-white font-normal text-lg">{t.successTitle}</p>
                <p className="text-xs text-white/60 font-light">{t.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-6">
                <div>
                  <p className="text-xs uppercase text-white/60 mb-3 font-normal">{t.questionProject}</p>
                  <div className="flex flex-wrap gap-2">
                    {[t.catBranding, t.catDesign, t.cat3D, t.catWebsites, t.catMarketing].map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <button
                          type="button"
                          key={type}
                          data-magnetic="true"
                          onClick={() => toggleType(type)}
                          className={`px-4 py-2 rounded-none text-xs font-normal transition-all ${
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
                    <label className="block text-xs uppercase text-white/60 font-normal mb-2">{t.nameLabel}</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-normal outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/60 font-normal mb-2">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-normal outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-white/60 font-normal mb-2">{t.messageLabel}</label>
                  <textarea 
                    rows={3} 
                    placeholder={t.messagePlaceholder}
                    className="w-full bg-[#111111] border border-white/15 rounded-none px-4 py-3 text-xs text-white font-normal outline-none focus:border-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-white/40 font-normal">{t.requiredFields}</span>
                  <button 
                    type="submit" 
                    data-magnetic="true"
                    className="px-8 py-3.5 bg-white text-black font-normal uppercase text-xs rounded-none hover:bg-neutral-300 transition-all cursor-pointer shadow-xl"
                  >
                    {t.submitBtn} →
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
    </section>
  );
}
