
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
    const { t } = useTranslation();

  return (
    <footer className="bg-surface text-text-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-primary mb-4">Meeh</h3>
            <p className="text-sm">Contemporary art by Melissa Pelussi, Luxembourg.</p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">{t('home')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog" className="hover:text-secondary transition-colors">{t('catalog')}</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">{t('about')}</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link to="/shipping" className="hover:text-secondary transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Follow Me</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com/meehpelussi" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.316 1.363.364 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.316-2.427.364-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.316-1.363-.364-2.427C2.013 15.315 2 14.974 2 12.257v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.316 2.427-.364C8.901 2.013 9.24 2 11.877 2h.438zM12 6.261a5.739 5.739 0 100 11.478 5.739 5.739 0 000-11.478zm0 9.57a3.831 3.831 0 110-7.662 3.831 3.831 0 010 7.662zM16.85 6.42a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Melissa Pelussi. All Rights Reserved.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
             <span>💳</span>
             <span> débit</span>
             <span>- PIX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
