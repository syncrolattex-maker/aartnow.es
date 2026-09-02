import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const [cursorText, setCursorText] = useState<string>('');

  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);
  const currentMagneticTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!cursorRef.current) return;

    // 1. GSAP quickTo setup for Fast, Ultra-Responsive Tracking (0.08s speed)
    xTo.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.08, ease: "power2.out" });
    yTo.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.08, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (currentMagneticTarget.current) {
        // 2. Magnetic Pull & Snap to Center Calculations (Subtle Button Pull)
        const rect = currentMagneticTarget.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        // Move target element towards mouse
        gsap.to(currentMagneticTarget.current, {
          x: deltaX * 0.25,
          y: deltaY * 0.25,
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Snap Cursor smoothly toward magnetic center
        if (xTo.current && yTo.current) {
          xTo.current(centerX + deltaX * 0.25);
          yTo.current(centerY + deltaY * 0.25);
        }
      } else {
        // Standard Inertia Tracking
        if (xTo.current && yTo.current) {
          xTo.current(mouseX);
          yTo.current(mouseY);
        }
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for magnetic targets
      const magEl = target.closest('[data-magnetic="true"]') as HTMLElement;
      if (magEl && magEl !== currentMagneticTarget.current) {
        currentMagneticTarget.current = magEl;
      }

      // Check EXCLUSIVELY for Explicit Contextual Morphing Targets (data-cursor-text)
      const textEl = target.closest('[data-cursor-text]') as HTMLElement;

      if (textEl) {
        const text = textEl.getAttribute('data-cursor-text') || '';
        setCursorText(text);
      } else {
        setCursorText('');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle Magnetic Leave (Elastic Release)
      const magEl = target.closest('[data-magnetic="true"]') as HTMLElement;
      if (magEl && magEl === currentMagneticTarget.current) {
        gsap.to(magEl, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
          overwrite: "auto",
        });
        currentMagneticTarget.current = null;
      }

      const textEl = target.closest('[data-cursor-text]');
      if (!textEl) {
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // 3. GSAP Morphing Effect: No Distracting Oversized Circles
  useEffect(() => {
    if (!ballRef.current) return;

    if (cursorText) {
      // Morph ONLY to Compact Monospace Tag Badge when data-cursor-text exists
      gsap.to(ballRef.current, {
        width: 'auto',
        height: '26px',
        borderRadius: '5px',
        paddingLeft: '9px',
        paddingRight: '9px',
        scale: 1,
        duration: 0.12,
        ease: 'power2.out',
      });
    } else {
      // Sleek, Unobtrusive Base Rest Circle (10px x 10px) - No Enlargement
      gsap.to(ballRef.current, {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        paddingLeft: '0px',
        paddingRight: '0px',
        scale: 1,
        duration: 0.12,
        ease: 'power2.out',
      });
    }
  }, [cursorText]);

  return (
    <div 
      ref={cursorRef} 
      className="ll-cursor-main hidden lg:block"
    >
      <div 
        ref={ballRef}
        className="ll-cursor-ball shadow-xl overflow-hidden font-mono text-[9px] font-bold uppercase tracking-wider text-black whitespace-nowrap"
      >
        {cursorText && (
          <span ref={textRef} className="inline-block leading-none">
            [{cursorText}]
          </span>
        )}
      </div>
    </div>
  );
}
