'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">MP</span>
              </div>
              <span className="font-heading text-xl font-semibold">Melissa Pelussi</span>
            </div>
            <p className="text-gray-400 text-sm">
              Contemporary artist based in Luxembourg, creating unique artworks that bridge traditional and digital media.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/meehpelussi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{t('quick-links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('catalog')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{t('customer-service')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('shipping-policy')}
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('return-policy')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('privacy-policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('terms-of-service')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{t('contact-info')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href="mailto:otavio.thebaldi@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  otavio.thebaldi@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Luxembourg</span>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{t('payment-methods')}</h4>
              <div className="flex space-x-2">
                <div className="bg-white rounded p-1">
                  <span className="text-xs text-gray-600 font-medium">VISA</span>
                </div>
                <div className="bg-white rounded p-1">
                  <span className="text-xs text-gray-600 font-medium">MC</span>
                </div>
                <div className="bg-white rounded p-1">
                  <span className="text-xs text-gray-600 font-medium">PayPal</span>
                </div>
                <div className="bg-white rounded p-1">
                  <span className="text-xs text-gray-600 font-medium">PIX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto">
            <h3 className="font-heading text-lg font-semibold mb-4 text-center">
              {t('newsletter-signup')}
            </h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Subscribe to get updates on new artworks and exclusive offers.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder={t('email')}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-secondary text-gray-900 rounded-md font-medium hover:bg-secondary-dark transition-colors"
              >
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Melissa Pelussi Art. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};