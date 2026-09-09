import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type PortfolioCategory = 'TODO' | 'BRANDING' | 'CARTELES' | 'COMMERCE' | 'CORPORATE' | 'LOGO';

export const PORTFOLIO_CATEGORIES: { id: PortfolioCategory; label: string }[] = [
  { id: 'TODO', label: 'TODO' },
  { id: 'BRANDING', label: 'BRANDING' },
  { id: 'CARTELES', label: 'CARTELES' },
  { id: 'COMMERCE', label: 'COMMERCE' },
  { id: 'CORPORATE', label: 'CORPORATE' },
  { id: 'LOGO', label: 'LOGO' },
];

interface PortfolioSubmenuProps {
  activeCategory: PortfolioCategory;
  onSelectCategory: (cat: PortfolioCategory) => void;
  isVisible: boolean;
  categoryCounts: Record<PortfolioCategory, number>;
}

export default function PortfolioSubmenu({
  activeCategory,
  onSelectCategory,
  isVisible,
  categoryCounts,
}: PortfolioSubmenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Escuchar si el menu hamburguesa esta abierto para no solapar
  useEffect(() => {
    const checkMenu = () => {
      setIsMenuOpen(document.body.getAttribute('data-menu-open') === 'true');
    };

    const observer = new MutationObserver(checkMenu);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-menu-open'] });
    return () => observer.disconnect();
  }, []);

  const shouldShow = isVisible && !isMenuOpen;

  const handleCategoryClick = (catId: PortfolioCategory) => {
    if (catId === activeCategory) return;
    onSelectCategory(catId);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 28, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          data-is-menu="true"
          className="fixed left-1/2 -translate-x-1/2 bottom-16 md:bottom-20 z-45 w-[calc(100vw-32px)] max-w-[660px] pointer-events-auto"
        >
          <div className="bg-black/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 rounded-full px-3 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.85),0_0_24px_rgba(255,255,255,0.06)] flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs font-sans font-normal uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black shadow-md scale-[1.02]'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[9px] md:text-[10px] px-1 py-0.2 rounded font-sans ${
                      isSelected ? 'text-black/70 bg-black/10 font-normal' : 'text-white/40 bg-white/5'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}