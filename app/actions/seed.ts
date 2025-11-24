
'use server';

import { adminDb } from '../../lib/firebase/admin';
import { ProductCategory, Product } from '../../types/product';

// --- DATA GENERATORS ---

// Helper to create multilingual descriptions
const createTranslations = (titleBase: string, type: 'painting' | 'sculpture' | 'jewelry' | 'digital' | 'print' | 'photo') => {
  const descriptions = {
    painting: {
      fr: "Une exploration magistrale de la texture et de la couleur. Cette pièce unique capture l'essence de l'émotion brute à travers des coups de pinceau dynamiques.",
      en: "A masterful exploration of texture and color. This unique piece captures the essence of raw emotion through dynamic brushstrokes.",
      pt: "Uma exploração magistral de textura e cor. Esta peça única captura a essência da emoção crua através de pinceladas dinâmicas.",
      de: "Eine meisterhafte Erforschung von Textur und Farbe. Dieses einzigartige Stück fängt die Essenz roher Emotionen durch dynamische Pinselstriche ein."
    },
    sculpture: {
      fr: "Forme tridimensionnelle qui défie la gravité. Bronze coulé à la main avec une patine unique qui évolue avec la lumière.",
      en: "Three-dimensional form that defies gravity. Hand-cast bronze with a unique patina that evolves with the light.",
      pt: "Forma tridimensional que desafia a gravidade. Bronze fundido à mão com uma pátina única que evolui com a luz.",
      de: "Dreidimensionale Form, die der Schwerkraft trotzt. Handgegossene Bronze mit einer einzigartigen Patina, die sich mit dem Licht entwickelt."
    },
    jewelry: {
      fr: "Plus qu'un accessoire, une sculpture portable. Or 18 carats et pierres précieuses éthiques, forgés pour l'élégance moderne.",
      en: "More than an accessory, a wearable sculpture. 18k gold and ethical gemstones, forged for modern elegance.",
      pt: "Mais que um acessório, uma escultura vestível. Ouro 18k e pedras preciosas éticas, forjados para a elegância moderna.",
      de: "Mehr als ein Accessoire, eine tragbare Skulptur. 18 Karat Gold und ethische Edelsteine, geschmiedet für moderne Eleganz."
    },
    digital: {
      fr: "L'intersection du code et de l'âme. Œuvre générative unique livrée sous forme de NFT avec cadre numérique haute résolution.",
      en: "The intersection of code and soul. Unique generative artwork delivered as NFT with high-resolution digital frame.",
      pt: "A interseção do código e da alma. Obra generativa única entregue como NFT com quadro digital de alta resolução.",
      de: "Die Schnittstelle von Code und Seele. Einzigartiges generatives Kunstwerk, geliefert als NFT mit hochauflösendem digitalen Rahmen."
    },
    print: {
      fr: "Édition limitée de qualité muséale. Papier Fine Art 310g texturé, signé et numéroté par l'artiste.",
      en: "Museum-quality limited edition. Textured 310g Fine Art paper, signed and numbered by the artist.",
      pt: "Edição limitada de qualidade de museu. Papel Fine Art 310g texturizado, assinado e numerado pelo artista.",
      de: "Limitierte Auflage in Museumsqualität. Texturiertes 310g Fine Art Papier, signiert und nummeriert vom Künstler."
    },
    photo: {
      fr: "Un instant suspendu dans le temps. Tirage argentique sur papier baryté, capturant la lumière avec une profondeur exceptionnelle.",
      en: "A moment suspended in time. Silver gelatin print on baryta paper, capturing light with exceptional depth.",
      pt: "Um momento suspenso no tempo. Impressão em gelatina de prata sobre papel barita, capturando a luz com profundidade excepcional.",
      de: "Ein in der Zeit schwebender Moment. Silbergelatineabzug auf Barytpapier, der das Licht mit außergewöhnlicher Tiefe einfängt."
    }
  };

  const materials = {
    painting: { fr: "Acrylique sur Toile", en: "Acrylic on Canvas", pt: "Acrílico sobre Tela", de: "Acryl auf Leinwand" },
    sculpture: { fr: "Bronze & Marbre", en: "Bronze & Marble", pt: "Bronze e Mármore", de: "Bronze & Marmor" },
    jewelry: { fr: "Or 18k", en: "18k Gold", pt: "Ouro 18k", de: "18k Gold" },
    digital: { fr: "NFT / Digital", en: "NFT / Digital", pt: "NFT / Digital", de: "NFT / Digital" },
    print: { fr: "Papier Fine Art", en: "Fine Art Paper", pt: "Papel Fine Art", de: "Fine Art Papier" },
    photo: { fr: "Tirage Argentique", en: "Silver Print", pt: "Impressão Prata", de: "Silberdruck" }
  };

  const d = descriptions[type];
  const m = materials[type];

  return {
    fr: { title: titleBase, description: d.fr, material_label: m.fr },
    en: { title: `${titleBase} (EN)`, description: d.en, material_label: m.en },
    pt: { title: `${titleBase} (PT)`, description: d.pt, material_label: m.pt },
    de: { title: `${titleBase} (DE)`, description: d.de, material_label: m.de }
  };
};

