import { supabase, handleError } from '@/lib/api-client';
import type { Student } from '@/types/student';

export class StudentService {
  // Fetch multiple students
  async findMany(params: { classId?: string } = {}) {
    try {
      let query = supabase
        .schema('school')
        .from('Students')
        .select(`
          id,
          name,
          admissionNumber,
          dateOfBirth,
          gender,
          contactNumber,
          parentName,
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
      return data.map(student => ({
        ...student,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null
      })) as Student[];
    } catch (error) {
      handleError(error, 'Error fetching students');
    }
  }

  async getByClass(classId: string) {
    return this.findMany({ classId });
  }

  async findOne(id: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Students')
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
      handleError(error, 'Error fetching student');
    }
  }

  async create(data: any) {
    try {
      const { data: created, error } = await supabase
        .schema('school')
        .from('Students')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return created as Student;
    } catch (error) {
      handleError(error, 'Error creating student');
    }
  }

  async update(id: string, data: any) {
    try {
      const { data: updated, error } = await supabase
        .schema('school')
        .from('Students')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Student;
    } catch (error) {
      handleError(error, 'Error updating student');
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase
        .schema('school')
        .from('Students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'Error deleting student');
    }
  }
}

// Create a singleton instance
export const studentService = new StudentService();