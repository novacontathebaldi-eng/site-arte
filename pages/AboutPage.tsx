import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Esta é uma página placeholder para "Sobre a Artista".
// Ela será preenchida com o conteúdo completo em uma próxima etapa.
const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
        {t('about.title')}
      </h1>
      <div className="max-w-3xl mx-auto text-center text-text-secondary">
        <p>
          Conteúdo sobre a artista Melissa Pelussi será adicionado aqui em breve.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
