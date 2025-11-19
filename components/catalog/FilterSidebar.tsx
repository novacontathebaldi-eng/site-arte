import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { Filters } from '../../hooks/useProducts';
import { CATEGORIES, STATUSES } from '../../constants';
import { useI18n } from '../../hooks/useI18n';
import Input from '../common/Input';
import Button from '../common/Button';

interface FilterSidebarProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters: Filters;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange, initialFilters }) => {
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories || []);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const [debouncedSearch] = useDebounce(search, 500);

    useEffect(() => {
        const newFilters: Filters = {
            search: debouncedSearch,
            categories: selectedCategories,
            priceRange,
            status: selectedStatus
        };
        onFilterChange(newFilters);
    }, [debouncedSearch, selectedCategories, priceRange, selectedStatus, onFilterChange]);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 2000 });
        setSelectedStatus('');
    };

    const isFilterActive = useMemo(() => {
        return search !== '' || selectedCategories.length > 0 || priceRange.min !== 0 || priceRange.max !== 2000 || selectedStatus !== '';
    }, [search, selectedCategories, priceRange, selectedStatus]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg font-serif">Filters</h3>
                {isFilterActive && <Button variant="tertiary" size="sm" onClick={clearFilters}>Clear All</Button>}
            </div>

            <div>
                <Input 
                    id="search"
                    label="Search" 
                    placeholder="e.g., abstract, cosmos"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            {/* Categories */}
            <div>
                <h4 className="font-semibold mb-2">Category</h4>
                <div className="space-y-2">
                    {CATEGORIES.map(category => (
                        <label key={category.id} className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => handleCategoryChange(category.id)}
                            />
                            <span className="ml-3 text-sm">{t(category.nameKey)}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="font-semibold mb-2">Price Range</h4>
                <div className="flex items-center space-x-2">
                    <Input id="min-price" type="number" value={priceRange.min} onChange={e => setPriceRange(p => ({...p, min: Number(e.target.value)}))} placeholder="Min" aria-label="Minimum price" />
                    <span>-</span>
                     <Input id="max-price" type="number" value={priceRange.max} onChange={e => setPriceRange(p => ({...p, max: Number(e.target.value)}))} placeholder="Max" aria-label="Maximum price" />
                </div>
            </div>

            {/* Status */}
             <div>
                <h4 className="font-semibold mb-2">Availability</h4>
                <div className="space-y-2">
                     <label className="flex items-center">
                        <input
                            type="radio" name="status" className="h-4 w-4"
                            checked={selectedStatus === ''}
                            onChange={() => setSelectedStatus('')}
                        />
                        <span className="ml-3 text-sm">All</span>
                    </label>
                    {STATUSES.map(status => (
                        <label key={status.id} className="flex items-center">
                            <input
                                type="radio"
                                name="status"
                                className="h-4 w-4 border-gray-300 text-brand-gold focus:ring-brand-gold"
                                checked={selectedStatus === status.id}
                                onChange={() => setSelectedStatus(status.id)}
                            />
                            <span className="ml-3 text-sm">{t(status.nameKey)}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
