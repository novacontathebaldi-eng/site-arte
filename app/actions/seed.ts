'use server';

import { adminDb } from '../../lib/firebase/admin';
import { ProductCategory } from '../../types/product';

// Imagens de Arte Abstrata/Luxo do Unsplash
const ART_IMAGES = [
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1549490349874-1f9d34246505?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1507842217153-e51f40d0dc6b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1545518516-3a6d71343729?auto=format&fit=crop&q=80&w=1000", // Gold/Black
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1579783902614-a3fb39279623?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1573521193826-58c7dc2e13e3?auto=format&fit=crop&q=80&w=1000",
];

const PRODUCTS_SEED = [
  {
    sku: "ART-001",
    price: 3200,
    category: ProductCategory.PAINTINGS,
    images: [ART_IMAGES[0], ART_IMAGES[1]],
    translations: {
      fr: { title: "Éclats d'Or", description: "Une exploration de la lumière et de la texture, utilisant de la feuille d'or véritable sur une base acrylique sombre.", material_label: "Acrylique et Feuille d'Or" },
      en: { title: "Golden Shards", description: "An exploration of light and texture, using real gold leaf on a dark acrylic base.", material_label: "Acrylic & Gold Leaf" },
      pt: { title: "Fragmentos Dourados", description: "Uma exploração de luz e textura, usando folha de ouro real sobre uma base acrílica escura.", material_label: "Acrílico e Folha de Ouro" },
      de: { title: "Goldene Scherben", description: "Eine Erforschung von Licht und Textur unter Verwendung von echtem Blattgold auf dunkler Acrylbasis.", material_label: "Acryl & Blattgold" }
    },
    dimensions: { height: 120, width: 80, depth: 4, unit: 'cm' },
    status: 'active',
    featured: true,
    stock: 1
  },
  {
    sku: "ART-002",
    price: 1800,
    category: ProductCategory.PAINTINGS,
    images: [ART_IMAGES[1], ART_IMAGES[2]],
    translations: {
      fr: { title: "Mélancolie Bleue", description: "Des vagues d'émotion capturées dans des teintes de bleu profond et de gris.", material_label: "Huile sur Toile" },
      en: { title: "Blue Melancholy", description: "Waves of emotion captured in hues of deep blue and grey.", material_label: "Oil on Canvas" },
      pt: { title: "Melancolia Azul", description: "Ondas de emoção capturadas em tons de azul profundo e cinza.", material_label: "Óleo sobre Tela" },
      de: { title: "Blaue Melancholie", description: "Wellen der Emotion, eingefangen in tiefblauen und grauen Tönen.", material_label: "Öl auf Leinwand" }
    },
    dimensions: { height: 100, width: 100, depth: 3, unit: 'cm' },
    status: 'active',
    featured: false,
    stock: 1
  },
  {
    sku: "SCULP-001",
    price: 4500,
    category: ProductCategory.SCULPTURES,
    images: [ART_IMAGES[2], ART_IMAGES[3]],
    translations: {
      fr: { title: "Forme Éthérée", description: "Sculpture abstraite en bronze représentant le mouvement de l'âme.", material_label: "Bronze" },
      en: { title: "Ethereal Form", description: "Abstract bronze sculpture representing the movement of the soul.", material_label: "Bronze" },
      pt: { title: "Forma Etérea", description: "Escultura abstrata em bronze representando o movimento da alma.", material_label: "Bronze" },
      de: { title: "Ätherische Form", description: "Abstrakte Bronzeskulptur, die die Bewegung der Seele darstellt.", material_label: "Bronze" }
    },
    dimensions: { height: 45, width: 20, depth: 20, unit: 'cm' },
    status: 'active',
    featured: true,
    stock: 1
  },
  {
    sku: "PRINT-005",
    price: 250,
    category: ProductCategory.PRINTS,
    images: [ART_IMAGES[3]],
    translations: {
      fr: { title: "Chaos Organisé (Print)", description: "Impression giclée de haute qualité sur papier d'art, signée et numérotée.", material_label: "Papier Fine Art" },
      en: { title: "Organized Chaos (Print)", description: "High quality giclée print on fine art paper, signed and numbered.", material_label: "Fine Art Paper" },
      pt: { title: "Caos Organizado (Print)", description: "Impressão giclée de alta qualidade em papel fine art, assinada e numerada.", material_label: "Papel Fine Art" },
      de: { title: "Organisiertes Chaos (Druck)", description: "Hochwertiger Giclée-Druck auf Fine Art Papier, signiert und nummeriert.", material_label: "Fine Art Papier" }
    },
    dimensions: { height: 60, width: 40, depth: 0, unit: 'cm' },
    status: 'active',
    featured: false,
    stock: 50
  },
  {
    sku: "DIG-001",
    price: 1500,
    category: ProductCategory.DIGITAL,
    images: [ART_IMAGES[4]],
    translations: {
      fr: { title: "Nevrose Numérique #1", description: "NFT exclusif avec fichier source haute résolution inclus.", material_label: "NFT / Digital" },
      en: { title: "Digital Neurosis #1", description: "Exclusive NFT with high resolution source file included.", material_label: "NFT / Digital" },
      pt: { title: "Neurose Digital #1", description: "NFT exclusivo com arquivo fonte de alta resolução incluído.", material_label: "NFT / Digital" },
      de: { title: "Digitale Neurose #1", description: "Exklusives NFT mit hochauflösender Quelldatei enthalten.", material_label: "NFT / Digital" }
    },
    dimensions: { height: 0, width: 0, depth: 0, unit: 'cm' },
    status: 'active',
    featured: false,
    stock: 1
  },
  {
    sku: "ART-003",
    price: 5200,
    category: ProductCategory.PAINTINGS,
    images: [ART_IMAGES[5]],
    translations: {
      fr: { title: "Rouge Passion", description: "Une œuvre vibrante et énergique dominée par des rouges intenses.", material_label: "Acrylique sur Toile" },
      en: { title: "Passion Red", description: "A vibrant and energetic work dominated by intense reds.", material_label: "Acrylic on Canvas" },
      pt: { title: "Vermelho Paixão", description: "Uma obra vibrante e energética dominada por vermelhos intensos.", material_label: "Acrílico sobre Tela" },
      de: { title: "Leidenschaftsrot", description: "Ein lebendiges und energiegeladenes Werk, dominiert von intensiven Rottönen.", material_label: "Acryl auf Leinwand" }
    },
    dimensions: { height: 150, width: 120, depth: 4, unit: 'cm' },
    status: 'active',
    featured: true,
    stock: 1
  },
  {
    sku: "JEW-001",
    price: 890,
    category: ProductCategory.JEWELRY,
    images: [ART_IMAGES[6]],
    translations: {
      fr: { title: "Pendentif Abstrait", description: "Pièce unique en or et résine, inspirée par les formes naturelles.", material_label: "Or 18k & Résine" },
      en: { title: "Abstract Pendant", description: "Unique piece in gold and resin, inspired by natural forms.", material_label: "18k Gold & Resin" },
      pt: { title: "Pingente Abstrato", description: "Peça única em ouro e resina, inspirada em formas naturais.", material_label: "Ouro 18k e Resina" },
      de: { title: "Abstrakter Anhänger", description: "Einzelstück aus Gold und Harz, inspiriert von natürlichen Formen.", material_label: "18k Gold & Harz" }
    },
    dimensions: { height: 5, width: 3, depth: 1, unit: 'cm' },
    status: 'active',
    featured: false,
    stock: 1
  },
  {
    sku: "ART-004",
    price: 2100,
    category: ProductCategory.PAINTINGS,
    images: [ART_IMAGES[7]],
    translations: {
      fr: { title: "Silence Urbain", description: "Interprétation abstraite d'un paysage urbain sous la pluie.", material_label: "Technique Mixte" },
      en: { title: "Urban Silence", description: "Abstract interpretation of an urban landscape in the rain.", material_label: "Mixed Media" },
      pt: { title: "Silêncio Urbano", description: "Interpretação abstrata de uma paisagem urbana sob a chuva.", material_label: "Técnica Mista" },
      de: { title: "Urbane Stille", description: "Abstrakte Interpretation einer Stadtlandschaft im Regen.", material_label: "Mischtechnik" }
    },
    dimensions: { height: 80, width: 120, depth: 4, unit: 'cm' },
    status: 'active',
    featured: false,
    stock: 1
  }
];

