import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '../../hooks/useI18n';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  robots?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://pelussi.th3lab.me/og-image.jpg', // Default image
  robots = 'index, follow'
}) => {
  const { language } = useI18n();
  
  const siteTitle = 'Meeh - Art by Melissa Pelussi';
  const metaTitle = title ? `${title} | Meeh` : siteTitle;
  const metaDescription = description || "Discover the unique art of Melissa Pelussi (Meeh). Paintings, jewelry, digital art, and prints from Luxembourg.";
  const url = typeof window !== 'undefined' ? window.location.href : 'https://pelussi.th3lab.me';

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Meeh - Art by Melissa Pelussi" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Hreflang alternates (Static for SPA, conceptually) */}
      <link rel="alternate" hrefLang="fr" href={`${url}?lang=fr`} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="de" href={`${url}?lang=de`} />
      <link rel="alternate" hrefLang="pt" href={`${url}?lang=pt`} />
    </Helmet>
  );
};

export default SEO;