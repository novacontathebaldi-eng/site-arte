import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductDocument } from '../../firebase-types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import { useI18n } from '../../hooks/useI18n';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [results, setResults] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const { t, language } = useI18n();

    useEffect(() => {
        if (debouncedSearchTerm.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'products'),
                     // Firestore doesn't support full-text search. This is a workaround.
                     // For a real app, use a dedicated search service like Algolia or Typesense.
                    where('tags', 'array-contains', debouncedSearchTerm.toLowerCase()),
                    limit(10)
                );
                const querySnapshot = await getDocs(q);
                const searchResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
                setResults(searchResults);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleFormSubmit}>
                <Input 
                    id="search-modal"
                    placeholder={t('catalog.search.placeholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </form>
            <div className="mt-4 h-96 overflow-y-auto">
                {loading && <div className="flex justify-center pt-8"><Spinner /></div>}
                {!loading && results.length > 0 && (
                    <ul>
                        {results.map(product => (
                             <li key={product.id}>
                                 <a href={`#/product/${product.id}`} onClick={onClose} className="flex items-center p-2 hover:bg-black/5 rounded-md">
                                     <img src={product.images[0]?.thumbnailUrl} className="w-12 h-12 object-cover rounded" />
                                     <div className="ml-4">
                                         <p className="font-semibold">{product.translations[language]?.title}</p>
                                         <p className="text-sm text-brand-black/60">€{(product.price.amount / 100).toFixed(2)}</p>
                                     </div>
                                 </a>
                            </li>
                        ))}
                    </ul>
                )}
                 {!loading && debouncedSearchTerm.length > 1 && results.length === 0 && (
                    <div className="text-center pt-8 text-brand-black/70">
                        <p>{t('catalog.search.noResults')} "{debouncedSearchTerm}"</p>
                    </div>
                 )}
            </div>
             <div className="mt-4 border-t pt-4 text-center">
                <a href="#/catalog" onClick={onClose} className="text-sm font-semibold text-brand-gold hover:underline">{t('catalog.search.viewAll')}</a>
            </div>
        </Modal>
    );
};

export default SearchModal;
