import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const blur = useTransform(scrollYProgress, [0, 1], ["0px", "10px"]);

  return (
    <div ref={containerRef} className="h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 w-full h-full z-0"
        style={{ y, scale, filter: `blur(${blur})` }}
      >
        {/* Using a high quality placeholder abstract art with eager loading */}
        <img 
            src="https://user-gen-media-assets.s3.amazonaws.com/gemini_images/8faf1f51-ea46-4fff-a971-7c27a89fb94a.png" 
            alt="Art Background" 
            className="w-full h-full object-cover"
            loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-primary" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center px-6"
        style={{ opacity }}
      >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <h2 className="text-accent text-sm md:text-base tracking-[0.3em] uppercase mb-4">
                {t('hero.subtitle')}
            </h2>
        </motion.div>
        
        <motion.h1 
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 font-bold tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
        >
            {t('hero.title')}
        </motion.h1>

        <motion.button
            className="px-8 py-4 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300 uppercase tracking-widest text-sm rounded-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onClick={() => {
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
        >
            {t('hero.cta')}
        </motion.button>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] tracking-widest uppercase">{t('hero.scroll')}</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </div>
  );
};
