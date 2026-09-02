import { useState, useEffect } from 'react';
import Header from './components/Header';
import StickyBar from './components/StickyBar';
import Hero from './components/Hero';
import ProjectList from './components/ProjectList';
import About from './components/About';
import SmoothScroll from './components/SmoothScroll';
import Cursor from './components/Cursor';
import GlobalAdaptiveHalftoneTrail from './components/GlobalAdaptiveHalftoneTrail';
import Scene from './components/WebGL/Scene';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 8;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Preloader Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="ll-loader font-mono select-none"
          >
            <div className="flex items-center gap-1 text-2xl font-bold text-white">
              <span>{Math.min(progress, 100)}</span>
              <span className="text-[#FF1300]">%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SmoothScroll>
        <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FF1300] selection:text-[#000000] font-mono">
          <Scene />
          <div className="grain-overlay" />
          <Cursor />
          <GlobalAdaptiveHalftoneTrail />
          <Header />
          <StickyBar />
          
          <main className="pb-16">
            <Hero />
            <ProjectList />
            <About />
            
            {/* Footer */}
            <footer className="py-28 px-6 md:px-16 bg-[#000000] text-white flex flex-col justify-between border-t border-white/10">
              <div className="max-w-[1400px] w-full mx-auto space-y-16">
                
                {/* Large Text Reveal */}
                <div className="border-b border-white/10 pb-16 space-y-4">
                  <span className="text-xs uppercase tracking-widest text-[#FF1300]">
                    {t.footerConnect}
                  </span>
                  <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tight text-white leading-none font-sans">
                    {t.footerTitle}<span className="text-[#FF1300]">.</span>
                  </h2>
                </div>

                {/* Footer Meta Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-white/50 border-b border-white/10 pb-12">
                  <div>
                    <span className="text-white text-sm font-bold uppercase block mb-2 font-sans">{t.footerLocation}</span>
                    <p className="text-white font-bold">Online</p>
                    <p>{t.footerAddress}</p>
                  </div>

                  <div>
                    <span className="text-white text-sm font-bold uppercase block mb-2 font-sans">{t.navContact}</span>
                    <a href="mailto:info@aartnow.es" className="text-[#FF1300] font-bold text-sm hover:underline block">info@aartnow.es</a>
                  </div>

                  <div>
                    <span className="text-white text-sm font-bold uppercase block mb-2 font-sans">Connect</span>
                    <div className="flex gap-4">
                      <a href="#" className="hover:text-[#FF1300]">Instagram ↗</a>
                      <a href="#" className="hover:text-[#FF1300]">LinkedIn ↗</a>
                    </div>
                  </div>
                </div>

                {/* Copyright Line */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest">
                  <span>{t.footerRights}</span>
                  <span>{t.footerAgency}</span>
                </div>

              </div>
            </footer>
          </main>
        </div>
      </SmoothScroll>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
