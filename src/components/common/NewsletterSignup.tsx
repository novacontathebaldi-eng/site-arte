'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { addNewsletterSubscriber } from '@/lib/api/newsletter';

export const NewsletterSignup: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t('newsletter-email-required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('newsletter-email-invalid'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addNewsletterSubscriber(email);
      toast.success(t('newsletter-subscribe-success'));
      setEmail('');
    } catch (error: any) {
      if (error.message === 'already-subscribed') {
        toast.info(t('newsletter-already-subscribed'));
      } else {
        toast.error(t('newsletter-subscribe-error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('enter-your-email')}
            className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-gray-900 font-medium rounded-md hover:bg-secondary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">{t('subscribe')}</span>
            </>
          )}
        </button>
      </div>
      
      <p className="mt-3 text-sm text-gray-400 text-center">
        {t('newsletter-privacy-note')}
      </p>
    </form>
  );
};