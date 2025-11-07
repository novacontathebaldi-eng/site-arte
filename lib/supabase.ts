import { createClient } from '@supabase/supabase-js';

// As chaves são lidas das variáveis de ambiente (configuradas no Vercel).
// O prefixo VITE_ é padrão para projetos baseados em Vite/React para expor variáveis ao frontend.
// NOTA: Para este ambiente de desenvolvimento, estamos inserindo as chaves diretamente.
// A sua configuração no Vercel com process.env está correta para produção.
const supabaseUrl = "https://pycvlkcxgfwsquzolkzw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Y3Zsa2N4Z2Z3c3F1em9sa3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDAzNjEsImV4cCI6MjA3ODAxNjM2MX0.YmP6QxGmcWhGUg6vl3f1URcudsg3iPyRMdD0Z5u1fEY";


if (!supabaseUrl || !supabaseAnonKey) {
  // Esta mensagem de erro será exibida se as variáveis de ambiente não forem encontradas.
  throw new Error("Supabase URL and Anon Key must be provided.");
}

// Cria e exporta o cliente Supabase que será usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
