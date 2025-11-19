import React from 'react';
import { useI18n } from '../hooks/useI18n';

const Hero: React.FC = () => {
  const { t } = useI18n();

  return (
    <section className="relative h-[60vh] min-h-[400px] max-h-[700px] w-full flex items-center justify-center text-center text-white bg-stone-800">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://picsum.photos/seed/hero/1800/1200')" }}
      ></div>
      <div className="relative z-10 p-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold drop-shadow-md">
          {t('hero.title')}
        </h1>
        <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto drop-shadow">
          {t('hero.subtitle')}
        </p>
        <a
          href="#products"
          className="mt-8 inline-block bg-white text-stone-900 font-semibold py-3 px-8 rounded-sm hover:bg-stone-200 transition-transform transform hover:scale-105"
        >
          {t('hero.button')}
        </a>
      </div>
    </section>
  );
};

export default Hero;
