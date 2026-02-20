import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { SCHEMA } from './constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if required environment variables are present
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for development.');
}

// Supabase client — all operations use the anon key with RLS enforced
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: SCHEMA,
  },
});

// @deprecated Use `supabase` directly. Kept temporarily for backward compatibility.
export const supabaseAdmin = supabase;

// Centralized error handling
export const handleError = (error: any, customMessage?: string) => {
  console.error(customMessage || 'API Error:', error);
  throw new Error(customMessage || error.message);
};