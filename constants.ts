import { Language, NavLink, Product, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

// SIMPLIFIED: Replaced multiple category links with a single link to the full catalog.
export const NAV_LINKS: NavLink[] = [
  { href: '#/catalog', labelKey: 'nav.catalog' },
];

export const CATEGORIES = [
  { id: 'paintings', nameKey: 'product.categories.painting' },
  { id: 'jewelry', nameKey: 'product.categories.jewelry' },
  { id: 'digital', nameKey: 'product.categories.digitalArt' },
  { id: 'prints', nameKey: 'product.categories.print' },
];

export const STATUSES = [
  { id: 'available', nameKey: 'product.statuses.available' },
  { id: 'sold', nameKey: 'product.statuses.sold' },
  { id: 'made-to-order', nameKey: 'product.statuses.madeToOrder' },
];

// This is kept for now, but should be phased out as we move to Firestore data.
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
];