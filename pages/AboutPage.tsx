import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock data for timeline and exhibitions, using translations
  const timelineData = t('about.timeline') as unknown as { year: string; event: string }[];
  const exhibitionsData = t('about.exhibitions') as unknown as { name: string; location: string; date: string }[];
  const biographyText = t('about.biographyText') as string;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('https://picsum.photos/id/1025/1920/800')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center text-white p-4 z-10">
          <h1 className="text-5xl md:text-7xl font-heading font-bold">Melissa Pelussi</h1>
          <p className="mt-2 text-xl">{t('about.heroKnownAs')} "Meeh"</p>
          <p className="mt-1 text-lg">{t('about.heroLocation')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Biography Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">{t('about.biographyTitle')}</h2>
            <div className="prose lg:prose-lg max-w-none text-text-secondary space-y-4">
              {biographyText.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Artistic Statement */}
          <section className="mb-16 text-center bg-surface p-8 rounded-lg">
            <h3 className="text-2xl font-heading font-semibold text-primary mb-4">{t('about.statementTitle')}</h3>
            <p className="text-xl italic text-text-secondary">
              {t('about.statementText')}
            </p>
          </section>

          {/* Timeline Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-8">{t('about.journeyTitle')}</h2>
            <div className="relative border-l-2 border-secondary pl-8">
              {timelineData.map((item, index) => (
                <div key={index} className="mb-8 relative">
                  <div className="absolute -left-11 w-6 h-6 bg-secondary rounded-full border-4 border-white"></div>
                  <p className="font-bold text-lg text-primary">{item.year}</p>
                  <p className="text-text-secondary">{item.event}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Exhibitions Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">{t('about.exhibitionsTitle')}</h2>
            <div className="space-y-4">
              {exhibitionsData.map((exhibit, index) => (
                <div key={index} className="bg-surface p-4 rounded-md">
                  <p className="font-semibold text-text-primary">{exhibit.name}</p>
                  <p className="text-sm text-text-secondary">{exhibit.location} - <span className="italic">{exhibit.date}</span></p>
                </div>
              ))}
            </div>
          </section>
           {/* Call-to-action */}
           <section className="text-center">
               <Link to={ROUTES.CATALOG} className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-colors duration-300">
                    {t('about.viewArtwork')}
                </Link>
           </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
