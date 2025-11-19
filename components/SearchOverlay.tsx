
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import Input from './common/Input';
import Spinner from './common/Spinner';
import { useI18n } from '../hooks/useI18n';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const { t, language } = useI18n();

  useEffect(() => {
    if (!isOpen) {
        setSearchTerm('');
        setResults([]);
        return;
    }

    const fetchResults = async () => {
        if (debouncedSearchTerm.trim().length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const q = query(
                collection(db, 'products'),
                where('tags', 'array-contains', debouncedSearchTerm.toLowerCase()),
                where('publishedAt', '!=', null),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const searchResults = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as ProductDocument);
            setResults(searchResults);
        } catch(e) {
            console.error("Search failed: ", e);
        } finally {
            setLoading(false);
        }
    };

    fetchResults();
  }, [debouncedSearchTerm, isOpen]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-brand-white/95 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20" onClick={e => e.stopPropagation()}>
         <div className="max-w-3xl mx-auto">
             <Input 
                id="main-search"
                autoFocus
                placeholder={t('header.search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-2xl p-4 border-b-2 focus:ring-0 focus:border-brand-gold"
             />
             <div className="mt-8">
                {loading && <div className="flex justify-center"><Spinner /></div>}
                {!loading && debouncedSearchTerm && results.length === 0 && <p>No results found for "{debouncedSearchTerm}"</p>}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map(product => (
                            <a href={`#/product/${product.id}`} key={product.id} onClick={onClose} className="flex items-center p-2 hover:bg-black/5 rounded-md">
                                <img src={product.images[0]?.thumbnailUrl} alt={product.translations[language]?.title} className="w-16 h-16 object-cover rounded"/>
                                <div className="ml-4">
                                    <p className="font-semibold">{product.translations[language]?.title}</p>
                                    <p className="text-sm text-brand-black/70">€{(product.price.amount / 100).toFixed(2)}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default SearchOverlay;