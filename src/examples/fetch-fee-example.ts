import { feesService } from '../backend/feesService';

/**
 * Example function to fetch fee data with student information
 * This example demonstrates how to use the feesService to fetch fee data
 * with student information using both the Supabase client and direct REST API
 */
export async function fetchFeeExample() {
  try {
    console.log('Fetching fee data with student information...');

    // Method 1: Using the Supabase client with schema parameter
    console.log('Method 1: Using Supabase client with schema parameter');
    try {
      const feeData = await feesService.getFeesByFilter({});
      console.log('Fee data using Supabase client:', feeData);
      
      if (feeData && feeData.length > 0) {
        console.log('First fee:', feeData[0]);
        console.log('Student name:', feeData[0].student?.name);
        console.log('Class name:', feeData[0].student?.class?.name);
      } else {
        console.log('No fee data found using Supabase client');
      }
    } catch (error) {
      console.error('Error using Supabase client:', error);
    }

    // Method 2: Using direct REST API with proper schema handling
    console.log('Method 2: Using direct REST API with proper schema handling');
    try {
      const feeDataREST = await feesService.getFeesWithStudentDataREST({});
      console.log('Fee data using REST API:', feeDataREST);
      
      if (feeDataREST && feeDataREST.length > 0) {
        console.log('First fee:', feeDataREST[0]);
        console.log('Student name:', feeDataREST[0].student?.name);
        console.log('Class name:', feeDataREST[0].student?.class?.name);
      } else {
        console.log('No fee data found using REST API');
      }
    } catch (error) {
      console.error('Error using REST API:', error);
    }

    return 'Fee data fetching example completed';
  } catch (error) {
    console.error('Error in fetchFeeExample:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { fetchFeeExample } from './examples/fetch-fee-example';
 * 
 * // Call the example function
 * fetchFeeExample()
 *   .then(result => console.log(result))
 *   .catch(error => console.error('Error:', error));
 * ```
 */
