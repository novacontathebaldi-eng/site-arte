import React, { useState, useEffect } from 'react';
import { CatalogFilters } from '../CatalogPage';
import { STATUSES } from '../../constants';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';

interface FilterSidebarProps {
  onFilterChange: (filters: CatalogFilters) => void;
  initialFilters: CatalogFilters;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <details className="border-b border-black/10 py-4" open>
        <summary className="font-serif font-semibold cursor-pointer">{title}</summary>
        <div className="pt-4">{children}</div>
    </details>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange, initialFilters }) => {
    const { t } = useI18n();
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            price: { ...prev.price, [name]: Number(value) }
        }));
    };
    
    const handleStatusChange = (statusId: string) => {
        setFilters(prev => {
            const newStatus = prev.status.includes(statusId)
                ? prev.status.filter(s => s !== statusId)
                : [...prev.status, statusId];
            return { ...prev, status: newStatus };
        });
    };

    const clearFilters = () => {
        setFilters(initialFilters);
    };
    
    return (
        <div className="space-y-2 sticky top-24">
             <div className="flex justify-between items-center pb-2">
                <h3 className="font-bold text-xl font-serif">Filters</h3>
                <Button variant="tertiary" size="sm" onClick={clearFilters}>Clear All</Button>
            </div>
            
            <FilterSection title="Availability">
                 <div className="space-y-2">
                    {STATUSES.map(status => (
                        <label key={status.id} className="flex items-center">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                                checked={filters.status.includes(status.id)}
                                onChange={() => handleStatusChange(status.id)}
                            />
                            <span className="ml-3 text-sm">{t(status.nameKey)}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Price Range">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-black/50">€</span>
                        <input
                            id="min-price"
                            name="min"
                            type="number"
                            value={filters.price.min}
                            onChange={handlePriceChange}
                            className="w-full pl-6 pr-2 py-2 border border-brand-black/20 rounded-md"
                            aria-label="Minimum price"
                        />
                    </div>
                    <span>-</span>
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-black/50">€</span>
                        <input
                            id="max-price"
                            name="max"
                            type="number"
                            value={filters.price.max}
                            onChange={handlePriceChange}
                            className="w-full pl-6 pr-2 py-2 border border-brand-black/20 rounded-md"
                            aria-label="Maximum price"
                        />
                    </div>
                </div>
            </FilterSection>
        </div>
    );
};

export default FilterSidebar;
