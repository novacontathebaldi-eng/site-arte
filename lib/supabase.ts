import { createClient } from '@supabase/supabase-js';

// As chaves são lidas das variáveis de ambiente (configuradas no Vercel).
// O prefixo VITE_ é padrão para projetos baseados em Vite/React para expor variáveis ao frontend.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in VITE_ environment variables.");
}

// Cria e exporta o cliente Supabase que será usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
