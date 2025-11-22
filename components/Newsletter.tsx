import React from 'react';
import { useI18n } from '../hooks/useI18n';
import Input from './common/Input';
import Button from './common/Button';

const Newsletter: React.FC = () => {
    const { t } = useI18n();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle submission logic
    };

    return (
        <div className="bg-brand-black/5 dark:bg-white/5">
            <div className="mx-auto max-w-4xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-serif font-bold text-brand-black dark:text-brand-white">{t('newsletter.title')}</h2>
                <p className="mt-2 text-lg text-brand-black/70 dark:text-brand-white/70">{t('newsletter.subtitle')}</p>
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
                    <Input
                        type="email"
                        id="newsletter-email"
                        placeholder={t('newsletter.placeholder')}
                        className="w-full sm:w-auto flex-grow"
                        required
                    />
                    <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                        {t('newsletter.button')}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Newsletter;
