'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface ProductFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
  onClear: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onClear
}) => {
  const { t } = useTranslation();

  const categories = [
    { value: '', label: t('all-categories') },
    { value: 'paintings', label: t('paintings') },
    { value: 'jewelry', label: t('jewelry') },
    { value: 'digital', label: t('digital-art') },
    { value: 'prints', label: t('prints') }
  ];

  const statuses = [
    { value: '', label: t('all-statuses') },
    { value: 'available', label: t('available') },
    { value: 'sold', label: t('sold') },
    { value: 'made-to-order', label: t('made-to-order') }
  ];

  const materials = [
    'Oil on canvas',
    'Acrylic',
    'Watercolor',
    'Mixed media',
    'Digital',
    'Gold',
    'Silver',
    'Bronze'
  ];

  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('category')}
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('price-range')}
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder={t('min')}
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <span className="flex items-center text-gray-500">-</span>
          <input
            type="number"
            placeholder={t('max')}
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('availability')}
        </label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Materials Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('materials')}
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {materials.map((material) => (
            <label key={material} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleFilterChange('materials', [...filters.materials, material]);
                  } else {
                    handleFilterChange('materials', filters.materials.filter((m: string) => m !== material));
                  }
                }}
                className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dimensions Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('dimensions')}
        </label>
        <select
          value={filters.dimensions}
          onChange={(e) => handleFilterChange('dimensions', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">{t('all-sizes')}</option>
          <option value="small">{t('small')} (&lt;50cm)</option>
          <option value="medium">{t('medium')} (50-100cm)</option>
          <option value="large">{t('large')} (&gt;100cm)</option>
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('sort-by')}
        </label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="newest">{t('newest')}</option>
          <option value="price-low">{t('price-low-to-high')}</option>
          <option value="price-high">{t('price-high-to-low')}</option>
          <option value="name-asc">{t('name-a-z')}</option>
          <option value="name-desc">{t('name-z-a')}</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={onClear}
        className="w-full px-4 py-2 text-center text-sm text-gray-600 hover:text-primary transition-colors"
      >
        {t('clear-all-filters')}
      </button>
    </div>
  );
};