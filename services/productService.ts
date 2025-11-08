import { supabase } from '../lib/supabase';
import { ProductFilters, SupabaseProduct } from '../types';

export const fetchProducts = async (filters: ProductFilters): Promise<{
    products: SupabaseProduct[],
    total: number | null,
    totalPages: number
}> => {
  // O select busca produtos e suas imagens relacionadas (de product_images)
  let query = supabase.from('products').select('*, product_images(*)', { count: 'exact' });

  if (filters.category?.length) {
    query = query.in('category', filters.category);
  }

  if (filters.minPrice) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

  if (filters.technique?.length) {
    // Checa se os arrays de técnicas se sobrepõem (PostgreSQL array overlap)
    query = query.overlaps('technique', filters.technique);
  }

  if (filters.available !== undefined) {
    query = query.eq('available', filters.available);
  }

  if (filters.yearMin) query = query.gte('year', filters.yearMin);
  if (filters.yearMax) query = query.lte('year', filters.yearMax);

  // Ordenação
  switch (filters.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
  }

  // Paginação
  const limit = filters.limit || 12;
  const offset = ((filters.page || 1) - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data as SupabaseProduct[],
    total: count,
    totalPages: Math.ceil((count || 0) / limit)
  };
};

export const searchProducts = async (query: string, language: string): Promise<SupabaseProduct[]> => {
  // Realiza uma busca full-text na chave de idioma especificada dentro da coluna JSONB 'title'.
  // O banco de dados precisa de índices apropriados para performance.
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .textSearch(`title->>${language}`, `'${query}'`, {
      type: 'websearch',
      config: 'english' // Assumindo config padrão; pode precisar de configs por idioma.
    });

  if (error) throw error;
  return data as SupabaseProduct[];
};

export const getProductWithImages = async (productId: string): Promise<SupabaseProduct | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_dimensions(*)')
    .eq('id', productId)
    .single();
    
  if (error) {
      if (error.code === 'PGRST116') return null; // "Not found" não é um erro
      throw error;
  }
  return data as SupabaseProduct | null;
};
