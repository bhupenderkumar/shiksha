import { SCHEMA } from './constants';

/**
 * Generates a Supabase REST API URL with proper schema handling
 * 
 * @param baseUrl - The Supabase project URL (e.g., https://ytfzqzjuhcdgcvvqihda.supabase.co)
 * @param table - The table name without schema prefix
 * @param query - The query parameters (select, order, etc.)
 * @returns The complete URL with schema handling
 */
export function generateSupabaseRestUrl(
  baseUrl: string,
  table: string,
  query: Record<string, string>
): string {
  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Construct the URL path
  const path = `/rest/v1/${table}`;
  
  // Convert query object to URL search params
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  
  // Return the complete URL
  return `${cleanBaseUrl}${path}?${searchParams.toString()}`;
}

/**
 * Generates headers for Supabase REST API requests with schema handling
 * 
 * @param apiKey - The Supabase API key
 * @returns Headers object with proper schema handling
 */
export function generateSupabaseRestHeaders(apiKey: string): Record<string, string> {
  return {
    'apikey': apiKey,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Accept-Profile': SCHEMA // Use the schema from constants
  };
}

/**
 * Example usage:
 * 
 * // Import environment variables
 * const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
 * const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
 * 
 * // Generate URL for fetching fees with student data
 * const url = generateSupabaseRestUrl(
 *   SUPABASE_URL,
 *   'Fee',
 *   {
 *     'select': '*,student:Student(id,name,admissionNumber,classId,class:Class(id,name,section))',
 *     'order': 'dueDate.desc'
 *   }
 * );
 * 
 * // Generate headers
 * const headers = generateSupabaseRestHeaders(SUPABASE_ANON_KEY);
 * 
 * // Make the fetch request
 * fetch(url, { method: 'GET', headers })
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Error:', error));
 */
