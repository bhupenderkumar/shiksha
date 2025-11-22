import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { SCHEMA } from './constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if required environment variables are present
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for development.');
}

// Regular client for user operations
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: SCHEMA,
  },
});

// Admin client for privileged operations
export const supabaseAdmin = supabase;

// Centralized error handling
export const handleError = (error: any, customMessage?: string) => {
  console.error(customMessage || 'API Error:', error);
  throw new Error(customMessage || error.message);
};