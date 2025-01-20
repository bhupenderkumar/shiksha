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

  async getStudentsByClass(classId: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select(TABLE_COLUMNS.STUDENT_WITH_CLASS)
        .eq('classId', classId)
        .order('name');

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_STUDENTS, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_STUDENTS, error);
      throw error;
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
