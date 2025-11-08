import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock data for timeline, to be replaced by Firestore data
  const timelineEvents = [
    { year: 2015, event: "First solo exhibition" },
    { year: 2017, event: "Started working with digital mediums" },
    { year: 2019, event: "Featured in European Art Magazine" },
    { year: 2021, event: "Launched jewelry collection" },
    { year: 2023, event: "Opened studio in Luxembourg" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('https://picsum.photos/seed/meeh/1920/1080')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold">{t('artist_name')}</h1>
          <p className="mt-2 text-xl">({t('artist_known_as')})</p>
          <p className="mt-1 text-lg font-light">{t('artist_location')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Biography Section */}
          <section>
            <h2 className="text-4xl font-serif font-bold text-primary text-center mb-8">{t('biography_title')}</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed text-justify">
              <p>{t('temp_bio_1')}</p>
              <p>{t('temp_bio_2')}</p>
               <blockquote className="my-6 p-4 border-l-4 border-secondary bg-surface text-lg font-serif italic text-primary">
                "{t('artist_quote')}"
              </blockquote>
              <p>{t('temp_bio_3')}</p>
              <p>{t('temp_bio_4')}</p>
            </div>
          </section>

          {/* Artistic Statement Section */}
          <section className="mt-16">
            <h2 className="text-4xl font-serif font-bold text-primary text-center mb-8">{t('artistic_statement_title')}</h2>
            <p className="text-text-secondary leading-relaxed text-center italic">
              (Artist's personal statement about their work and vision will be displayed here, managed via the admin panel.)
            </p>
          </section>
          
          {/* Timeline Section */}
          <section className="mt-16">
            <h2 className="text-4xl font-serif font-bold text-primary text-center mb-12">{t('artistic_journey_title')}</h2>
            <div className="relative border-l-2 border-border-color ml-4">
              {timelineEvents.map((item, index) => (
                <div key={index} className="mb-8 ml-8">
                   <div className="absolute -left-[11px] h-5 w-5 rounded-full bg-secondary border-4 border-white"></div>
                  <p className="text-lg font-serif font-semibold text-primary">{item.year}</p>
                  <p className="text-text-secondary">{item.event}</p>
                </div>
              ))}
            </div>
          </section>

           {/* Call to Action */}
          <section className="mt-16 text-center">
            <Link
              to="/catalog"
              className="inline-block bg-primary text-white font-bold py-3 px-10 rounded-md hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              {t('view_my_artwork')}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
