import { createClient } from '@supabase/supabase-js';

// As chaves devem ser configuradas como variáveis de ambiente no seu ambiente de hospedagem (Vercel)
// Para desenvolvimento local, você pode criar um arquivo .env.local
// FIX: Replaced import.meta.env with process.env for broader compatibility.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pycvlkcxgfwsquzolkzw.supabase.co';
// FIX: Replaced import.meta.env with process.env for broader compatibility.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Y3Zsa2N4Z2Z3c3F1em9sa3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDAzNjEsImV4cCI6MjA3ODAxNjM2MX0.YmP6QxGmcWhGUg6vl3f1URcudsg3iPyRMdD0Z5u1fEY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
