import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export default function StickyBar() {
  const { lang, setLang, t } = useLanguage();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'val', label: 'VAL' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-3.5 bg-black/60 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/15 text-[11px] font-mono uppercase text-white/80 flex justify-between items-center pointer-events-auto shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      {/* Left Meta Info */}
      <div className="flex items-center gap-6">
        <span className="hidden md:inline-block text-white/50">{t.stickyFreaks}</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF1300] animate-pulse"></span>
          <span>{t.stickyBased}</span>
        </span>
      </div>

      {/* Center Live Clock */}
      <div className="hidden lg:flex items-center gap-2 text-white">
        <span className="text-[#FF1300] font-bold">[</span>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
        <span className="font-bold tracking-widest">{time || '14:22:00'}</span>
        <span className="text-[#FF1300] font-bold">]</span>
      </div>

      {/* Right Social & Trilingual Switcher */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4 text-white/60">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#FF1300] transition-colors">
            instagram ↗
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#FF1300] transition-colors">
            linkedin ↗
          </a>
        </div>

        {/* Trilingual Language Selector: [ ES / VAL / EN ] */}
        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
          {languages.map((item, idx) => (
            <div key={item.code} className="flex items-center gap-1">
              <button 
                data-magnetic="true"
                onClick={() => setLang(item.code)}
                className={`px-1 rounded transition-colors font-bold ${
                  lang === item.code ? 'text-[#FF1300]' : 'text-white/40 hover:text-white'
                }`}
              >
                {item.label}
              </button>
              {idx < languages.length - 1 && <span className="text-white/20">/</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
