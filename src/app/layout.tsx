import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Melissa Pelussi Art - Contemporary Artist',
    template: '%s | Melissa Pelussi Art'
  },
  description: 'Discover unique contemporary artworks by Melissa Pelussi (Meeh). Paintings, jewelry, and digital art from a Luxembourg-based artist.',
  keywords: ['Melissa Pelussi', 'Meeh', 'contemporary art', 'paintings', 'jewelry', 'digital art', 'Luxembourg artist'],
  authors: [{ name: 'Melissa Pelussi' }],
  creator: 'Melissa Pelussi',
  publisher: 'Melissa Pelussi Art',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pelussi.th3lab.me'),
  alternates: {
    canonical: '/',
    languages: {
      'fr': '/fr',
      'en': '/en',
      'de': '/de',
      'pt': '/pt',
    },
  },
  openGraph: {
    title: 'Melissa Pelussi Art - Contemporary Artist',
    description: 'Discover unique contemporary artworks by Melissa Pelussi (Meeh). Paintings, jewelry, and digital art from a Luxembourg-based artist.',
    url: 'https://pelussi.th3lab.me',
    siteName: 'Melissa Pelussi Art',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Melissa Pelussi Art',
      }
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melissa Pelussi Art',
    description: 'Contemporary artist based in Luxembourg',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="font-inter">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Layout>
                {children}
              </Layout>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}