import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { db } from './firebase';
import { ProductDocument, LanguageCode, ProductImage, SettingsDocument } from '../firebase-types';

// Omit fields that will be generated automatically
type SeedProductData = Omit<ProductDocument, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'views'>;

/**
 * Helper function to generate a consistent, random-looking image set based on the product SKU.
 * This ensures each product gets a unique image, but the image remains the same if you re-seed the database.
 * @param sku The product's Stock Keeping Unit.
 * @param altText A simple alt text for the image.
 * @returns An array containing a single ProductImage object.
 */
const createImageSet = (sku: string, altText: string): ProductImage[] => {
  return [{
    url: `https://picsum.photos/seed/${sku}/800/1000`,
    thumbnailUrl: `https://picsum.photos/seed/${sku}/200/250`,
    alt: altText,
    order: 0
  }];
};

const sampleProducts: SeedProductData[] = [
  // --- PAINTINGS ---
  {
    sku: 'PNT-001',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Ethereal Reverie', description: 'An abstract exploration of dreamscapes and fleeting memories, painted with oil on canvas.', materials: 'Oil on canvas' },
      [LanguageCode.FR]: { title: 'Rêverie Éthérée', description: 'Une exploration abstraite des paysages de rêve et des souvenirs éphémères, peinte à l\'huile sur toile.', materials: 'Huile sur toile' },
      [LanguageCode.DE]: { title: 'Ätherische Träumerei', description: 'Eine abstrakte Erforschung von Traumlandschaften und flüchtigen Erinnerungen, gemalt in Öl auf Leinwand.', materials: 'Öl auf Leinwand' },
      [LanguageCode.PT]: { title: 'Devaneio Etéreo', description: 'Uma exploração abstrata de paisagens oníricas e memórias fugazes, pintada com óleo sobre tela.', materials: 'Óleo sobre tela' },
    },
    images: createImageSet('PNT-001', 'Abstract painting in blue and white tones'),
    price: { amount: 45000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 80, width: 60, depth: 4 },
    weight: 2.5,
    yearCreated: 2023,
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: true,
    tags: ['abstract', 'oil', 'canvas', 'dreamscape', 'blue'],
    keywords: ['ethereal', 'reverie', 'abstract', 'exploration', 'dreamscapes', 'fleeting', 'memories', 'painted', 'oil', 'canvas', 'blue', 'rêverie', 'éthérée', 'ätherische', 'träumerei', 'devaneio', 'etéreo'],
    featured: true, // FEATURED
  },
  {
    sku: 'PNT-004',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: "Ocean's Whisper", description: 'A large, serene seascape focusing on the texture of waves and the gradient of the sky.', materials: 'Oil on linen' },
      [LanguageCode.PT]: { title: "Sussurro do Oceano", description: 'Uma grande e serena paisagem marinha focada na textura das ondas e no gradiente do céu.', materials: 'Óleo sobre linho' },
    },
    images: createImageSet('PNT-004', 'Large serene seascape'),
    price: { amount: 250000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 120, width: 180, depth: 4 },
    weight: 8.0,
    yearCreated: 2024,
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: true,
    tags: ['seascape', 'ocean', 'minimalist', 'large-scale', 'oil'],
    keywords: ["ocean's", 'whisper', 'large', 'serene', 'seascape', 'texture', 'waves', 'gradient', 'sky', 'oil', 'linen', 'sussurro', 'oceano'],
    featured: true, // FEATURED
  },
  // --- JEWELRY ---
  {
    sku: 'JWL-002',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Stardust Earrings', description: 'Delicate sterling silver earrings embedded with tiny sapphires.', materials: 'Sterling Silver, Sapphires' },
      [LanguageCode.PT]: { title: 'Brincos de Poeira Estelar', description: 'Delicados brincos de prata esterlina com pequenas safiras incrustadas.', materials: 'Prata Esterlina, Safiras' },
    },
    images: createImageSet('JWL-002', 'Silver earrings with sapphires'),
    price: { amount: 18000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: 0.05,
    yearCreated: 2023,
    status: 'made-to-order',
    stock: 99,
    certificateOfAuthenticity: false,
    tags: ['earrings', 'silver', 'sapphire', 'delicate'],
    keywords: ['stardust', 'earrings', 'delicate', 'sterling', 'silver', 'embedded', 'tiny', 'sapphires', 'brincos', 'poeira', 'estelar'],
    featured: true, // FEATURED
  },
  // --- DIGITAL ART ---
  {
    sku: 'DGT-002',
    category: 'digital',
    translations: {
      [LanguageCode.EN]: { title: 'Cybernetic Bloom', description: 'A fusion of organic and mechanical elements, exploring the synergy between nature and technology.', materials: 'Digital 3D Render' },
      [LanguageCode.PT]: { title: 'Florescer Cibernético', description: 'Uma fusão de elementos orgânicos e mecânicos, explorando a sinergia entre natureza e tecnologia.', materials: 'Render 3D Digital' },
    },
    images: createImageSet('DGT-002', 'Futuristic digital art'),
    price: { amount: 9000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: null,
    yearCreated: 2024,
    status: 'available',
    stock: 99,
    certificateOfAuthenticity: false,
    tags: ['digital', 'sci-fi', 'cyberpunk', 'futuristic', '3d'],
    keywords: ['cybernetic', 'bloom', 'fusion', 'organic', 'mechanical', 'elements', 'synergy', 'nature', 'technology', '3d', 'render', 'florescer', 'cibernético'],
    featured: true, // FEATURED
  },
  // --- OTHER (NOT FEATURED) ---
  {
    sku: 'PNT-002',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Crimson Tide', description: 'A powerful abstract piece in acrylics, dominated by shades of red and gold.', materials: 'Acrylic on Canvas' },
      [LanguageCode.FR]: { title: 'Marée Cramoisie', description: 'Une œuvre abstraite puissante à l\'acrylique, dominée par des tons de rouge et d\'or.', materials: 'Acrylique sur Toile' },
    },
    images: createImageSet('PNT-002', 'Red and gold abstract painting'),
    price: { amount: 85000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 100, width: 100, depth: 5 },
    weight: 4.0,
    yearCreated: 2024,
    status: 'sold',
    stock: 0,
    certificateOfAuthenticity: true,
    tags: ['abstract', 'acrylic', 'red', 'gold', 'large'],
    keywords: ['crimson', 'tide', 'powerful', 'abstract', 'acrylics', 'red', 'gold', 'marée', 'cramoisie'],
    featured: false,
  },
  {
    sku: 'JWL-001',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Lunar Necklace', description: 'A handcrafted silver necklace with a moonstone centerpiece.', materials: 'Sterling Silver, Moonstone' },
    },
    images: createImageSet('JWL-001', 'Silver necklace with moonstone'),
    price: { amount: 12000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: 0.1,
    yearCreated: 2024,
    status: 'available',
    stock: 5,
    certificateOfAuthenticity: false,
    tags: ['jewelry', 'silver', 'moonstone', 'necklace'],
    keywords: ['lunar', 'necklace', 'handcrafted', 'silver', 'moonstone', 'centerpiece'],
    featured: false,
  },
  {
    sku: 'DGT-001',
    category: 'digital',
    translations: {
      [LanguageCode.EN]: { title: 'Enchanted Forest', description: 'A vibrant digital painting depicting a magical forest at twilight.', materials: 'Digital Painting' },
    },
    images: createImageSet('DGT-001', 'Digital art of magical forest'),
    price: { amount: 7500, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: null,
    yearCreated: 2023,
    status: 'available',
    stock: 99,
    certificateOfAuthenticity: false,
    tags: ['digital', 'forest', 'fantasy', 'vibrant'],
    keywords: ['enchanted', 'forest', 'vibrant', 'digital', 'painting', 'magical', 'twilight'],
    featured: false,
  },
   {
    sku: 'PRT-001',
    category: 'prints',
    translations: {
      [LanguageCode.EN]: { title: 'Urban Impression', description: 'A high-quality giclée print of an original cityscape painting.', materials: 'Giclée print on archival paper' },
    },
    images: createImageSet('PRT-001', 'Cityscape art print'),
    price: { amount: 5000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 40, width: 30, depth: 0 },
    weight: 0.2,
    yearCreated: 2022,
    status: 'available',
    stock: 20,
    certificateOfAuthenticity: false,
    tags: ['print', 'cityscape', 'urban', 'giclee'],
    keywords: ['urban', 'impression', 'high-quality', 'giclée', 'print', 'original', 'cityscape', 'painting', 'archival', 'paper'],
    featured: false,
  },
];

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // Seed products
    const productsCollection = collection(db, 'products');
    sampleProducts.forEach((product) => {
        const docRef = doc(productsCollection); // Auto-generate ID
        const dataWithTimestamps = {
            ...product,
            views: Math.floor(Math.random() * 500), // Add some random views
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: product.status !== 'sold' ? serverTimestamp() : null,
        };
        batch.set(docRef, dataWithTimestamps);
    });
    
    // Seed global settings
    const settingsRef = doc(db, 'settings', 'global');
    const settingsData: Omit<SettingsDocument, 'id'> = {
        siteTitle: 'Meeh - Art by Melissa Pelussi',
        maintenanceMode: false,
        contactEmail: 'hello@meeh.lu',
        socialLinks: {
            instagram: 'https://www.instagram.com/meeh.lu/',
            facebook: 'https://www.facebook.com/meeh.lu/',
        },
        shippingRegions: [
            { name: 'Luxembourg', countries: ['LU'], cost: 500 },
            { name: 'Europe Zone 1', countries: ['FR', 'DE', 'BE', 'NL'], cost: 1500 },
            { name: 'Europe Zone 2', countries: ['IT', 'ES', 'PT', 'AT', 'IE'], cost: 2000 },
            { name: 'Rest of World', countries: [], cost: 4500 }, // Empty means all others
        ]
    };
    batch.set(settingsRef, settingsData, { merge: true });

    await batch.commit();
    console.log(`Seeded ${sampleProducts.length} products and global settings.`);
};