// --- DATA SETS ---

// Images curated from Unsplash
const IMAGES = {
  paintings: [
    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1549490349874-1f9d34246505?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1583093155700-112347b74f33?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1576449195610-c4e9f7830d1d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1545518516-3a6d71343729?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000",
  ],
  sculptures: [
    "https://images.unsplash.com/photo-1554188248-986b2837489b?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1561058267-d83b586111f2?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1549887552-93f8efb871a2?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1574921677332-9c986c57f97e?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1573048861914-725d2b7d5a52?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1627885023240-5e363690623d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1614728853913-a4a8c9557df6?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1611082576203-b097b6154331?auto=format&fit=crop&q=80&w=1000",
  ],
  jewelry: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1617038224538-276365d63b65?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000",
  ],
  digital: [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1614730341194-75c60740a070?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000",
  ],
  prints: [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1580136608260-4eb11f4b64fe?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1577720580479-7d839d829c73?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1507643179173-617860136674?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1551732998-957e29725f4f?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1000",
  ],
  photo: [
    "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1497215842964-222b4bef9726?auto=format&fit=crop&q=80&w=1000",
  ]
};

const ITEMS_PER_CATEGORY = 8;

const generateProducts = (): Partial<Product>[] => {
  const products: Partial<Product>[] = [];
  
  // --- PAINTINGS ---
  const paintingTitles = ["Eclat d'Or", "Midnight Blue", "Crimson Soul", "Urban Decay", "Forest Whisper", "Geometric Dreams", "Silent Chaos", "Liquid Fire"];
  IMAGES.paintings.forEach((img, i) => {
    products.push({
      category: ProductCategory.PAINTINGS,
      price: 2500 + (i * 350),
      images: [{ id: `p-${i}`, url: img, alt: "Painting", isThumbnail: true }],
      translations: createTranslations(paintingTitles[i] || `Abstract Composition #${i+1}`, 'painting'),
      stock: 1,
      dimensions: { height: 100 + i*10, width: 80 + i*5, depth: 4, unit: 'cm' },
      weight: 3.5,
      year: 2023 + (i%2),
      framing: i % 2 === 0 ? 'framed' : 'unframed',
      tags: ['abstract', 'canvas', 'original']
    });
  });

  // --- SCULPTURES ---
  const sculptureTitles = ["Bronze Flow", "Marble Essence", "Iron Will", "Glass Spirit", "Twisted Fate", "Modern Totem", "Silent Guardian", "Eternal Knot"];
  IMAGES.sculptures.forEach((img, i) => {
    products.push({
      category: ProductCategory.SCULPTURES,
      price: 4500 + (i * 500),
      images: [{ id: `s-${i}`, url: img, alt: "Sculpture", isThumbnail: true }],
      translations: createTranslations(sculptureTitles[i] || `Sculpture #${i+1}`, 'sculpture'),
      stock: 1,
      dimensions: { height: 40 + i*5, width: 20, depth: 20, unit: 'cm' },
      weight: 12.5,
      year: 2024,
      framing: 'not_applicable',
      tags: ['bronze', '3d', 'modern']
    });
  });

  // --- JEWELRY ---
  const jewelryTitles = ["Golden Tear", "Diamond Dust", "Silver Moon", "Ruby Heart", "Emerald City", "Sapphire Sky", "Opal Dream", "Pearl Essence"];
  IMAGES.jewelry.forEach((img, i) => {
    products.push({
      category: ProductCategory.JEWELRY,
      price: 850 + (i * 150),
      images: [{ id: `j-${i}`, url: img, alt: "Jewelry", isThumbnail: true }],
      translations: createTranslations(jewelryTitles[i] || `Jewel #${i+1}`, 'jewelry'),
      stock: 1,
      dimensions: { height: 5, width: 5, depth: 1, unit: 'cm' },
      weight: 0.1,
      year: 2024,
      framing: 'not_applicable',
      tags: ['gold', 'wearable', 'luxury']
    });
  });

  // --- DIGITAL ---
  const digitalTitles = ["Neurosis #1", "Cyber Soul", "Glitch Perfect", "Neon Void", "Data Stream", "Virtual Reality", "Binary Love", "Pixel Dust"];
  IMAGES.digital.forEach((img, i) => {
    products.push({
      category: ProductCategory.DIGITAL,
      price: 1200 + (i * 200),
      images: [{ id: `d-${i}`, url: img, alt: "Digital Art", isThumbnail: true }],
      translations: createTranslations(digitalTitles[i] || `Digital #${i+1}`, 'digital'),
      stock: 10, // Editions
      dimensions: { height: 0, width: 0, depth: 0, unit: 'cm' },
      weight: 0,
      year: 2025,
      framing: 'not_applicable',
      tags: ['nft', 'crypto', 'digital']
    });
  });

  // --- PRINTS ---
  const printTitles = ["Urban Silence (Print)", "Blue Mood (Print)", "Golden Era (Print)", "Abstract #4 (Print)", "Nature #1 (Print)", "City Lights (Print)", "Ocean View (Print)", "Mountain High (Print)"];
  IMAGES.prints.forEach((img, i) => {
    products.push({
      category: ProductCategory.PRINTS,
      price: 150 + (i * 25),
      images: [{ id: `pr-${i}`, url: img, alt: "Print", isThumbnail: true }],
      translations: createTranslations(printTitles[i] || `Print #${i+1}`, 'print'),
      stock: 50,
      dimensions: { height: 60, width: 40, depth: 0, unit: 'cm' },
      weight: 0.5,
      year: 2024,
      framing: 'unframed',
      tags: ['print', 'affordable', 'paper']
    });
  });

  // --- PHOTOGRAPHY ---
  const photoTitles = ["Lost Highway", "Silent Peak", "Urban Geometry", "Natural Light", "Human Soul", "Macro World", "Night Sky", "Desert Wind"];
  IMAGES.photo.forEach((img, i) => {
    products.push({
      category: ProductCategory.PHOTOGRAPHY,
      price: 450 + (i * 50),
      images: [{ id: `ph-${i}`, url: img, alt: "Photography", isThumbnail: true }],
      translations: createTranslations(photoTitles[i] || `Photo #${i+1}`, 'photo'),
      stock: 10,
      dimensions: { height: 50, width: 70, depth: 0, unit: 'cm' },
      weight: 1,
      year: 2023,
      framing: 'framed',
      tags: ['photo', 'bw', 'landscape']
    });
  });

  return products;
};

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

    // 2. Gerar Dados
    const productsToSeed = generateProducts();
    
    // 3. Inserir em Lotes (Batches de 500 max)
    const batch = adminDb.batch();
    
    productsToSeed.forEach((product, index) => {
      const docRef = adminDb.collection('products').doc();
      
      // Slug Generation
      const slug = product.translations!.en.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      batch.set(docRef, {
        ...product,
        sku: `${product.category?.toString().substring(0,3).toUpperCase()}-${1000 + index}`,
        slug: slug,
        status: 'active',
        featured: index % 5 === 0, // 20% featured
        authenticity_certificate: true,
        signature: true,
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
        message: clearExisting ? `Banco reiniciado com ${addedCount} produtos.` : `${addedCount} novos produtos adicionados.` 
    };

  } catch (error: any) {
    console.error("Seed Error:", error);
    return { success: false, count: 0, message: error.message };
  }
}
