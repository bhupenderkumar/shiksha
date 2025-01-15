import { supabase } from "@/lib/api-client";
import { CLASS_TABLE } from '../lib/constants';

export interface ClassType {
  id: string;
  name: string;
  section: string;
  roomNumber?: string;
  capacity: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

class ClassService {
  /**
   * Find multiple classes with optional filtering
   * @param params Optional parameters for filtering
   * @returns Promise<ClassType[]>
   */
  async findMany(params: { schoolId?: string } = {}) {
    try {
      let query = supabase
        .schema('school')
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

      const { data, error } = await query.order('name');
      if (error) throw error;

      return data as ClassType[];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  /**
   * Get a single class by ID
   * @param id The class ID
   * @returns Promise<ClassType>
   */
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
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

      if (error) throw error;
      return data as ClassType;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  /**
   * Alias for findMany() for backward compatibility
   */
  async getAll() {
    return this.findMany();
  }
}

export const classService = new ClassService();

