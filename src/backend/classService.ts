import { supabase } from '@/lib/api-client';
import { CLASS_TABLE, SCHEMA } from '@/lib/constants';

export const classService = {
  async findMany(params: { schoolId?: string } = {}) {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select(`
          id,
          name,
          section,
          roomNumber,
          capacity,
          schoolId,
          createdAt,
          updatedAt
        `);

      if (params.schoolId) {
        query = query.eq('schoolId', params.schoolId);
      }

      const { data, error } = await query.order('name', { ascending: true });
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

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select(`
          id,
          name,
          section,
          roomNumber,
          capacity,
          schoolId,
          createdAt,
          updatedAt
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching class:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  async getAllClasses() {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select(`
          id,
          name,
          section,
          roomNumber,
          capacity,
          schoolId,
          createdAt,
          updatedAt
        `)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async getAll() {
    return this.findMany();
  }
};