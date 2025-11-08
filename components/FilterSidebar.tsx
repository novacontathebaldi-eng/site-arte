import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ProductFilters } from '../types';
import RangeSlider from './ui/RangeSlider';

interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: (key: keyof ProductFilters, value: any) => void;
  onClear: () => void;
  resultsCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClear,
  resultsCount
}) => {
  const { t } = useTranslation();

  const handleCheckboxChange = (
    key: 'category' | 'technique',
    value: string,
    checked: boolean
  ) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    onFilterChange(key, newValues);
  };

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-heading font-semibold">{t('catalog.filters')}</h3>
        <button
          onClick={onClear}
          className="text-sm text-secondary hover:underline"
        >
          {t('catalog.clearFilters')}
        </button>
      </div>

      {/* Category */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">{t('catalog.category')}</h4>
        {['Painting', 'Sculpture', 'Drawing', 'Print'].map(cat => (
          <label key={cat} className="flex items-center gap-2 mb-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-secondary focus:ring-secondary"
              checked={filters.category?.includes(cat) || false}
              onChange={(e) => handleCheckboxChange('category', cat, e.target.checked)}
            />
            {t(`catalog.${cat.toLowerCase()}`)}
          </label>
        ))}
      </div>

      {/* Price */}
      <RangeSlider
        label={t('catalog.priceRange')}
        min={0}
        max={10000}
        minValue={filters.minPrice || 0}
        maxValue={filters.maxPrice || 10000}
        currency="EUR"
        onChange={(min, max) => {
          onFilterChange('minPrice', min);
          onFilterChange('maxPrice', max);
        }}
      />

      {/* Technique */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">{t('product.technique')}</h4>
        {['Oil', 'Acrylic', 'Watercolor', 'Mixed Media'].map(tech => (
          <label key={tech} className="flex items-center gap-2 mb-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-secondary focus:ring-secondary"
              checked={filters.technique?.includes(tech) || false}
              onChange={(e) => handleCheckboxChange('technique', tech, e.target.checked)}
            />
            {t(`technique.${tech.toLowerCase().replace(' ', '-')}`)}
          </label>
        ))}
      </div>

       <div className="text-sm text-gray-600 pt-4 border-t">
         {resultsCount} {t('catalog.resultsFound')}
      </div>
    </aside>
  );
};

export default FilterSidebar;
