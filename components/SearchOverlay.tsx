
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import Spinner from './common/Spinner';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const { t, language } = useI18n();

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        // Simple search on tags array. A more robust solution would use a dedicated search service.
        const q = query(
            productsRef, 
            where('tags', 'array-contains', debouncedSearchTerm.toLowerCase()),
            where('publishedAt', '!=', null),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        const searchResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
        setResults(searchResults);
      } catch (error) {
        console.error("Error searching products:", error);
      }
      setLoading(false);
    };

    searchProducts();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-white/95 backdrop-blur-sm" onClick={onClose}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full" onClick={e => e.stopPropagation()}>
        <div className="max-w-3xl mx-auto pt-20">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('header.search')}
              className="w-full bg-transparent border-0 border-b-2 border-brand-black/50 text-2xl font-serif focus:ring-0 focus:border-brand-gold"
              autoFocus
            />
            <button onClick={onClose} className="absolute top-1/2 right-0 -translate-y-1/2 text-brand-black/50 hover:text-brand-black">
              <XIcon className="w-8 h-8"/>
            </button>
          </div>
          
          <div className="mt-8">
            {loading && <div className="flex justify-center"><Spinner /></div>}
            {!loading && results.length > 0 && (
                <ul className="divide-y divide-black/10">
                    {results.map(product => (
                         <li key={product.id}>
                             <a href={`#/product/${product.id}`} onClick={onClose} className="flex items-center gap-4 py-4 hover:bg-black/5 p-2 rounded-md">
                                 <img src={product.images[0]?.thumbnailUrl} alt={product.translations[language]?.title} className="w-16 h-20 object-cover rounded"/>
                                 <div>
                                     <p className="font-semibold">{product.translations[language]?.title}</p>
                                     <p className="text-sm text-brand-black/60">€{(product.price.amount / 100).toFixed(2)}</p>
                                 </div>
                             </a>
                         </li>
                    ))}
                </ul>
            )}
            {!loading && debouncedSearchTerm && results.length === 0 && (
                <p className="text-center text-brand-black/70">No results found for "{debouncedSearchTerm}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
