import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Accordion from '../components/Accordion';
import { useToast } from '../hooks/useToast';


const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqData = t('contact.faq') as unknown as { q: string, a: string }[];
  const subjectOptionsData = t('contact.subjectOptions') as unknown as Record<string, string>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // FIX: Use `currentTarget` which is correctly typed for the element the event handler is attached to.
    setFormData({ ...formData, [e.currentTarget.name]: e.currentTarget.value });
  };
  
  const isFormValid = formData.name.length > 1 && formData.email.includes('@') && formData.message.length > 19;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    console.log("Form data submitted:", formData);
    
    // Simulating API call
    setTimeout(() => {
        setIsSubmitting(false);
        showToast("Message sent successfully!", "success");
        setFormData({ name: '', email: '', subject: 'general', message: '' });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-12">
        {t('contact.title')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('contact.formTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="name" name="name" label={t('contact.fullNameLabel')} type="text" value={formData.name} onChange={handleChange} required />
            <Input id="email" name="email" label={t('contact.emailLabel')} type="email" value={formData.email} onChange={handleChange} required />
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t('contact.subjectLabel')}</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm">
                    {Object.entries(subjectOptionsData).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>
            <div>
                 <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('contact.messageLabel')}</label>
                 <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"></textarea>
            </div>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="w-full">
                {isSubmitting ? t('auth.loading') + '...' : t('contact.sendMessageButton')}
            </Button>
          </form>
        </div>
        
        {/* Right Column: Info & FAQ */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-primary mb-4">{t('contact.infoTitle')}</h3>
                <p className="font-semibold">{t('contact.artistName')}</p>
                <p className="text-sm text-text-secondary">{t('contact.artistDescription')}</p>
                <p className="text-sm text-text-secondary mt-2 italic">{t('contact.studioLocation')}</p>
            </div>
             <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-primary mb-4">{t('contact.faqTitle')}</h3>
                <div className="space-y-2">
                    {faqData.map((item, index) => (
                        <Accordion key={index} title={item.q}>
                            <p className="text-sm text-text-secondary">{item.a}</p>
                        </Accordion>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;