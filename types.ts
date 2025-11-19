export type Language = 'fr' | 'en' | 'de' | 'pt';

export interface LanguageOption {
  code: Language;
  name: string;
}

export interface Product {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  imageUrl: string;
}

export interface NavLink {
  href: string;
  labelKey: string;
}
