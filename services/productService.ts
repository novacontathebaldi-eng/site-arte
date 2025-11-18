
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Could not fetch products.');
  }
  return data as Product[];
};


export const fetchFeaturedProducts = async (limit = 4): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('createdAt', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured products:', error);
        throw new Error('Could not fetch featured products.');
    }

    return data as Product[];
};