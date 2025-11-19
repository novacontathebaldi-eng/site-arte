import { collection, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { db } from './firebase';
import { ProductDocument, LanguageCode, ProductImage } from '../firebase-types';

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
    featured: true,
  },
  {
    sku: 'PNT-002',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Crimson Tide', description: 'A powerful abstract piece in acrylics, dominated by shades of red and gold.', materials: 'Acrylic on Canvas' },
      [LanguageCode.FR]: { title: 'Marée Cramoisie', description: 'Une œuvre abstraite puissante à l\'acrylique, dominée par des tons de rouge et d\'or.', materials: 'Acrylique sur Toile' },
      [LanguageCode.DE]: { title: 'Purpurrote Flut', description: 'Ein kraftvolles abstraktes Werk in Acryl, dominiert von Rot- und Goldtönen.', materials: 'Acryl auf Leinwand' },
      [LanguageCode.PT]: { title: 'Maré Carmesim', description: 'Uma poderosa peça abstrata em acrílico, dominada por tons de vermelho e ouro.', materials: 'Acrílico sobre Tela' },
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
    featured: true,
  },
   {
    sku: 'PNT-003',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Metropolis Glow', description: 'Vibrant cityscape at night, capturing the energy of urban life with bold, expressive strokes.', materials: 'Acrylic on wood panel' },
      [LanguageCode.PT]: { title: 'Brilho da Metrópole', description: 'Paisagem urbana vibrante à noite, capturando a energia da vida urbana com pinceladas ousadas e expressivas.', materials: 'Acrílico sobre painel de madeira' },
    },
    images: createImageSet('PNT-003', 'Vibrant cityscape painting'),
    price: { amount: 120000, currency: 'EUR', compareAtPrice: 150000 },
    dimensions: { height: 90, width: 120, depth: 3 },
    weight: 5.5,
    yearCreated: 2023,
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: true,
    tags: ['cityscape', 'urban', 'acrylic', 'night', 'vibrant'],
    featured: false,
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
    featured: true,
  },
  // --- JEWELRY ---
  {
    sku: 'JWL-001',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Lunar Necklace', description: 'A handcrafted silver necklace with a moonstone centerpiece.', materials: 'Sterling Silver, Moonstone' },
      [LanguageCode.FR]: { title: 'Collier Lunaire', description: 'Un collier en argent fait à la main avec une pierre de lune centrale.', materials: 'Argent sterling, Pierre de lune' },
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
    featured: false,
  },
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
    featured: true,
  },
   {
    sku: 'JWL-003',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Forest Guardian Ring', description: 'A unique, intricate silver ring with a central emerald, inspired by forest foliage.', materials: 'Sterling Silver, Emerald' },
      [LanguageCode.PT]: { title: 'Anel Guardião da Floresta', description: 'Um anel de prata único e intrincado com uma esmeralda central, inspirado na folhagem da floresta.', materials: 'Prata Esterlina, Esmeralda' },
    },
    images: createImageSet('JWL-003', 'Intricate silver ring with emerald'),
    price: { amount: 25000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: 0.08,
    yearCreated: 2024,
    status: 'available',
    stock: 1,
    certificateOfAuthenticity: false,
    tags: ['ring', 'jewelry', 'silver', 'emerald', 'unique'],
    featured: false,
  },
  // --- DIGITAL ART ---
  {
    sku: 'DGT-001',
    category: 'digital',
    translations: {
      [LanguageCode.EN]: { title: 'Enchanted Forest', description: 'A vibrant digital painting depicting a magical forest at twilight.', materials: 'Digital Painting' },
      [LanguageCode.PT]: { title: 'Floresta Encantada', description: 'Uma vibrante pintura digital retratando uma floresta mágica ao entardecer.', materials: 'Pintura Digital' },
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
    featured: false,
  },
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
    featured: true,
  },
    {
    sku: 'DGT-003',
    category: 'digital',
    translations: {
      [LanguageCode.EN]: { title: 'The Sunstone Oracle', description: 'Character concept art of a powerful sorceress wielding celestial magic.', materials: 'Digital Painting' },
      [LanguageCode.PT]: { title: 'O Oráculo da Pedra do Sol', description: 'Arte conceitual de personagem de uma poderosa feiticeira empunhando magia celestial.', materials: 'Pintura Digital' },
    },
    images: createImageSet('DGT-003', 'Fantasy character concept art'),
    price: { amount: 6500, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: null,
    yearCreated: 2022,
    status: 'available',
    stock: 99,
    certificateOfAuthenticity: false,
    tags: ['digital', 'fantasy', 'character', 'sorceress', 'magic'],
    featured: false,
  },
  // --- PRINTS ---
   {
    sku: 'PRT-001',
    category: 'prints',
    translations: {
      [LanguageCode.EN]: { title: 'Urban Impression', description: 'A high-quality giclée print of an original cityscape painting.', materials: 'Giclée print on archival paper' },
      [LanguageCode.PT]: { title: 'Impressão Urbana', description: 'Uma impressão giclée de alta qualidade de uma pintura original de paisagem urbana.', materials: 'Impressão giclée em papel de arquivo' },
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
    featured: false,
  },
  {
    sku: 'PRT-002',
    category: 'prints',
    translations: {
      [LanguageCode.EN]: { title: 'Wildflower Study', description: 'A detailed botanical illustration print, perfect for adding a touch of nature to any space.', materials: 'Fine art print on cotton paper' },
      [LanguageCode.PT]: { title: 'Estudo de Flores Silvestres', description: 'Uma impressão de ilustração botânica detalhada, perfeita para adicionar um toque de natureza a qualquer espaço.', materials: 'Impressão de belas artes em papel de algodão' },
    },
    images: createImageSet('PRT-002', 'Botanical illustration print'),
    price: { amount: 3500, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 30, width: 21, depth: 0 },
    weight: 0.1,
    yearCreated: 2023,
    status: 'available',
    stock: 50,
    certificateOfAuthenticity: false,
    tags: ['print', 'botanical', 'flowers', 'illustration', 'nature'],
    featured: false,
  },
  {
    sku: 'PRT-003',
    category: 'prints',
    translations: {
      [LanguageCode.EN]: { title: 'Cosmic Dance', description: 'A limited edition print of the "Ethereal Reverie" painting, signed by the artist.', materials: 'Limited Edition Giclée Print' },
      [LanguageCode.PT]: { title: 'Dança Cósmica', description: 'Uma impressão de edição limitada da pintura "Devaneio Etéreo", assinada pela artista.', materials: 'Impressão Giclée de Edição Limitada' },
    },
    images: createImageSet('PNT-001', 'Limited edition print of abstract painting'), // Use same seed as original for consistency
    price: { amount: 15000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 50, width: 40, depth: 0 },
    weight: 0.3,
    yearCreated: 2024,
    status: 'available',
    stock: 25,
    certificateOfAuthenticity: false,
    tags: ['print', 'limited-edition', 'abstract', 'giclee'],
    featured: false,
  },
  {
    sku: 'JWL-004',
    category: 'jewelry',
    translations: {
      [LanguageCode.EN]: { title: 'Molten Gold Bracelet', description: 'A bold, organic-shaped bracelet cast in bronze with gold plating.', materials: 'Gold-plated Bronze' },
      [LanguageCode.PT]: { title: 'Bracelete de Ouro Derretido', description: 'Um bracelete ousado, de formato orgânico, fundido em bronze com banho de ouro.', materials: 'Bronze banhado a ouro' },
    },
    images: createImageSet('JWL-004', 'Bold gold-plated bracelet'),
    price: { amount: 22000, currency: 'EUR', compareAtPrice: null },
    dimensions: null,
    weight: 0.15,
    yearCreated: 2024,
    status: 'available',
    stock: 3,
    certificateOfAuthenticity: false,
    tags: ['bracelet', 'jewelry', 'gold-plated', 'bold', 'organic'],
    featured: false,
  },
  {
    sku: 'PNT-005',
    category: 'paintings',
    translations: {
      [LanguageCode.EN]: { title: 'Silent Witness', description: 'A minimalist composition in mixed media, exploring texture and shadow.', materials: 'Mixed media on paper' },
      [LanguageCode.PT]: { title: 'Testemunha Silenciosa', description: 'Uma composição minimalista em técnica mista, explorando textura e sombra.', materials: 'Técnica mista sobre papel' },
    },
    images: createImageSet('PNT-005', 'Minimalist mixed media art'),
    price: { amount: 28000, currency: 'EUR', compareAtPrice: null },
    dimensions: { height: 40, width: 40, depth: 1 },
    weight: 0.5,
    yearCreated: 2022,
    status: 'sold',
    stock: 0,
    certificateOfAuthenticity: true,
    tags: ['minimalist', 'mixed-media', 'texture', 'black-and-white'],
    featured: false,
  }
];

export const seedDatabase = async () => {
    const productsCollection = collection(db, 'products');
    const batch = writeBatch(db);

    sampleProducts.forEach((product) => {
        const docRef = doc(productsCollection); // Auto-generate ID
        const dataWithTimestamps = {
            ...product,
            views: Math.floor(Math.random() * 500), // Add some random views
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Only set publishedAt for items that are not sold
            publishedAt: product.status !== 'sold' ? serverTimestamp() : null,
        };
        batch.set(docRef, dataWithTimestamps);
    });

    await batch.commit();
    console.log(`Seeded ${sampleProducts.length} products.`);
};