import { supabase } from '@/lib/api-client';

export class StudentService {
  async findMany(params: { classId?: string } = {}) {
    let query = supabase
      .schema('school')
      .from('Student')
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
    }));
  }

  async getByClass(classId: string) {
    return this.findMany({ classId });
  }

  async findOne(id: string) {
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
    return data;
  }

  async create(data: any) {
    const { data: created, error } = await supabase
      .schema('school')
      .from('Student')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async update(id: string, data: any) {
    const { data: updated, error } = await supabase
      .schema('school')
      .from('Student')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async delete(id: string) {
    const { error } = await supabase
      .schema('school')
      .from('Student')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Create a singleton instance
export const studentService = new StudentService(); 