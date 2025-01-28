import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;


console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);
console.log('Service Role Key:', supabaseServiceRoleKey);

// Check if required environment variables are present
// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Missing required Supabase environment variables');
// }

// Regular client for user operations
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);


// Admin client for privileged operations
export const supabaseAdmin = supabase;
// Admin client for privileged operations
// export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

// Centralized error handling
export const handleError = (error: any, customMessage?: string) => {
  console.error(customMessage || 'API Error:', error);
  throw new Error(customMessage || error.message);
}; 