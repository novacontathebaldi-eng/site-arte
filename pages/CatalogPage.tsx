import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { SearchIcon } from '../components/ui/icons';
import { useDebounce } from '../hooks/useDebounce';
import CategoryNav from '../components/CategoryNav';

const CatalogPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const [activeCategory, setActiveCategory] = useState('paintings');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = await getProducts();
        setProducts(allProducts);
      } catch (error: any) {
        console.error("Failed to fetch products for catalog:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => ['paintings', 'jewelry', 'digital', 'prints'], []);
  
  const categoryLabels = useMemo(() => categories.map(cat => ({
    id: cat,
    label: t(`catalog.${cat}`)
  })), [categories, t]);

  const productsByCategory = useMemo(() => {
    let filteredProducts = products;
    if (debouncedQuery) {
      filteredProducts = products.filter(p =>
        p.translations[language].title
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      );
    }

    return categories.reduce((acc, category) => {
      acc[category] = filteredProducts.filter(p => p.category === category);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products, categories, debouncedQuery, language]);

  useEffect(() => {
    if (debouncedQuery) return; 

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter(e => e.isIntersecting);
        if (intersectingEntries.length > 0) {
            const bestEntry = intersectingEntries.reduce((prev, current) => 
                (prev.intersectionRatio > current.intersectionRatio) ? prev : current
            );
            setActiveCategory(bestEntry.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -75% 0px',
        threshold: 0,
      }
    );

    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(currentRefs).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [debouncedQuery, productsByCategory]);

  const handleCategoryClick = (categoryId: string) => {
    const headerHeight = 80; // from Header.tsx h-20
    const stickyNavHeight = 58; // approx height of the new nav
    const element = sectionRefs.current[categoryId];
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - stickyNavHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };
  
  const sectionsToRender = categories.filter(category => productsByCategory[category]?.length > 0);

  return (
    <div className="bg-white">
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileSearchOpen(false)}></div>
            <div className="relative bg-white p-4 shadow-lg">
                <div className="relative">
                    <input
                        type="search"
                        placeholder={t('catalog.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-md"
                        autoFocus
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>
        </div>
      )}

      <CategoryNav 
        categories={categoryLabels}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        onSearchClick={() => setIsMobileSearchOpen(true)}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-12">
          {t('catalog.title')}
        </h1>

        <div className="hidden lg:block relative max-w-lg mx-auto mb-12">
            <input
                type="search"
                placeholder={t('catalog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-12 border rounded-full shadow-sm focus:ring-secondary focus:border-secondary"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        </div>

        {isLoading ? (
            <ProductGridSkeleton count={12} />
        ) : (
          <div className="space-y-16">
            {sectionsToRender.length > 0 ? sectionsToRender.map(category => (
              <section
                key={category}
                id={category}
                // FIX: Changed ref callback from an expression to a block statement.
                // An assignment expression returns the assigned value, which is not allowed for a ref callback.
                // Wrapping the assignment in curly braces ensures the function returns undefined.
                ref={(el) => { if (el) sectionRefs.current[category] = el; }}
                aria-labelledby={`${category}-heading`}
              >
                <h2 id={`${category}-heading`} className="text-3xl font-bold font-heading mb-6 border-b-2 border-secondary pb-2">
                  {t(`catalog.${category}`)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {productsByCategory[category].map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )) : (
                <div className="text-center py-20">
                    <p className="text-lg text-text-secondary">{t('catalog.noResults')}</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;