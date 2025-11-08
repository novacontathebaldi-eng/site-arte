import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Accordion from '../components/Accordion';
import { useToast } from '../hooks/useToast';
import { XIcon } from '../components/ui/icons';


const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqData = t('contact.faq') as unknown as { q: string, a: string }[];
  const subjectOptionsData = t('contact.subjectOptions') as unknown as Record<string, string>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
    } else {
        setFile(null);
    }
  };

  const isFormValid = formData.name.length > 1 && formData.email.includes('@') && formData.message.length > 19;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    const formspreeEndpoint = 'https://formspree.io/f/mnnoerbr';

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('subject', formData.subject);
    data.append('message', formData.message);
    if (file) {
      data.append('upload', file);
    }

    try {
        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            showToast(t('contact.formSuccess'), 'success');
            setFormData({ name: '', email: '', subject: 'general', message: '' });
            setFile(null);
        } else {
            const data = await response.json();
            const errorMessage = data.errors?.map((error: any) => error.message).join(', ') || t('toast.error');
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error("Form submission error:", error);
        showToast(t('toast.error'), 'error');
    } finally {
        setIsSubmitting(false);
    }
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
            {/* FIX: Removed 'label' prop from Input components and added explicit <label> elements. */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.fullNameLabel')}</label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('contact.emailLabel')}</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
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
                 <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" minLength={20}></textarea>
            </div>
            <div>
                <label htmlFor="upload" className="block text-sm font-medium text-gray-700">
                    {t('contact.attachFileLabel')}
                </label>
                <div className="mt-1 flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                    <label htmlFor="upload" className="cursor-pointer bg-surface py-1 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                        {t('contact.chooseFileButton')}
                    </label>
                    <input id="upload" name="upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    {file && (
                        <div className="ml-3 flex items-center">
                            <span className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">{file.name}</span>
                            <button type="button" onClick={() => setFile(null)} className="ml-2 text-red-500 hover:text-red-700">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">{t('contact.fileUploadHint')}</p>
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
