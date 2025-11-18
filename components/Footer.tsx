
import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { InstagramIcon } from './icons';

interface FooterProps {
  onNavigate: (view: 'home' | 'catalog') => void;
}


const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setMessage('Subscribing...');
    
    // In a real-world application, you would call a secure backend endpoint (e.g., a Vercel Function)
    // that uses the BREVO_API_KEY to add the user to your mailing list.
    // Exposing BREVO_API_KEY on the client-side is a major security risk.
    //
    // Example backend call:
    // try {
    //   const response = await fetch('/api/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email }),
    //   });
    //   if (!response.ok) throw new Error('Subscription failed');
    //   setMessage('Thank you for subscribing!');
    //   setEmail('');
    // } catch (error) {
    //   setMessage('Something went wrong. Please try again.');
    // }

    // Simulate API call for this frontend-only project
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Simulating subscription for: ${email}`);
    setMessage(`Merci ! ${email} est abonné.`);
    setEmail('');

    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };


  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">Melissa Pelussi Art</h3>
            <p className="text-sm text-gray-300">{t('hero.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quicklinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="text-gray-300 hover:text-white transition-colors">{t('footer.about')}</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="text-gray-300 hover:text-white transition-colors">{t('footer.catalog')}</button></li>
              <li><button className="text-gray-300 hover:text-white transition-colors">{t('footer.contact')}</button></li>
              <li><button className="text-gray-300 hover:text-white transition-colors">{t('footer.policies')}</button></li>
            </ul>
          </div>
          <div>
             <h4 className="font-semibold mb-4">Follow Me</h4>
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <InstagramIcon className="w-6 h-6" />
             </a>
          </div>
           <div>
            <h4 className="font-semibold mb-4">{t('newsletter.title')}</h4>
             <p className="text-sm text-gray-300 mb-3">{t('newsletter.subtitle')}</p>
             <form onSubmit={handleSubscribe} className="flex">
                <input 
                    type="email" 
                    placeholder={t('newsletter.placeholder')} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-base-text rounded-l-md border-0 focus:ring-2 focus:ring-secondary" 
                />
                <button type="submit" className="bg-secondary text-primary px-4 py-2 rounded-r-md font-semibold hover:opacity-90">{t('newsletter.subscribe')}</button>
             </form>
             {message && <p className="text-sm text-green-300 mt-2 transition-opacity duration-300">{message}</p>}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>{t('footer.copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;