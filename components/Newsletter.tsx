import React from 'react';
import { useI18n } from '../hooks/useI18n';
import Input from './common/Input';
import Button from './common/Button';
import Reveal from './common/Reveal';

const Newsletter: React.FC = () => {
    const { t } = useI18n();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle submission logic
    };

    return (
        <section className="min-h-[70vh] flex items-center justify-center bg-brand-black/5 dark:bg-brand-gray-800 snap-section">
            <div className="mx-auto max-w-4xl py-16 px-4 sm:px-6 lg:px-8 text-center">
                <Reveal animation="fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-black dark:text-brand-white mb-6">{t('newsletter.title')}</h2>
                </Reveal>
                
                <Reveal animation="fade-in-up" delay="200ms">
                    <p className="mt-2 text-lg md:text-xl text-brand-black/70 dark:text-brand-white/70 max-w-2xl mx-auto leading-relaxed">
                        {t('newsletter.subtitle')}
                    </p>
                </Reveal>

                <Reveal animation="scale-in" delay="400ms">
                    <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                        <div className="w-full sm:w-auto flex-grow">
                             <Input
                                type="email"
                                id="newsletter-email"
                                placeholder={t('newsletter.placeholder')}
                                className="w-full bg-white dark:bg-brand-gray-900 border-brand-black/10 dark:border-white/10 h-12 text-lg"
                                required
                            />
                        </div>
                        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto h-12 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                            {t('newsletter.button')}
                        </Button>
                    </form>
                </Reveal>
            </div>
        </section>
    );
};

export default Newsletter;