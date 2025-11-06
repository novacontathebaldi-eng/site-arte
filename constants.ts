import { Language } from './types';
import { FR, GB, DE, PT } from './components/icons/FlagIcons';
import React from 'react';

// Este arquivo guarda valores que não mudam (constantes) e que usamos em vários lugares do site.
// Organizar isso aqui evita repetição de código e facilita futuras manutenções.

// Define os idiomas disponíveis, associando o código ('fr', 'en') ao nome completo
// e ao componente do ícone da bandeira.
export const LANGUAGES: {
  code: Language;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  { code: 'fr', name: 'Français', icon: FR },
  { code: 'en', name: 'English', icon: GB },
  { code: 'de', name: 'Deutsch', icon: DE },
  { code: 'pt', name: 'Português', icon: PT },
];

// Define as rotas (URLs) do nosso site.
// Se precisarmos mudar a URL do catálogo de "/catalog" para "/catalogue",
// só precisamos alterar aqui, e todo o site será atualizado.
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: '/product', // A URL completa será /product/:slug
  ABOUT: '/about',
  CONTACT: '/contact',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
};