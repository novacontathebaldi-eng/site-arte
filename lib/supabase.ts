import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pycvlkcxgfwsquzolkzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Y3Zsa2N4Z2Z3c3F1em9sa3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDAzNjEsImV4cCI6MjA3ODAxNjM2MX0.YmP6QxGmcWhGUg6vl3fURcudsg3iPyRMdD0Z5u1fEY';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
