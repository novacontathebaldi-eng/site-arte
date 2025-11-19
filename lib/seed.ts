import { collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ProductDocument, LanguageCode } from '../firebase-types';

// Omit fields that will be generated automatically
type SeedProductData = Omit<ProductDocument, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'views'>;

const sampleProducts: SeedProductData[] = [
  {
    sku: 'PNT-001',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Ethereal Reverie', description: 'An abstract exploration of dreamscapes and fleeting memories, painted with oil on canvas.', materials: 'Oil on canvas' },
      [LanguageCode.FR]: { title: 'Rêverie Éthérée', description: 'Une exploration abstraite des paysages de rêve et des souvenirs éphémères, peinte à l\'huile sur toile.', materials: 'Huile sur toile' },
      [LanguageCode.DE]: { title: 'Ätherische Träumerei', description: 'Eine abstrakte Erforschung von Traumlandschaften und flüchtigen Erinnerungen, gemalt in Öl auf Leinwand.', materials: 'Öl auf Leinwand' },
      [LanguageCode.PT]: { title: 'Devaneio Etéreo', description: 'Uma exploração abstrata de paisagens oníricas e memórias fugazes, pintada com óleo sobre tela.', materials: 'Óleo sobre tela' },
    },
    images: [{ url: 'https://picsum.photos/seed/pnt001/800/1000', thumbnailUrl: 'https://picsum.photos/seed/pnt001/200/250', alt: 'Abstract painting', order: 0 }],
    price: { amount: 45000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 80, width: 60, depth: 4 },
    weight: 2.5,
    yearCreated: 2023,
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: true,
    tags: ['abstract', 'oil', 'canvas', 'dreamscape', 'blue'],
    featured: true,
  },
  {
    sku: 'JWL-001',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Lunar Necklace', description: 'A handcrafted silver necklace with a moonstone centerpiece.', materials: 'Sterling Silver, Moonstone' },
      [LanguageCode.FR]: { title: 'Collier Lunaire', description: 'Un collier en argent fait à la main avec une pierre de lune centrale.', materials: 'Argent sterling, Pierre de lune' },
    },
    images: [{ url: 'https://picsum.photos/seed/jwl001/800/1000', thumbnailUrl: 'https://picsum.photos/seed/jwl001/200/250', alt: 'Silver necklace', order: 0 }],
    price: { amount: 12000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: 0.1,
    yearCreated: 2024,
    status: 'available',
    stock: 5,
    certificateOfAuthenticity: false,
    tags: ['jewelry', 'silver', 'moonstone', 'necklace'],
    featured: false,
  },
  {
    sku: 'DGT-001',
    category: 'digital',
    translations: {
      [LanguageCode.EN]: { title: 'Enchanted Forest', description: 'A vibrant digital painting depicting a magical forest at twilight.', materials: 'Digital Painting' },
      [LanguageCode.PT]: { title: 'Floresta Encantada', description: 'Uma vibrante pintura digital retratando uma floresta mágica ao entardecer.', materials: 'Pintura Digital' },
    },
    images: [{ url: 'https://picsum.photos/seed/dgt001/800/1000', thumbnailUrl: 'https://picsum.photos/seed/dgt001/200/250', alt: 'Digital art of forest', order: 0 }],
    price: { amount: 7500, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: null,
    yearCreated: 2023,
    status: 'available',
    stock: 99,
    certificateOfAuthenticity: false,
    tags: ['digital', 'forest', 'fantasy', 'vibrant'],
    featured: true,
  },
   {
    sku: 'PRT-001',
    category: 'prints',
    translations: {
      [LanguageCode.EN]: { title: 'Urban Impression', description: 'A high-quality giclée print of an original cityscape painting.', materials: 'Giclée print on archival paper' },
    },
    images: [{ url: 'https://picsum.photos/seed/prt001/800/1000', thumbnailUrl: 'https://picsum.photos/seed/prt001/200/250', alt: 'Cityscape print', order: 0 }],
    price: { amount: 5000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 40, width: 30, depth: 0 },
    weight: 0.2,
    yearCreated: 2022,
    status: 'available',
    stock: 20,
    certificateOfAuthenticity: false,
    tags: ['print', 'cityscape', 'urban', 'giclee'],
    featured: false,
  },
  {
    sku: 'PNT-002',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Crimson Tide', description: 'A powerful abstract piece in acrylics, dominated by shades of red and gold.', materials: 'Acrylic on Canvas' },
    },
    images: [{ url: 'https://picsum.photos/seed/pnt002/800/1000', thumbnailUrl: 'https://picsum.photos/seed/pnt002/200/250', alt: 'Red abstract painting', order: 0 }],
    price: { amount: 85000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 100, width: 100, depth: 5 },
    weight: 4.0,
    yearCreated: 2024,
    status: 'sold',
    stock: 0,
    certificateOfAuthenticity: true,
    tags: ['abstract', 'acrylic', 'red', 'gold', 'large'],
    featured: true,
  },
];

export const seedDatabase = async () => {
    const productsCollection = collection(db, 'products');
    const batch = writeBatch(db);

    sampleProducts.forEach((product) => {
        const docRef = collection(productsCollection).doc(); // Auto-generate ID
        const dataWithTimestamps = {
            ...product,
            views: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: product.status === 'available' ? serverTimestamp() : null,
        };
        batch.set(docRef, dataWithTimestamps);
    });

    await batch.commit();
    console.log(`Seeded ${sampleProducts.length} products.`);
};
