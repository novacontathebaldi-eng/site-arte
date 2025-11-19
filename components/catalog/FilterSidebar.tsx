import React, { useState, useEffect, Fragment } from 'react';
import { useDebounce } from 'use-debounce';
import { ProductFilters } from '../../hooks/useProducts';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';
import Input from '../common/Input';
import { STATUSES } from '../../constants';

interface FilterSidebarProps {
  currentFilters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ currentFilters, onFilterChange, isOpen, onClose }) => {
    const { t } = useI18n();
    const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
    const [status, setStatus] = useState<string[]>(currentFilters.status || []);
    
    const [debouncedMinPrice] = useDebounce(minPrice, 500);
    const [debouncedMaxPrice] = useDebounce(maxPrice, 500);

    useEffect(() => {
        onFilterChange({ 
            minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
            maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined 
        });
    }, [debouncedMinPrice, debouncedMaxPrice]);
    
    useEffect(() => {
      onFilterChange({ status: status.length > 0 ? status : undefined });
    }, [status]);


    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setStatus(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
    };
    
    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setStatus([]);
        onFilterChange({ minPrice: undefined, maxPrice: undefined, status: undefined });
    };

    const hasActiveFilters = !!currentFilters.minPrice || !!currentFilters.maxPrice || !!currentFilters.status?.length;

    const content = (
        <aside className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold font-serif text-lg">{t('catalog.filters.title')}</h3>
                {hasActiveFilters && (
                    <Button variant="tertiary" size="sm" onClick={clearFilters}>{t('catalog.filters.clear')}</Button>
                )}
            </div>
            {/* Price Filter */}
            <div>
                <h4 className="font-semibold mb-2">{t('catalog.filters.price')}</h4>
                <div className="flex items-center gap-2">
                    <Input id="min-price" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                    <span>-</span>
                    <Input id="max-price" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
            </div>
             {/* Status Filter */}
            <div>
                <h4 className="font-semibold mb-2">{t('catalog.filters.status')}</h4>
                <div className="space-y-2">
                    {STATUSES.map(s => (
                        <label key={s.id} className="flex items-center">
                            <input
                                type="checkbox"
                                value={s.id}
                                checked={status.includes(s.id)}
                                onChange={handleStatusChange}
                                className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                            />
                            <span className="ml-2 text-sm">{t(s.nameKey)}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );

    return (
        <Fragment>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                {content}
            </div>

            {/* Mobile Sidebar (Overlay) */}
             <div 
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
             />
             <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-brand-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out p-6 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button onClick={onClose} className="absolute top-4 right-4"><XIcon className="h-6 w-6" /></button>
                {content}
             </div>
        </Fragment>
    );
};

export default FilterSidebar;