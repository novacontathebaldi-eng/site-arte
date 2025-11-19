import React, { useRef, useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchClick: () => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onCategoryChange, onSearchClick }) => {
    const { t } = useI18n();
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    const categories = ['all', 'paintings', 'jewelry', 'digital', 'prints'];

    useEffect(() => {
        const activeIndex = categories.indexOf(activeCategory);
        const activeTab = tabRefs.current[activeIndex];
        if (activeTab) {
            setIndicatorStyle({
                left: activeTab.offsetLeft,
                width: activeTab.offsetWidth,
            });
        }
    }, [activeCategory, categories]);

    return (
        <header className="sticky top-20 z-40 bg-brand-white/80 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between">
                    <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        {categories.map((category, index) => (
                            <button
                                key={category}
                                ref={el => tabRefs.current[index] = el}
                                onClick={() => onCategoryChange(category)}
                                className={`relative py-4 px-1 text-sm sm:text-base font-medium transition-colors duration-300
                                    ${activeCategory === category ? 'text-brand-black' : 'text-brand-black/50 hover:text-brand-black'}
                                `}
                            >
                                {t(`product.categories.${category}`)}
                            </button>
                        ))}
                    </nav>
                     <div className="absolute bottom-0 h-0.5 bg-brand-gold transition-all duration-300 ease-in-out" style={indicatorStyle} />

                    <button onClick={onSearchClick} className="text-brand-black/70 hover:text-brand-black">
                        <SearchIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default CategoryTabs;
