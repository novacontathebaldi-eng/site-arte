import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import Modal from '../common/Modal';
import { useI18n } from '../../hooks/useI18n';
import Input from '../common/Input';
import { useProducts } from '../../hooks/useProducts';
import Spinner from '../common/Spinner';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const { t, language } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    // FIX: The useProducts hook expects only one argument.
    const { products, loading } = useProducts({ searchTerm: debouncedSearchTerm });

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const highlightMatch = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return text;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-brand-gold/50">{part}</mark> : part
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-2">
                <Input
                    id="search"
                    type="text"
                    placeholder={t('catalog.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-lg"
                    autoFocus
                />

                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                    {loading && <div className="flex justify-center p-8"><Spinner /></div>}

                    {!loading && debouncedSearchTerm && products.length === 0 && (
                        <div className="text-center p-8 text-brand-black/70">
                            {t('catalog.search.noResults')} "<strong>{debouncedSearchTerm}</strong>"
                        </div>
                    )}
                    
                    {!loading && products.length > 0 && (
                        <ul className="divide-y divide-black/10">
                            {products.map(product => (
                                <li key={product.id}>
                                    <a href={`#/product/${product.id}`} onClick={onClose} className="flex items-center p-3 hover:bg-black/5 rounded-md">
                                        <img src={product.images[0]?.thumbnailUrl} alt="" className="w-16 h-16 object-cover rounded"/>
                                        <div className="ml-4">
                                            <p className="font-semibold">{highlightMatch(product.translations[language]?.title || product.translations.en!.title, debouncedSearchTerm)}</p>
                                            <p className="text-sm text-brand-black/60">€{(product.price.amount / 100).toFixed(2)}</p>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default SearchModal;