export async function seedDatabase(clearExisting: boolean = false): Promise<{ success: boolean, count: number, message: string }> {
  try {
    let addedCount = 0;

    // 1. Limpar banco existente (Opcional)
    if (clearExisting) {
      const snapshot = await adminDb.collection('products').get();
      if (snapshot.size > 0) {
          const batch = adminDb.batch();
          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
      }
    }

    // 2. Adicionar Produtos
    const batch = adminDb.batch();
    
    PRODUCTS_SEED.forEach((product, index) => {
      const docRef = adminDb.collection('products').doc();
      
      // Formata imagens para o novo padrão { id, url, alt, isThumbnail }
      const formattedImages = product.images.map((url, i) => ({
          id: `seed-img-${index}-${i}`,
          url: url,
          alt: product.translations.en.title,
          isThumbnail: i === 0
      }));

      // Gera slug
      const slug = product.translations.en.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      batch.set(docRef, {
        ...product,
        slug,
        images: formattedImages,
        weight: 2.5, // default
        year: 2024,
        framing: 'unframed',
        authenticity_certificate: true,
        signature: true,
        tags: ['abstract', 'art', 'contemporary', 'seed'],
        displayOrder: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      addedCount++;
    });

    await batch.commit();

    return { 
        success: true, 
        count: addedCount, 
        message: clearExisting ? "Banco limpo e populado com sucesso." : "Novos produtos adicionados." 
    };

  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, count: 0, message: error.message };
  }
}