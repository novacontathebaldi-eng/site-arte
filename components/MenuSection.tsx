import React, { useMemo, useEffect, useRef } from 'react';
import { Painting, Category, CartItem } from '../types';
import { PaintingCard } from './PaintingCard'; 

interface GallerySectionProps {
    categories: Category[];
    paintings: Painting[];
    onAddToCart: (painting: Painting) => void;
    isStoreOnline: boolean;
    activeCategoryId: string;
    setActiveCategoryId: (id: string) => void;
    cartItemCount: number;
    onCartClick: () => void;
    cartItems: CartItem[];
}

// Icons for art categories
const categoryIcons: { [key: string]: string } = {
    'Abstrait': 'fas fa-drafting-compass',
    'Paysage': 'fas fa-image',
    'Portrait': 'fas fa-portrait',
    'Série Or': 'fas fa-gem'
};

export const GallerySection: React.FC<GallerySectionProps> = ({ 
    categories, paintings, onAddToCart, isStoreOnline, 
    activeCategoryId, setActiveCategoryId, 
    cartItemCount, onCartClick, cartItems
}) => {
    const categoryRefs = useRef<Map<string, HTMLElement | null>>(new Map());
    const tabRefs = useRef<Map<string, HTMLAnchorElement | null>>(new Map());
    const isClickNavigating = useRef(false);

    
    const sortedActiveCategories = useMemo(() => 
        [...categories].filter(c => c.active).sort((a, b) => a.order - b.order),
        [categories]
    );

    useEffect(() => {
        const bannerHeight = !isStoreOnline ? 40 : 0;
        const topMargin = 120 + bannerHeight;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isClickNavigating.current) {
                        setActiveCategoryId(entry.target.id.replace('category-section-', ''));
                    }
                });
            },
            {
                rootMargin: `-${topMargin}px 0px -50% 0px`,
                threshold: 0,
            }
        );

        const currentRefs = categoryRefs.current;
        currentRefs.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => {
            currentRefs.forEach((el) => {
                if (el) observer.unobserve(el);
            });
            observer.disconnect();
        };
    }, [sortedActiveCategories, setActiveCategoryId, isStoreOnline]);

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

    const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
        e.preventDefault();
        isClickNavigating.current = true;
        setActiveCategoryId(categoryId);
        
        const element = document.getElementById(`category-section-${categoryId}`);
        const stickyHeader = document.getElementById('sticky-gallery-header');
        const statusBanner = document.getElementById('status-banner');
        
        if (element && stickyHeader) {
            const bannerHeight = statusBanner ? statusBanner.offsetHeight : 0;
            const headerOffset = stickyHeader.offsetHeight + 80 + bannerHeight;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Reset the flag after scrolling is likely complete
            setTimeout(() => { isClickNavigating.current = false; }, 1000);
        }
    };

    return (
        <section id="galerie" className="py-20 bg-brand-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <span className="inline-block bg-brand-accent/10 text-brand-secondary px-4 py-2 rounded-full font-semibold text-sm mb-4">
                        <i className="fas fa-palette mr-2"></i>Notre Collection
                    </span>
                    <h2 className="text-4xl font-serif font-bold text-text-primary">Explorer la Galerie</h2>
                    <p className="text-lg text-text-secondary mt-2 max-w-2xl mx-auto">Chaque œuvre raconte une histoire. Trouvez celle qui résonne avec la vôtre.</p>
                </div>
                
                <div id="sticky-gallery-header" className={`sticky ${isStoreOnline ? 'top-20' : 'top-[7.5rem]'} bg-brand-background/95 backdrop-blur-sm z-30 -mx-4 shadow-sm`}>
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide px-2 sm:px-4 lg:flex-wrap lg:justify-center lg:overflow-x-visible">
                            {sortedActiveCategories.map(category => (
                                <a 
                                    key={category.id} 
                                    ref={(el) => { tabRefs.current.set(category.id, el); }}
                                    href={`#category-section-${category.id}`}
                                    onClick={(e) => handleTabClick(e, category.id)}
                                    className={`flex-shrink-0 inline-flex items-center gap-2 py-3 px-4 font-semibold text-sm transition-colors
                                        ${activeCategoryId === category.id 
                                            ? 'border-b-2 border-brand-secondary text-brand-primary' 
                                            : 'text-gray-500 hover:text-brand-primary'
                                        }`}
                                >
                                    <i className={`${categoryIcons[category.name] || 'fas fa-paint-brush'} w-5 text-center`}></i>
                                    <span>{category.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 space-y-12">
                    {sortedActiveCategories.map(category => {
                        const categoryPaintings = paintings.filter(p => p.categoryId === category.id && p.active && !p.deleted);
                        if (categoryPaintings.length === 0) return null;

                        return (
                            <div 
                                key={category.id} 
                                id={`category-section-${category.id}`} 
                                ref={(el) => { categoryRefs.current.set(category.id, el); }}
                            >
                                <h3 className="text-3xl font-serif font-bold text-text-primary mb-6 border-l-4 border-brand-secondary pl-4">{category.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {categoryPaintings.map(painting => (
                                        <PaintingCard 
                                            key={painting.id} 
                                            painting={painting} 
                                            onAddToCart={onAddToCart}
                                            isStoreOnline={isStoreOnline}
                                            isInCart={cartItems.some(item => item.paintingId === painting.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {cartItemCount > 0 && (
                     <div className="mt-16 text-center">
                        <button
                            onClick={onCartClick}
                            className="bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 text-lg"
                        >
                            <i className="fas fa-shopping-bag mr-2"></i>
                            Voir le Panier ({cartItemCount})
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};
