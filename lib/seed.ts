import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number): number => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const getRandomBool = (): boolean => Math.random() > 0.5;

const titles = {
    fr: ["L'Aube Dorée", "Rêves d'Azur", "Murmure Écarlate", "Forêt d'Émeraude", "Danse Céleste", "Soleil de Minuit", "Océan de Corail", "Sérénité Urbaine", "Mélodie du Désert", "Écho Lunaire"],
    en: ["Golden Dawn", "Azure Dreams", "Scarlet Whisper", "Emerald Forest", "Celestial Dance", "Midnight Sun", "Coral Ocean", "Urban Serenity", "Desert Melody", "Lunar Echo"],
    de: ["Goldene Morgenröte", "Azurblaue Träume", "Scharlachrotes Flüstern", "Smaragdwald", "Himmlischer Tanz", "Mitternachtssonne", "Korallenmeer", "Urbane Gelassenheit", "Wüstenmelodie", "Mond-Echo"],
    pt: ["Alvorada Dourada", "Sonhos de Azul", "Sussurro Escarlate", "Floresta Esmeralda", "Dança Celestial", "Sol da Meia-Noite", "Oceano de Coral", "Serenidade Urbana", "Melodia do Deserto", "Eco Lunar"]
};

const descriptions = {
    fr: "Une œuvre captivante qui explore l'interaction entre la lumière et l'ombre, évoquant des émotions profondes.",
    en: "A captivating piece that explores the interplay of light and shadow, evoking deep emotions.",
    de: "Ein fesselndes Werk, das das Zusammenspiel von Licht und Schatten erforscht und tiefe Emotionen hervorruft.",
    pt: "Uma peça cativante que explora a interação entre luz e sombra, evocando emoções profundas."
};

const materials = {
    fr: "Acrylique sur toile, vernis brillant",
    en: "Acrylic on canvas, gloss varnish",
    de: "Acryl auf Leinwand, glänzender Lack",
    pt: "Acrílico sobre tela, verniz brilhante"
};

const categories: Product['category'][] = ['paintings', 'jewelry', 'digital', 'prints'];
const statuses: Product['status'][] = ['available', 'sold', 'made-to-order'];

const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];
    for (let i = 0; i < count; i++) {
        const id = `prod_${new Date().getTime()}_${i}`;
        const category = getRandomElement(categories);
        const titleIndex = i % titles.fr.length;

        const product: Product = {
            id,
            sku: `MP-${getRandomInt(1000, 9999)}`,
            category,
            translations: {
                fr: { title: titles.fr[titleIndex], description: descriptions.fr, materials: materials.fr },
                en: { title: titles.en[titleIndex], description: descriptions.en, materials: materials.en },
                de: { title: titles.de[titleIndex], description: descriptions.de, materials: materials.de },
                pt: { title: titles.pt[titleIndex], description: descriptions.pt, materials: materials.pt }
            },
            images: Array.from({ length: getRandomInt(2, 4) }, (_, j) => ({
                url: `https://picsum.photos/seed/${id}_${j}/800/800`,
                thumbnail: `https://picsum.photos/seed/${id}_${j}/400/400`,
                alt: `${titles.en[titleIndex]} - view ${j + 1}`,
                order: j
            })),
            price: {
                amount: getRandomFloat(200, 3500),
                currency: 'EUR'
            },
            dimensions: {
                height: getRandomInt(30, 150),
                width: getRandomInt(30, 150),
                depth: category === 'paintings' ? getRandomFloat(2, 5) : null
            },
            weight: getRandomFloat(1, 15),
            yearCreated: getRandomInt(2020, 2024),
            status: getRandomElement(statuses),
            stock: category === 'prints' ? getRandomInt(1, 50) : 1,
            certificateOfAuthenticity: category === 'paintings',
            tags: [category, getRandomElement(['abstract', 'modern', 'colorful', 'minimalist'])],
            slug: `${titles.en[titleIndex].toLowerCase().replace(/\s+/g, '-')}-${id.slice(-4)}`,
            featured: getRandomBool(),
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: new Date()
        };
        products.push(product);
    }
    return products;
};

export const seedDatabase = async () => {
    try {
        const products = generateMockProducts(10);
        const batch = writeBatch(db);
        const productsCollection = collection(db, 'products');

        products.forEach(product => {
            const docRef = doc(productsCollection, product.id);
            batch.set(docRef, product);
        });

        await batch.commit();
        console.log(`${products.length} products have been added to the database.`);
        return { success: true, count: products.length };
    } catch (error) {
        console.error("Error seeding database:", error);
        return { success: false, error: (error as Error).message };
    }
};