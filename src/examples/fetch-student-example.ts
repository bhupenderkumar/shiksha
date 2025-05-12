import { generateSupabaseRestUrl, generateSupabaseRestHeaders } from '../lib/supabase-helpers';

/**
 * Example function to fetch student data with proper schema handling
 * 
 * @param supabaseUrl - The Supabase project URL
 * @param supabaseKey - The Supabase API key
 * @param studentId - Optional student ID to filter by
 * @param classId - Optional class ID to filter by
 * @returns The student data
 */
export async function fetchStudentData(
  supabaseUrl: string,
  supabaseKey: string,
  studentId?: string,
  classId?: string
) {
  // Build the query parameters
  const queryParams: Record<string, string> = {
    'select': '*,class:Class(id,name,section)'
  };
  
  // Add filters if provided
  if (studentId) {
    queryParams['id'] = `eq.${studentId}`;
  }
  
  if (classId) {
    queryParams['classId'] = `eq.${classId}`;
  }
  
  // Generate the URL and headers
  const url = generateSupabaseRestUrl(supabaseUrl, 'Student', queryParams);
  const headers = generateSupabaseRestHeaders(supabaseKey);
  
  // Make the request
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching student data: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student data:', error);
    throw error;
  }
}

/**
 * Example function to fetch fee data with student information
 * 
 * @param supabaseUrl - The Supabase project URL
 * @param supabaseKey - The Supabase API key
 * @param feeId - Optional fee ID to filter by
 * @param studentId - Optional student ID to filter by
 * @returns The fee data with student information
 */
export async function fetchFeeWithStudentData(
  supabaseUrl: string,
  supabaseKey: string,
  feeId?: string,
  studentId?: string
) {
  // Build the query parameters
  const queryParams: Record<string, string> = {
    'select': '*,student:Student(id,name,admissionNumber,classId,class:Class(id,name,section))',
    'order': 'dueDate.desc'
  };
  
  // Add filters if provided
  if (feeId) {
    queryParams['id'] = `eq.${feeId}`;
  }
  
  if (studentId) {
    queryParams['studentId'] = `eq.${studentId}`;
  }
  
  // Generate the URL and headers
  const url = generateSupabaseRestUrl(supabaseUrl, 'Fee', queryParams);
  const headers = generateSupabaseRestHeaders(supabaseKey);
  
  // Make the request
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching fee data: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching fee data:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { fetchFeeWithStudentData } from './examples/fetch-student-example';
 * 
 * // Get environment variables
 * const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
 * const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
 * 
 * // Fetch fee data with student information
 * const feeData = await fetchFeeWithStudentData(SUPABASE_URL, SUPABASE_ANON_KEY);
 * console.log('Fee data:', feeData);
 * ```
 */
