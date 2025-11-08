import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger an API call.
    // For now, we'll just simulate a success state.
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary text-center mb-12">{t('get_in_touch')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Form */}
        <div className="bg-surface p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif font-semibold text-primary mb-6">{t('contact_form_title')}</h2>
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-lg font-semibold text-primary">{t('contact_form_success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary">{t('full_name')}</label>
                <input type="text" id="name" required className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">{t('email_address')}</label>
                <input type="email" id="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"/>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-secondary">{t('subject')}</label>
                 <select id="subject" required className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary">
                    <option>Interest in artwork</option>
                    <option>Commission inquiry</option>
                    <option>Shipping question</option>
                    <option>General inquiry</option>
                 </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary">{t('message')}</label>
                <textarea id="message" rows={5} required className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300">
                  {t('send_message')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Info & FAQ */}
        <div>
          <div className=" p-8 rounded-lg">
            <h3 className="text-2xl font-serif font-semibold text-primary mb-6">{t('contact_info')}</h3>
            <div className="space-y-4 text-text-secondary">
                <p><strong>Email:</strong> info@melissapelussi.art</p>
                <p><strong>Studio:</strong> Luxembourg (visits by appointment only)</p>
            </div>

            <div className="mt-10">
                <h3 className="text-2xl font-serif font-semibold text-primary mb-6">{t('faq_title')}</h3>
                <div className="space-y-4">
                    <details className="p-4 border border-border-color rounded-lg cursor-pointer">
                        <summary className="font-semibold text-text-primary">{t('faq_q1')}</summary>
                        <p className="mt-2 text-sm text-text-secondary">Shipping times vary by location. Luxembourg: 1-2 days, EU: 3-7 days, Brazil: 10-20 days.</p>
                    </details>
                    <details className="p-4 border border-border-color rounded-lg cursor-pointer">
                        <summary className="font-semibold text-text-primary">{t('faq_q2')}</summary>
                        <p className="mt-2 text-sm text-text-secondary">Yes, Melissa accepts commissions. Please use the contact form with the "Commission inquiry" subject to discuss your project.</p>
                    </details>
                    <details className="p-4 border border-border-color rounded-lg cursor-pointer">
                        <summary className="font-semibold text-text-primary">{t('faq_q5')}</summary>
                        <p className="mt-2 text-sm text-text-secondary">Yes, we ship worldwide. Shipping costs will be calculated at checkout based on your location and the artwork's weight.</p>
                    </details>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
