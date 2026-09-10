import { useState, useEffect } from 'react';
import Header from './components/Header';
import StickyBar from './components/StickyBar';
import Hero from './components/Hero';
import ProjectList from './components/ProjectList';
import About from './components/About';
import AdminLeads from './components/AdminLeads';
import BudgetEstimator from './components/BudgetEstimator';
import CaseStudyPage from './components/CaseStudyPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import SmoothScroll from './components/SmoothScroll';
import Cursor from './components/Cursor';
import GlobalAdaptiveHalftoneTrail from './components/GlobalAdaptiveHalftoneTrail';
import Scene from './components/WebGL/Scene';
import IsogramLoader from './components/IsogramLoader';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DitherTransitionProvider, useDitherTransition } from './context/DitherTransitionContext';
import { motion, AnimatePresence } from 'motion/react';

function StandaloneEstimatorPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFDF3] font-sans py-16 px-4 md:px-12 flex flex-col items-center justify-center relative selection:bg-white selection:text-black">
      <Scene />
      <div className="dither-bg-overlay" />
      <div className="grain-overlay" />
      <Cursor />
      <GlobalAdaptiveHalftoneTrail />
      <Header />

      <div className="w-full max-w-3xl mx-auto space-y-8 pt-16 z-10">
        <div className="text-center space-y-3 border-b border-white/15 pb-8">
          <span className="text-xs uppercase tracking-widest text-white/50 block font-normal">
            [ ESTIMADOR DE PRESUPUESTO ONLINE · AARTNOW.ES ]
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-sans tracking-tight">
            Calcula Tu Proyecto
          </h1>
          <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed font-light">
            Responde a unas breves preguntas sobre tus necesidades para obtener una estimación orientativa al instante.
          </p>
        </div>

        <BudgetEstimator />

        <div className="text-center pt-6">
          <a
            href="/"
            className="text-xs text-white/50 hover:text-white uppercase font-normal tracking-widest underline transition-colors"
          >
            ← Volver a la web principal (aartnow.es)
          </a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const { triggerTransition } = useDitherTransition();
  const [loading, setLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'admin' | 'presupuesto' | 'case' | 'contact' | 'about'>('home');
  const [caseSlug, setCaseSlug] = useState<string>('jack-and-ai');

  // Failsafe absoluto para que jamás se quede congelado en pantalla negra
  useEffect(() => {
    const failsafe = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(failsafe);
  }, []);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentRoute('admin');
      } else if (path.startsWith('/presupuesto') || path.startsWith('/estimador')) {
        setCurrentRoute('presupuesto');
      } else if (path.startsWith('/cases/')) {
        setCurrentRoute('case');
        setCaseSlug(path.replace('/cases/', '').replace(/\/$/, ''));
      } else if (path.startsWith('/contact') || path.startsWith('/contacto')) {
        setCurrentRoute('contact');
      } else if (path.startsWith('/about') || path.startsWith('/sobre-mi')) {
        setCurrentRoute('about');
      } else {
        setCurrentRoute('home');
      }
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  if (currentRoute === 'admin') {
    return <AdminLeads />;
  }

  if (currentRoute === 'presupuesto') {
    return <StandaloneEstimatorPage />;
  }

  if (currentRoute === 'case') {
    return <CaseStudyPage slug={caseSlug} />;
  }

  if (currentRoute === 'contact') {
    return <ContactPage />;
  }

  if (currentRoute === 'about') {
    return <AboutPage />;
  }

  return (
    <>
      {/* Monochrome Studio Preloader Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="ll-loader font-mono select-none"
          >
            <IsogramLoader onComplete={() => setLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <SmoothScroll>
        <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#000000] font-sans">
          <Scene />
          <div className="dither-bg-overlay" />
          <div className="grain-overlay" />
          <Cursor />
          <GlobalAdaptiveHalftoneTrail />
          <Header />
          <StickyBar />
          
          <main className="pb-16">
            <Hero />
            <ProjectList />
            <About />
            
            {/* Minimalist Studio Footer */}
            <footer className="py-28 px-6 md:px-16 bg-black/60 text-white flex flex-col justify-between border-t border-white/10">
              <div className="max-w-[1400px] w-full mx-auto space-y-16">
                
                {/* Large Text Reveal */}
                <div className="border-b border-white/10 pb-16 space-y-4">
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    {t.footerConnect}
                  </span>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerTransition(() => {
                        window.history.pushState({}, '', '/contact');
                        window.dispatchEvent(new Event('popstate'));
                        window.scrollTo(0, 0);
                      }, { x: e.clientX, y: e.clientY });
                    }}
                    className="block group cursor-pointer"
                  >
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tight text-white group-hover:text-white/80 transition-colors leading-none font-sans">
                      {t.footerTitle}<span className="text-white/40 group-hover:text-white">.</span>
                    </h2>
                  </a>
                </div>

                {/* Footer Meta Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-white/50 border-b border-white/10 pb-12">
                  <div>
                    <span className="text-white text-sm font-normal uppercase block mb-2 font-sans">{t.footerLocation}</span>
                    <p className="text-white font-normal">Online</p>
                    <p className="font-light">{t.footerAddress}</p>
                  </div>

                  <div>
                    <span className="text-white text-sm font-normal uppercase block mb-2 font-sans">{t.navContact}</span>
                    <a href="mailto:prologmac@gmail.com" className="text-white font-normal text-sm hover:underline block">info@aartnow.es</a>
                  </div>

                  <div>
                    <span className="text-white text-sm font-normal uppercase block mb-2 font-sans">Connect</span>
                    <div className="flex gap-4 font-light">
                      <a href="https://www.instagram.com/aaron_primdesign/" target="_blank" rel="noreferrer" className="hover:text-white/60 transition-colors">Instagram ↗</a>
                      <a href="https://www.linkedin.com/in/aaron-almarche-457a6b55/" target="_blank" rel="noreferrer" className="hover:text-white/60 transition-colors">LinkedIn ↗</a>
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
      <DitherTransitionProvider>
        <AppContent />
      </DitherTransitionProvider>
    </LanguageProvider>
  );
}
