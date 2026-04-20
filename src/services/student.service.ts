// String Constants
const DEFAULT_PASSWORD_PREFIX = 'Welcome@';
const STUDENT_ROLE = 'STUDENT';
const SCHOOL_EMAIL_DOMAIN = 'myfirststepschool.com';
const ERROR_MESSAGES = {
  FETCH_STUDENTS: 'Error fetching students:',
  FETCH_STUDENT: 'Error fetching student:',
  CREATE_STUDENT: 'Error creating student:',
  UPDATE_STUDENT: 'Error updating student:',
  DELETE_STUDENT: 'Error deleting student:'
};

import { supabase, supabaseAdmin } from '@/lib/api-client';
import { STUDENT_TABLE, SCHEMA } from '../lib/constants';

export interface StudentCredentials {
  email: string;
  password: string;
  username: string;
}

export interface CreateStudentData {
  admissionNumber: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  contactNumber: string;
  parentName: string;
  parentContact: string;
  parentEmail: string; // Keep this as it's in the schema
  bloodGroup?: string;
  classId: string;
}

export interface Student extends CreateStudentData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  class?: {
    id: string;
    name: string;
    section: string;
  };
}

class StudentService {
  async findMany(params: { classId?: string } = {}) {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          )
        `);

      if (params.classId) {
        query = query.eq('classId', params.classId);
      }

      const { data, error } = await query.order('name');
      if (error) throw error;

      return data as Student[];
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_STUDENTS, error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Student;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_STUDENT, error);
      throw error;
    }
  }

  async getAllStudents(): Promise<Student[]> {
    return this.findMany();
  }

  // Generate school email from student name and admission number
  private generateStudentEmail(name: string, admissionNumber: string): string {
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    return `${sanitizedName}.${admissionNumber.toLowerCase()}@${SCHOOL_EMAIL_DOMAIN}`;
  }

  async create(studentData: CreateStudentData) {
    try {
      // Generate school email for the student
      const studentEmail = this.generateStudentEmail(studentData.name, studentData.admissionNumber);
      
      // Create auth user with school email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: studentEmail,
        password: `${DEFAULT_PASSWORD_PREFIX}${studentData.admissionNumber}`,
        email_confirm: true,
        user_metadata: {
          full_name: studentData.name,
          parent_name: studentData.parentName,
          parent_email: studentData.parentEmail,
          role: STUDENT_ROLE,
          admission_number: studentData.admissionNumber
        }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .schema(SCHEMA)
        .from('Profile')
        .insert([{
          id: authData.user.id,
          user_id: authData.user.id,
          role: STUDENT_ROLE,
          full_name: studentData.name,
          email: studentEmail
        }]);

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Create student record
      const { data: student, error: studentError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .insert([{
          id: authData.user.id,
          ...studentData,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          )
        `)
        .single();

      if (studentError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw studentError;
      }

      return {
        student,
        credentials: {
          email: studentEmail,
          password: `${DEFAULT_PASSWORD_PREFIX}${studentData.admissionNumber}`,
          username: studentData.name.toLowerCase().replace(/\s+/g, '.')
        }
      };
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_STUDENT, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateStudentData>) {
    try {
      if (data.name) {
        // Update auth user metadata
        await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: { full_name: data.name }
        });

        // Update profile
        await supabase
          .schema(SCHEMA)
          .from('Profile')
          .update({ full_name: data.name })
          .eq('user_id', id);
      }

      const { data: updated, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .update({
          ...data,
          updatedAt: new Date()
        })
        .eq('id', id)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          )
        `)
        .single();

      if (error) throw error;
      return updated as Student;
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_STUDENT, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await supabase.schema(SCHEMA).from(STUDENT_TABLE).delete().eq('id', id);
      await supabase.schema(SCHEMA).from('Profile').delete().eq('user_id', id);
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_STUDENT, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select(`*, class:Class (id, name, section)`)
        .eq('parentEmail', email)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student by email:', error);
      return null;
    }
  }

  getByClass(classId: string) {
    return this.findMany({ classId });
  }

  async getStudentsByClass(classId: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_TABLE)
        .select('id, name, admissionNumber, classId')
        .eq('classId', classId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw error;
    }
  }
}

export const studentService = new StudentService();