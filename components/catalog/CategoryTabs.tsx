import React, { useRef, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface Category {
    id: string;
    nameKey: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onTabClick: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategoryId, onTabClick }) => {
    const { t } = useI18n();
    const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

    // Effect to scroll the active tab into view (horizontally)
    useEffect(() => {
        const activeTabElement = tabRefs.current.get(activeCategoryId);
        if (activeTabElement) {
            activeTabElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeCategoryId]);
    
    const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>, categoryId: string) => {
        e.preventDefault();
        onTabClick(categoryId);
    };

    return (
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-4 scrollbar-hide">
            {categories.map(tab => (
                <button
                    key={tab.id}
                    ref={(el) => tabRefs.current.set(tab.id, el)}
                    onClick={(e) => handleTabClick(e, tab.id)}
                    className={`relative whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        activeCategoryId === tab.id
                            ? 'text-brand-black'
                            : 'text-brand-black/60 hover:text-brand-black'
                    }`}
                     aria-current={activeCategoryId === tab.id ? 'page' : undefined}
                >
                    {t(tab.nameKey)}
                    {activeCategoryId === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                    )}
                </button>
            ))}
        </nav>
    );
};

export default CategoryTabs;
