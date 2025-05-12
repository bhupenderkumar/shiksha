import { supabase } from '@/lib/api-client';
import { FeeStatus, FeeType } from '@/types/fee';
import { v4 as uuidv4 } from 'uuid';
import { studentService } from '../services/student.service';
import { SCHEMA, FEE_TABLE, STUDENT_TABLE, CLASS_TABLE } from '@/lib/constants';
import { generateSupabaseRestUrl, generateSupabaseRestHeaders } from '../lib/supabase-helpers';

export interface Fee {
  id: string;
  studentId: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    classId: string;
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
}

export interface FeeFilter {
  classId?: string;
  studentId?: string;
  month?: number;
  year?: number;
  status?: FeeStatus;
}

export const feesService = {
  async createFee(feeData: Omit<Fee, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .insert([
          {
            id: uuidv4(),
            ...feeData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating fee record:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating fee record:', error);
      throw error;
    }
  },

  async updateFee(id: string, feeData: Partial<Fee>) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .update({
          ...feeData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating fee record:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating fee record:', error);
      throw error;
    }
  },

  async getMyFees(email: string) {
    try {
      const student = await studentService.findByEmail(email);
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .select(`
          *,
          student:${STUDENT_TABLE} (
            *,
            class:${CLASS_TABLE} (*)
          )
        `)
        .eq('studentId', student?.id)
        .order('dueDate', { ascending: false });

      if (error) {
        console.error('Error fetching fees:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  },

  async getFeesByStudent(studentId: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .select(`
          *,
          student:${STUDENT_TABLE} (
            id,
            name,
            admissionNumber,
            classId,
            class:${CLASS_TABLE} (
              id,
              name,
              section
            )
          )
        `)
        .eq('studentId', studentId)
        .order('dueDate', { ascending: false });

      if (error) {
        console.error('Error fetching fees:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  },

  async getFeesByFilter(filter: FeeFilter) {
    let query = supabase
      .schema(SCHEMA)
      .from(FEE_TABLE)
      .select(`
        *,
        student:${STUDENT_TABLE} (
          id,
          name,
          admissionNumber,
          classId,
          class:${CLASS_TABLE} (
            id,
            name,
            section
          )
        )
      `);

    if (filter.studentId) {
      query = query.eq('studentId', filter.studentId);
    }
    if (filter.classId) {
      query = query.eq('student.classId', filter.classId);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.month !== undefined && filter.year !== undefined) {
      const startDate = new Date(filter.year, filter.month, 1).toISOString();
      const endDate = new Date(filter.year, filter.month + 1, 0).toISOString();
      query = query.gte('dueDate', startDate).lte('dueDate', endDate);
    }

    const { data, error } = await query.order('dueDate', { ascending: false });
    if (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get students by class ID
   * This method first tries to get students from the IDCard table (which has photos)
   * and falls back to the student service if needed
   * @param classId Class ID
   * @returns Array of students with name and photo URL
   */
  async getStudentsByClass(classId: string): Promise<{ id: string; name: string; photo_url: string | null; admissionNumber?: string }[]> {
    try {
      console.log(`Fetching students for class ID: ${classId}`);

      // First try to get students from IDCard table which has photos
      const { data: idCardData, error: idCardError } = await supabase
        .schema(SCHEMA)
        .from('IDCard')
        .select('id, student_name, student_photo_url, admission_number')
        .eq('class_id', classId);

      if (idCardData && idCardData.length > 0) {
        console.log(`Found ${idCardData.length} students in IDCard table`);

        // Process photo URLs to ensure they're properly formatted
        return idCardData.map(student => {
          // Convert photo URL if needed
          let photoUrl = student.student_photo_url;

          // If it's a relative path, convert to absolute public URL
          if (photoUrl && !photoUrl.startsWith('http')) {
            photoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/File/${photoUrl}`;
          }

          return {
            id: student.id,
            name: student.student_name,
            photo_url: photoUrl,
            admissionNumber: student.admission_number
          };
        });
      }

      // If no data in IDCard, try direct query to Student table
      console.log('No students found in IDCard table, trying Student table directly');

      const { data: studentData, error: studentError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select(`
          id,
          name,
          admissionNumber,
          classId,
          class:Class (
            id,
            name,
            section
          )
        `)
        .eq('classId', classId)
        .order('name');

      if (studentError) {
        console.error('Error fetching from Student table:', studentError);
      } else if (studentData && studentData.length > 0) {
        console.log(`Found ${studentData.length} students in Student table`);
        return studentData.map(student => ({
          id: student.id,
          name: student.name,
          photo_url: null, // Student table doesn't have photos
          admissionNumber: student.admissionNumber
        }));
      }

      // If all else fails, try using the REST API approach
      console.log('Trying REST API approach as last resort');

      try {
        // Build the URL manually to ensure proper encoding
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiPath = '/rest/v1/Student';
        const queryParams = new URLSearchParams({
          'select': 'id,name,admissionNumber,classId',
          'classId': `eq.${classId}`,
          'order': 'name.asc'
        });

        const url = `${baseUrl}${apiPath}?${queryParams.toString()}`;

        // Create headers with Accept-Profile for schema
        const headers = {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Accept-Profile': SCHEMA
        };

        console.log('Fetching with URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Found ${data.length} students using REST API`);

          if (data && data.length > 0) {
            return data.map((student: any) => ({
              id: student.id,
              name: student.name,
              photo_url: null,
              admissionNumber: student.admissionNumber
            }));
          }
        } else {
          const errorText = await response.text();
          console.error('Error with REST API:', response.status, errorText);
        }
      } catch (restError) {
        console.error('Exception with REST API:', restError);
      }

      // If we still have no data, return an empty array
      console.log('No students found for this class with any method');
      return [];
    } catch (error) {
      console.error('Error fetching students by class:', error);
      // Return empty array instead of throwing to match parentFeedbackService behavior
      return [];
    }
  },

  async getClasses() {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id, name, section')
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async getFeeDetails(feeId: string) {
    try {
      const { data: fee, error: feeError } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .select(`
          *,
          student:${STUDENT_TABLE} (
            id,
            name,
            admissionNumber,
            parentName,
            parentContact,
            parentEmail,
            class:${CLASS_TABLE} (
              name,
              section
            )
          )
        `)
        .eq('id', feeId)
        .single();

      if (feeError) {
        console.error('Error fetching fee details:', feeError);
        throw feeError;
      }
      return fee;
    } catch (error) {
      console.error('Error fetching fee details:', error);
      throw error;
    }
  },

  /**
   * Get fees with student data using direct REST API
   * This method uses the REST API directly with proper schema handling
   * @param options Query options
   * @returns Fee data with student information
   */
  async getFeesWithStudentDataREST(options: {
    feeId?: string;
    studentId?: string;
    classId?: string;
    status?: FeeStatus;
  } = {}) {
    try {
      console.log('Fetching fees with student data using REST API');

      // Build query parameters
      const queryParams: Record<string, string> = {
        'select': `*,student:${STUDENT_TABLE}(id,name,admissionNumber,classId,class:${CLASS_TABLE}(id,name,section))`,
        'order': 'dueDate.desc'
      };

      // Add filters if provided
      if (options.feeId) {
        queryParams['id'] = `eq.${options.feeId}`;
      }

      if (options.studentId) {
        queryParams['studentId'] = `eq.${options.studentId}`;
      }

      if (options.status) {
        queryParams['status'] = `eq.${options.status}`;
      }

      // Generate the URL and headers
      const url = generateSupabaseRestUrl(
        import.meta.env.VITE_SUPABASE_URL,
        FEE_TABLE,
        queryParams
      );
      const headers = generateSupabaseRestHeaders(import.meta.env.VITE_SUPABASE_ANON_KEY);

      console.log('Fetching fees with URL:', url);

      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching fees:', response.status, errorText);
        throw new Error(`Error fetching fees: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fees data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching fees with student data:', error);
      throw error;
    }
  }
};