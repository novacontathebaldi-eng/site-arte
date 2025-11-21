import React, { useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import Button from './common/Button';

const Hero: React.FC = () => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrolled = window.scrollY;
      const height = window.innerHeight;
      
      // Calculate progress from 0 to 1 as we scroll through the first viewport height
      // The hero is 200vh tall, so we animate based on the first 100vh of scroll
      const progress = Math.min(Math.max(scrolled / (height * 0.8), 0), 1);
      
      containerRef.current.style.setProperty('--scroll', progress.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[200vh] w-full bg-brand-gray-900"
      style={{ '--scroll': 0 } as React.CSSProperties}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Dynamic Background: Scales and Blurs */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-linear"
          style={{ 
            backgroundImage: "url('https://picsum.photos/seed/hero/1920/1080')",
            transform: 'scale(calc(1 + (var(--scroll) * 0.2)))', // Scales 1 -> 1.2
            filter: 'blur(calc(var(--scroll) * 10px)) brightness(calc(1 - (var(--scroll) * 0.3)))' // Blurs 0 -> 10px, Darkens
          }}
        ></div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-brand-gray-900/90 z-0"></div>

        {/* Main Text Content: Fades Out & Scales Down */}
        <div 
          className="relative z-10 text-center px-4 transition-all duration-300 ease-out"
          style={{
            opacity: 'calc(1 - (var(--scroll) * 1.5))', // Fades out quickly
            transform: 'scale(calc(1 - (var(--scroll) * 0.2))) translateY(calc(var(--scroll) * -50px))', // Shrinks and moves up
            pointerEvents: 'var(--scroll) > 0.5 ? "none" : "auto"' as any
          }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold text-brand-white drop-shadow-2xl mb-6 tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-brand-white max-w-2xl mx-auto mb-10 font-medium drop-shadow-xl shadow-black">
            {t('hero.subtitle')}
          </p>
          <Button
            as="a"
            href="#products"
            variant="primary"
            size="lg"
            className="bg-brand-gold text-brand-black hover:bg-brand-white hover:text-brand-black border-none font-bold shadow-lg"
          >
            {t('hero.button')}
          </Button>
        </div>

        {/* Featured "Takeover" Component */}
        {/* Starts lower and smaller, moves to center and scales up as text fades out */}
        <div 
          className="absolute z-20 w-full max-w-5xl px-4 flex items-center justify-center pointer-events-none"
          style={{
            opacity: 'calc((var(--scroll) - 0.3) * 2)', // Starts fading in after 30% scroll
            transform: `
              translateY(calc(100px - (var(--scroll) * 100px))) 
              scale(calc(0.8 + (var(--scroll) * 0.2)))
            `,
          }}
        >
           <div className="bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl w-full transform transition-transform hover:scale-[1.01] duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1 space-y-4 text-left">
                      <span className="inline-block px-3 py-1 bg-brand-gold text-brand-black text-xs font-bold tracking-wider uppercase rounded-full">
                        Featured Masterpiece
                      </span>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Ethereal Reverie</h2>
                      <p className="text-white/80 text-sm md:text-base leading-relaxed">
                        Experience the depth of emotion in this exclusive oil on canvas piece. 
                        A journey through abstract dreamscapes that challenges perception.
                      </p>
                      <div className="pt-4 pointer-events-auto">
                        <Button as="a" href="#/product/1" variant="tertiary" className="text-white border-white/30 hover:bg-white/10">
                          View Artwork
                        </Button>
                      </div>
                  </div>
                  <div className="order-1 md:order-2 h-64 md:h-80 rounded-lg overflow-hidden shadow-inner relative group">
                     <img 
                        src="https://picsum.photos/seed/art1/800/600" 
                        alt="Featured Art" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
              </div>
           </div>
        </div>

        {/* Scroll Indicator */}
        <div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce"
            style={{ opacity: 'calc(1 - (var(--scroll) * 3))' }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
            </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;