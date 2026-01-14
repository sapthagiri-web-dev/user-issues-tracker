import { createClient } from '@supabase/supabase-js';

// Access environment variables efficiently
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn during development if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase URL or Anon Key is missing! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
