import React, { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useI18n } from '../../hooks/useI18n';
import { CATEGORIES } from '../../constants';

interface CategoryTabsProps {
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ selectedCategory, onSelectCategory }) => {
    const { t } = useI18n();
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const categoryCounts: Record<string, number> = {};

                for (const category of CATEGORIES) {
                    const categoryQuery = query(
                        collection(db, 'products'),
                        where('category', '==', category.id),
                        where('publishedAt', '!=', null)
                    );
                    const snapshot = await getCountFromServer(categoryQuery);
                    categoryCounts[category.id] = snapshot.data().count;
                }
                setCounts(categoryCounts);
            } catch (error) {
                console.error("Error fetching product counts:", error);
                 // Fallback to simpler query if index is missing
                try {
                    const categoryCounts: Record<string, number> = {};
                    for (const category of CATEGORIES) {
                         const simpleQuery = query(collection(db, 'products'), where('category', '==', category.id));
                         const snapshot = await getCountFromServer(simpleQuery);
                         categoryCounts[category.id] = snapshot.data().count;
                    }
                    setCounts(categoryCounts);
                } catch (fallbackError) {
                    console.error("Fallback count query also failed:", fallbackError);
                }
            }
        };
        fetchCounts();
    }, []);

    const handleTabClick = (tabId: string) => {
        // If clicking the active tab, deselect it (show all by passing undefined)
        onSelectCategory(selectedCategory === tabId ? undefined : tabId);
    };

    return (
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-4">
            {CATEGORIES.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`relative whitespace-nowrap px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                        selectedCategory === tab.id
                            ? 'text-brand-black'
                            : 'text-brand-black/60 hover:text-brand-black'
                    }`}
                >
                    {t(tab.nameKey)}
                    {counts[tab.id] !== undefined && (
                        <span className={`ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full ${selectedCategory === tab.id ? 'bg-brand-black/10' : 'bg-black/5'}`}>
                            {counts[tab.id]}
                        </span>
                    )}
                    {selectedCategory === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                    )}
                </button>
            ))}
        </nav>
    );
};

export default CategoryTabs;