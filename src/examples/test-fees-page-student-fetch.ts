/**
 * Test script to verify the updated student fetching in the Fees page
 * This script demonstrates how to use the updated getStudentsByClass method
 * from the services/feesService.ts file
 */
import { feesService } from '../services/feesService';

/**
 * Test function to fetch students by class ID
 * @param classId Class ID to test with
 */
export async function testFeesPageStudentFetch(classId: string = 'CLS201') {
  try {
    console.log(`Testing student fetch for class ID: ${classId} using services/feesService.ts`);
    
    // Use the updated getStudentsByClass method
    const students = await feesService.getStudentsByClass(classId);
    
    console.log(`Found ${students.length} students for class ${classId}`);
    
    if (students.length > 0) {
      console.log('First 5 students:');
      students.slice(0, 5).forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (ID: ${student.id}, Photo: ${student.photo_url ? 'Yes' : 'No'}, Admission: ${student.admissionNumber || 'N/A'})`);
      });
    } else {
      console.log('No students found for this class');
    }
    
    return students;
  } catch (error) {
    console.error('Error testing student fetch:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { testFeesPageStudentFetch } from './examples/test-fees-page-student-fetch';
 * 
 * // Test with default class ID (CLS201)
 * testFeesPageStudentFetch()
 *   .then(students => console.log(`Total students: ${students.length}`))
 *   .catch(error => console.error('Test error:', error));
 * 
 * // Test with a specific class ID
 * testFeesPageStudentFetch('CLS202')
 *   .then(students => console.log(`Total students: ${students.length}`))
 *   .catch(error => console.error('Test error:', error));
 * ```
 */
