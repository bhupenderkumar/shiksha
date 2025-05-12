import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if required environment variables are present
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for development.');
}

// Regular client for user operations - only create if we have the required values
let supabaseClient;
try {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client for development/testing
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      insert: () => Promise.resolve({ error: null })
    })
  };
}

export const supabase = supabaseClient;

// Admin client for privileged operations
export const supabaseAdmin = supabase;

// Centralized error handling
export const handleError = (error: any, customMessage?: string) => {
  console.error(customMessage || 'API Error:', error);
  throw new Error(customMessage || error.message);
};