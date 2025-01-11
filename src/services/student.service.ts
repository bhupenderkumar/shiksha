import { supabase, supabaseAdmin } from '@/lib/api-client';

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
        .schema('school')
        .from('Student')
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
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Student')
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
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  async create(studentData: CreateStudentData) {
    try {
      // Create auth user for parent
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: studentData.parentEmail,
        password: `Welcome@${studentData.admissionNumber}`,
        email_confirm: true,
        user_metadata: {
          full_name: studentData.parentName,
          role: 'STUDENT',
          admission_number: studentData.admissionNumber
        }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .schema('school')
        .from('Profile')
        .insert([{
          id: authData.user.id,
          user_id: authData.user.id,
          role: 'STUDENT',
          full_name: studentData.name
        }]);

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Create student record
      const { data: student, error: studentError } = await supabase
        .schema('school')
        .from('Student')
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
          email: studentData.parentEmail,
          password: `Welcome@${studentData.admissionNumber}`,
          username: studentData.name.toLowerCase().replace(/\s+/g, '.')
        }
      };
    } catch (error) {
      console.error('Error creating student:', error);
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
          .schema('school')
          .from('Profile')
          .update({ full_name: data.name })
          .eq('user_id', id);
      }

      const { data: updated, error } = await supabase
        .schema('school')
        .from('Student')
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
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await supabase.schema('school').from('Student').delete().eq('id', id);
      await supabase.schema('school').from('Profile').delete().eq('user_id', id);
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  getByClass(classId: string) {
    return this.findMany({ classId });
  }
}

export const studentService = new StudentService();