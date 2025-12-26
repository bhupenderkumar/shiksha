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

/**
 * Get the Supabase URL from environment
 * Works with both cloud (*.supabase.co) and self-hosted instances
 */
export function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL || '';
}

/**
 * Check if a URL is a Supabase storage URL (cloud or self-hosted)
 * Replaces hardcoded 'supabase.co' checks to work with Docker/self-hosted
 * 
 * @param url - URL to check
 * @returns true if the URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  
  const supabaseUrl = getSupabaseUrl();
  
  // Check if it's a cloud Supabase URL
  if (url.includes('supabase.co')) {
    return true;
  }
  
  // Check if it matches our configured Supabase URL (for self-hosted)
  if (supabaseUrl && url.includes(new URL(supabaseUrl).host)) {
    return true;
  }
  
  // Check for standard Supabase storage URL patterns
  return url.includes('/storage/v1/object/');
}

/**
 * Check if a URL is a Supabase signed URL (cloud or self-hosted)
 * 
 * @param url - URL to check
 * @returns true if the URL is a signed Supabase storage URL
 */
export function isSupabaseSignedUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for signed URL pattern in the URL
  return url.includes('/storage/v1/object/sign') && (
    url.includes('supabase.co') || 
    isSupabaseStorageUrl(url)
  );
}

/**
 * Convert a signed Supabase URL to a public URL
 * Works with both cloud and self-hosted instances
 * 
 * @param url - Signed URL to convert
 * @param bucket - Storage bucket name (defaults to 'File')
 * @returns Public URL or original URL if conversion fails
 */
export function convertToPublicStorageUrl(url: string | null, bucket: string = 'File'): string | null {
  if (!url) return null;
  
  const supabaseUrl = getSupabaseUrl();
  
  try {
    // If it's already a public URL, return it as is
    if (url.includes('/storage/v1/object/public/')) {
      return url;
    }
    
    // If it's a signed URL, extract the path and create a public URL
    if (isSupabaseSignedUrl(url)) {
      // Extract the path from the URL - handles both File and other buckets
      const pathMatch = url.match(new RegExp(`\\/${bucket}\\/(.+?)\\?`));
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
      }
    }
    
    // If it's a relative path, convert to absolute public URL
    if (!url.startsWith('http')) {
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
    }
    
    // Return the original URL if we couldn't convert it
    return url;
  } catch (error) {
    console.error('Error converting URL:', error);
    return url;
  }
}

/**
 * Extract file path from a Supabase storage URL
 * 
 * @param url - Supabase storage URL
 * @param bucket - Storage bucket name
 * @returns Extracted file path or null
 */
export function extractFilePathFromUrl(url: string, bucket: string = 'File'): string | null {
  if (!url) return null;
  
  try {
    // Handle signed URLs
    const signedMatch = url.match(new RegExp(`\\/${bucket}\\/(.+?)\\?`));
    if (signedMatch && signedMatch[1]) {
      return decodeURIComponent(signedMatch[1]);
    }
    
    // Handle public URLs
    const publicMatch = url.match(new RegExp(`\\/object\\/public\\/${bucket}\\/(.+)$`));
    if (publicMatch && publicMatch[1]) {
      return decodeURIComponent(publicMatch[1]);
    }
    
    // Handle direct bucket path
    const directMatch = url.match(new RegExp(`\\/${bucket}\\/(.+)$`));
    if (directMatch && directMatch[1]) {
      return decodeURIComponent(directMatch[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
}
