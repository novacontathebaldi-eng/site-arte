
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { Product, ProductCategory } from '../types/product';

export const useProducts = () => {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Real-time listener using onSnapshot
    // We order by 'displayOrder' to match the Admin's drag-and-drop order
    // This ensures full synchronization between Admin and Catalog
    const q = query(collection(db, 'products'), orderBy('displayOrder', 'asc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const products = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Data validation and mapping
          const rawImages = data.images || [];
          const processedImages = Array.isArray(rawImages) 
              ? rawImages.map((img: any, idx: number) => {
                  if (typeof img === 'string') {
                      return { id: idx.toString(), url: img, alt: data.title || 'Artwork', isThumbnail: idx === 0 };
                  }
                  return img;
              })
              : [];

          // Robust fallback for translations
          const defaultTrans = { title: 'Untitled', description: '' };
          const trans = data.translations || {};

          return {
            id: doc.id,
            sku: data.sku || '',
            slug: data.slug || '',
            
            translations: { 
              fr: trans.fr || defaultTrans,
              en: trans.en || defaultTrans,
              pt: trans.pt || defaultTrans,
              de: trans.de || defaultTrans
            },
            
            price: data.price || 0,
            category: data.category || ProductCategory.PAINTINGS,
            
            images: processedImages,
            
            status: data.status || 'active',
            stock: data.stock || 1,
            
            dimensions: data.dimensions || { height: 0, width: 0, depth: 0, unit: 'cm' },
            weight: data.weight || 0,
            medium: data.medium || '',
            year: data.year || new Date().getFullYear(),
            framing: data.framing || 'unframed',
            authenticity_certificate: data.authenticity_certificate ?? true,
            signature: data.signature ?? true,
            
            featured: data.featured || false,
            displayOrder: data.displayOrder || 0,
            createdAt: data.createdAt,
            tags: data.tags || []
          } as Product;
        });

        setData(products);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { data, isLoading, error };
};
