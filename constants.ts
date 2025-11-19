import { Language, NavLink, Product, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

export const NAV_LINKS: NavLink[] = [
  { href: '#paintings', labelKey: 'nav.paintings' },
  { href: '#jewelry', labelKey: 'nav.jewelry' },
  { href: '#digital-art', labelKey: 'nav.digitalArt' },
  { href: '#prints', labelKey: 'nav.prints' },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    nameKey: 'product.etherealReverie.name',
    categoryKey: 'product.categories.painting',
    price: 450,
    imageUrl: 'https://picsum.photos/seed/art1/600/800',
  },
  {
    id: '2',
    nameKey: 'product.lunarNecklace.name',
    categoryKey: 'product.categories.jewelry',
    price: 120,
    imageUrl: 'https://picsum.photos/seed/art2/600/800',
  },
  {
    id: '3',
    nameKey: 'product.enchantedForest.name',
    categoryKey: 'product.categories.digitalArt',
    price: 75,
    imageUrl: 'https://picsum.photos/seed/art3/600/800',
  },
  {
    id: '4',
    nameKey: 'product.urbanImpression.name',
    categoryKey: 'product.categories.print',
    price: 50,
    imageUrl: 'https://picsum.photos/seed/art4/600/800',
  },
   {
    id: '5',
    nameKey: 'product.abstractCosmos.name',
    categoryKey: 'product.categories.painting',
    price: 680,
    imageUrl: 'https://picsum.photos/seed/art5/600/800',
  },
  {
    id: '6',
    nameKey: 'product.sereneHorizon.name',
    categoryKey: 'product.categories.print',
    price: 45,
    imageUrl: 'https://picsum.photos/seed/art6/600/800',
  },
  {
    id: '7',
    nameKey: 'product.solarEarrings.name',
    categoryKey: 'product.categories.jewelry',
    price: 95,
    imageUrl: 'https://picsum.photos/seed/art7/600/800',
  },
  {
    id: '8',
    nameKey: 'product.digitalDreamscape.name',
    categoryKey: 'product.categories.digitalArt',
    price: 85,
    imageUrl: 'https://picsum.photos/seed/art8/600/800',
  },
];
