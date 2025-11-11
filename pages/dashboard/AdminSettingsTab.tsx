import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { firestore } from '../../lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import Button from '../../components/ui/Button';
import { seedProducts, seedCategories } from '../../lib/seed';

const AdminSettingsTab: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePopulateDatabase = async () => {
        // FIX: Add a guard for `window` to prevent errors in non-browser environments.
        if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to populate the database? This should only be done once on a fresh installation.")) {
            return;
        }

        setIsLoading(true);
        try {
            const batch = writeBatch(firestore);

            // Seed Products
            seedProducts.forEach(product => {
                const productRef = doc(firestore, 'products', product.id);
                batch.set(productRef, product);
            });

            // Seed Categories
            seedCategories.forEach(category => {
                const categoryRef = doc(firestore, 'categories', category.id);
                batch.set(categoryRef, category);
            });

            await batch.commit();

            showToast("Database populated successfully!", 'success');
        } catch (error: any) {
            console.error("Error populating database:", error);
            showToast(error.message || "Failed to populate database.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Database Tools</h2>
            <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-700">Populate Database</h3>
                <p className="text-sm text-red-600 mt-1 mb-3">
                    This will add initial products and categories to your Firestore database.
                    This action should only be performed once on a new, empty project.
                </p>
                <Button 
                    onClick={handlePopulateDatabase} 
                    disabled={isLoading}
                    className="w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                >
                    {isLoading ? "Populating..." : "Populate with Seed Data"}
                </Button>
            </div>
        </div>
    );
};

export default AdminSettingsTab;