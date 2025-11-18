'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search, X } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { useProductsStore } from '@/store/productsStore';
import { useLanguageStore } from '@/store/languageStore';
import { Product } from '@/types';

export default function CatalogPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLanguage } = useLanguageStore();
  const { products, isLoading, hasMore, loadProducts } = useProductsStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    status: '',
    availability: '',
    materials: [] as string[],
    dimensions: ''
  });
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // Load products on mount
  useEffect(() => {
    loadProducts(filters, true);
  }, []);

  // Update displayed products when products change
  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product => {
        const translation = product.translations[currentLanguage] || product.translations.fr;
        const searchLower = searchQuery.toLowerCase();
        return (
          translation.title.toLowerCase().includes(searchLower) ||
          translation.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          translation.materials.toLowerCase().includes(searchLower)
        );
      });
      setDisplayedProducts(filtered);
    } else {
      setDisplayedProducts(products);
    }
  }, [searchQuery, products, currentLanguage]);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    loadProducts(newFilters, true);
  }, [loadProducts]);

  const handleClearFilters = useCallback(() => {
    const newFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      availability: '',
      materials: [],
      dimensions: ''
    };
    setFilters(newFilters);
    loadProducts(newFilters, true);
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    loadProducts(filters, false);
  }, [filters, loadProducts]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">
              {t('catalog')}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('catalog-description')}
            </p>
          </motion.div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search-products')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-md transition-colors ${
                  showFilters
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('filters')}
              </button>

              {/* View Mode */}
              <div className="flex items-center bg-white border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {displayedProducts.length} {t('products')}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(value => value) && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-600">{t('active-filters')}:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 bg-primary text-white text-xs rounded-md"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange({ ...filters, [key]: '' })}
                      className="ml-1 hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-primary"
              >
                {t('clear-all')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold">{t('filters')}</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <ProductFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading && displayedProducts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
                      <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && displayedProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t('no-products-found')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('try-adjusting-your-filters')}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  {t('clear-filters')}
                </button>
              </div>
            )}

            {/* Load More */}
            {hasMore && displayedProducts.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t('load-more')
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}