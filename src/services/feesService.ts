// String Constants
const ERROR_MESSAGES = {
  CREATE_FEE: 'Error creating fee record:',
  UPDATE_FEE: 'Error updating fee record:',
  FETCH_FEES: 'Error fetching fees:',
  FETCH_STUDENTS: 'Error fetching students:',
  FETCH_CLASSES: 'Error fetching classes:',
  FETCH_DETAILS: 'Error fetching fee details:'
};

const SORT_ORDER = {
  DUE_DATE_DESC: { ascending: false }
};

const TABLE_COLUMNS = {
  FEE_WITH_STUDENT: `
    *,
    student:Student (
      *,
      class:Class (*)
    )
  `,
  FEE_WITH_BASIC_STUDENT: `
    *,
    student:Student (
      id,
      name,
      admissionNumber,
      classId,
      class:Class (
        id,
        name,
        section
      )
    )
  `,
  STUDENT_WITH_CLASS: `
    id,
    name,
    admissionNumber,
    classId,
    class:Class (
      id,
      name,
      section
    )
  `,
  STUDENT_BASIC: `
    id,
    name,
    admissionNumber,
    parentName,
    parentContact,
    parentEmail,
    class:Class (
      name,
      section
    )
  `
};

import { supabase } from '@/lib/api-client';
import { FeeStatus, FeeType } from '@/types/fee';
import { v4 as uuidv4 } from 'uuid';
import { studentService } from './student.service';
import { profileService } from './profileService';
import { SCHEMA, FEE_TABLE, STUDENT_TABLE, CLASS_TABLE } from '@/lib/constants'; // Import constants

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
    }
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
        .insert([{
          id: uuidv4(),
          ...feeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error(ERROR_MESSAGES.CREATE_FEE, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_FEE, error);
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
        console.error(ERROR_MESSAGES.UPDATE_FEE, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_FEE, error);
      throw error;
    }
  },

  async getMyFees(email: string) {
    try {
      const student = await studentService.findByEmail(email);
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .select(TABLE_COLUMNS.FEE_WITH_STUDENT)
        .eq('studentId', student?.id)
        .order('dueDate', SORT_ORDER.DUE_DATE_DESC);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_FEES, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_FEES, error);
      throw error;
    }
  },

  async getFeesByStudent(studentId: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(FEE_TABLE)
        .select(TABLE_COLUMNS.FEE_WITH_BASIC_STUDENT)
        .eq('studentId', studentId)
        .order('dueDate', SORT_ORDER.DUE_DATE_DESC);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_FEES, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_FEES, error);
      throw error;
    }
  },

  async getFeesByFilter(filter: FeeFilter) {
    let query = supabase
      .schema(SCHEMA)
      .from(FEE_TABLE)
      .select(TABLE_COLUMNS.FEE_WITH_BASIC_STUDENT);

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

    const { data, error } = await query.order('dueDate', SORT_ORDER.DUE_DATE_DESC);
    if (error) {
      console.error(ERROR_MESSAGES.FETCH_FEES, error);
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
  async getStudentsByClass(classId: string): Promise<{ id: string; name: string; photo_url?: string | null; admissionNumber?: string }[]> {
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
        .select(TABLE_COLUMNS.STUDENT_WITH_CLASS)
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
      console.error(ERROR_MESSAGES.FETCH_STUDENTS, error);
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
        console.error(ERROR_MESSAGES.FETCH_CLASSES, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_CLASSES, error);
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
          student:Student (
            id,
            name,
            admissionNumber,
            parentName,
            parentContact,
            parentEmail,
            class:Class (
              name,
              section
            )
          )
        `)
        .eq('id', feeId)
        .single();

      if (feeError) {
        console.error(ERROR_MESSAGES.FETCH_DETAILS, feeError);
        throw feeError;
      }
      return fee;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_DETAILS, error);
      throw error;
    }
  }
};
