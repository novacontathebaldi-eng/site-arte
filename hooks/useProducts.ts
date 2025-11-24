
import { useQuery } from '@tanstack/react-query';
import { getCollection } from '../lib/firebase/firestore';
import { Product, ProductCategory } from '../types/product';

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await getCollection('products');
      
      // Map and validate data robustly
      const products = data.map((doc: any) => {
        // Handle legacy images (string[]) vs new images (ProductImage[])
        const rawImages = doc.images || [];
        const processedImages = Array.isArray(rawImages) 
            ? rawImages.map((img: any, idx: number) => {
                if (typeof img === 'string') {
                    return { id: idx.toString(), url: img, alt: doc.title || 'Artwork', isThumbnail: idx === 0 };
                }
                return img;
            })
            : [];

        return {
          id: doc.id,
          sku: doc.sku || '',
          slug: doc.slug || '',
          
          translations: doc.translations || { 
            fr: { title: doc.title || 'Untitled', description: doc.description || '' },
            en: { title: doc.title || 'Untitled', description: doc.description || '' }
          },
          
          price: doc.price || 0,
          category: doc.category || ProductCategory.PAINTINGS,
          
          images: processedImages,
          
          available: doc.available ?? true,
          status: doc.status || (doc.available ? 'active' : 'sold'),
          stock: doc.stock || 1,
          
          dimensions: doc.dimensions || { height: 0, width: 0, depth: 0, unit: 'cm' },
          weight: doc.weight || 0,
          medium: doc.medium || '',
          year: doc.year || new Date().getFullYear(),
          framing: doc.framing || 'unframed',
          authenticity_certificate: doc.authenticity_certificate ?? true,
          signature: doc.signature ?? true,
          
          featured: doc.featured || false,
          displayOrder: doc.displayOrder || 0,
          createdAt: doc.createdAt,
          tags: doc.tags || []
        };
      }) as Product[];

      return products;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
