/**
 * Test script to verify student data fetching
 * This script demonstrates different approaches to fetch student data
 */

// Import environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SCHEMA = 'school';

/**
 * Fetch students by class ID using direct REST API
 * @param classId Class ID to filter by
 * @returns Student data
 */
export async function fetchStudentsByClassREST(classId: string) {
  try {
    console.log(`Fetching students for class ID: ${classId} using REST API`);
    
    // Build the URL manually to ensure proper encoding
    const baseUrl = SUPABASE_URL;
    const apiPath = '/rest/v1/Student';
    const queryParams = new URLSearchParams({
      'select': 'id,name,admissionNumber,classId',
      'classId': `eq.${classId}`,
      'order': 'name.asc'
    });
    
    const url = `${baseUrl}${apiPath}?${queryParams.toString()}`;
    
    // Create headers with Accept-Profile for schema
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': SCHEMA
    };
    
    console.log('Fetching with URL:', url);
    console.log('Headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Found ${data.length} students using REST API`);
      console.log('Student data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Error with REST API:', response.status, errorText);
      throw new Error(`Error fetching students: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}

/**
 * Fetch students by class ID using direct SQL query
 * @param classId Class ID to filter by
 * @returns Student data
 */
export async function fetchStudentsByClassSQL(classId: string) {
  try {
    console.log(`Fetching students for class ID: ${classId} using SQL query`);
    
    // Escape single quotes in the classId to prevent SQL injection
    const safeClassId = classId.replace(/'/g, "''");
    
    // Create a SQL query that handles case-sensitive column names
    const query = `
      SELECT 
        id, 
        name, 
        "admissionNumber", 
        "classId"
      FROM 
        school."Student" 
      WHERE 
        "classId" = '${safeClassId}' 
      ORDER BY 
        name
    `;
    
    // Build the URL for the RPC endpoint
    const url = `${SUPABASE_URL}/rest/v1/rpc/execute_sql`;
    
    // Create headers
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Executing SQL query:', query);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sql: query })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Found ${data.length} students using SQL query`);
      console.log('Student data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Error with SQL query:', response.status, errorText);
      throw new Error(`Error executing SQL query: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { fetchStudentsByClassREST, fetchStudentsByClassSQL } from './examples/test-student-fetch';
 * 
 * // Test with REST API
 * fetchStudentsByClassREST('CLS201')
 *   .then(data => console.log('REST API result:', data))
 *   .catch(error => console.error('REST API error:', error));
 * 
 * // Test with SQL query
 * fetchStudentsByClassSQL('CLS201')
 *   .then(data => console.log('SQL query result:', data))
 *   .catch(error => console.error('SQL query error:', error));
 * ```
 */
