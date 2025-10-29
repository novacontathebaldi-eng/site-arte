import { db } from './firebase';
import { Painting, Category } from '../types';

interface InitialPaintingData extends Omit<Painting, 'id' | 'categoryId' | 'deleted'> {
    categoryName: string;
}

const initialCategories: Omit<Category, 'id'>[] = [
    { name: 'Abstrait', order: 1, active: true },
    { name: 'Paysage', order: 2, active: true },
    { name: 'Portrait', order: 3, active: true },
    { name: 'Série Or', order: 4, active: true }, // Gold Series
];

const initialPaintings: InitialPaintingData[] = [
    { name: 'Aube Dorée', description: 'Une exploration vibrante des couleurs matinales avec des touches de feuille d\'or.', categoryName: 'Abstrait', price: 1200.00, dimensions: '80x60cm', technique: 'Acrylique sur toile', year: 2023, imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', badge: 'Nouveau', active: true, orderIndex: 0, stockStatus: 'available' },
    { name: 'Sérénité Luxembourgeoise', description: 'Un paysage paisible capturant la beauté verdoyante des vallées du Luxembourg.', categoryName: 'Paysage', price: 1500.00, dimensions: '100x70cm', technique: 'Huile sur toile', year: 2022, imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', active: true, orderIndex: 1, stockStatus: 'available' },
    { name: 'Le Penseur Moderne', description: 'Un portrait contemporain qui explore l\'introspection à l\'ère numérique.', categoryName: 'Portrait', price: 2200.00, dimensions: '90x70cm', technique: 'Technique mixte', year: 2024, imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', active: true, orderIndex: 2, stockStatus: 'available' },
    { name: 'Éclat d\'Or', description: 'Composition abstraite dominée par des textures riches et des feuilles d\'or 24 carats.', categoryName: 'Série Or', price: 3500.00, dimensions: '120x80cm', technique: 'Feuille d\'or et acrylique', year: 2024, imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800', badge: 'Populaire', active: true, orderIndex: 3, stockStatus: 'available' },
    { name: 'Forêt Enchantée', description: 'Une interprétation onirique des forêts ardennaises, pleine de lumière et de mystère.', categoryName: 'Paysage', price: 1800.00, dimensions: '70x50cm', technique: 'Aquarelle', year: 2023, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', active: true, orderIndex: 4, stockStatus: 'available' },
    { name: 'Cosmos Intérieur', description: 'Une explosion de couleurs et de formes qui représente l\'univers intérieur de l\'artiste.', categoryName: 'Abstrait', price: 1350.00, dimensions: '100x100cm', technique: 'Acrylique sur toile', year: 2022, imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', active: true, orderIndex: 5, stockStatus: 'available' },
];

export const seedDatabase = async (): Promise<void> => {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    
    console.log('Starting database seed...');
    
    const categoriesRef = db.collection('categories');
    const productsRef = db.collection('paintings');
    
    // Check for existing data to prevent duplicates
    const existingCategories = await categoriesRef.limit(1).get();
    if (!existingCategories.empty) {
        console.log('Categories collection already contains data. Aborting seed.');
        alert('Le seed de la base de données a été annulé car des données existent déjà.');
        return;
    }

    const categoryNameToIdMap: { [key: string]: string } = {};

    // Batch write for categories
    const categoryBatch = db.batch();
    for (const cat of initialCategories) {
        const docRef = categoriesRef.doc();
        categoryBatch.set(docRef, cat);
        categoryNameToIdMap[cat.name] = docRef.id;
    }
    await categoryBatch.commit();
    console.log(`${initialCategories.length} categories seeded.`);

    // Batch write for products
    const productBatch = db.batch();
    for (const painting of initialPaintings) {
        const { categoryName, ...paintingData } = painting;
        const categoryId = categoryNameToIdMap[categoryName];
        if (categoryId) {
            const docRef = productsRef.doc();
            productBatch.set(docRef, { ...paintingData, categoryId, deleted: false });
        } else {
            console.warn(`Category "${categoryName}" not found for painting "${painting.name}".`);
        }
    }
    await productBatch.commit();
    console.log(`${initialPaintings.length} paintings seeded.`);
    
    console.log('Database seed complete!');
};
