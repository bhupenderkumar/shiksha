import { supabase } from "@/lib/api-client";
import { CLASS_TABLE, SCHEMA } from '../lib/constants'; // Import SCHEMA

// String Constants
const ERROR_MESSAGES = {
  FETCH_CLASSES: 'Error fetching classes:',
  FETCH_CLASS: 'Error fetching class:',
  CREATE_CLASS: 'Error creating class:',
  UPDATE_CLASS: 'Error updating class:',
  DELETE_CLASS: 'Error deleting class:'
};

const SORT_ORDER = {
  NAME_ASC: { ascending: true }
};

const TABLE_COLUMNS = `
  id,
  name,
  section,
  roomNumber,
  capacity,
  schoolId,
  createdAt,
  updatedAt
`;

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
        .schema(SCHEMA) // Use SCHEMA constant
        .from(CLASS_TABLE)
        .select(TABLE_COLUMNS);

      if (params.schoolId) {
        query = query.eq('schoolId', params.schoolId);
      }

      const { data, error } = await query.order('name', SORT_ORDER.NAME_ASC);
      if (error) {
        console.error(ERROR_MESSAGES.FETCH_CLASSES, error);
        throw error;
      }

      return data as ClassType[];
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_CLASSES, error);
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
        .schema(SCHEMA) // Use SCHEMA constant
        .from(CLASS_TABLE)
        .select(TABLE_COLUMNS)
        .eq('id', id)
        .single();

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_CLASS, error);
        throw error;
      }
      return data as ClassType;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_CLASS, error);
      throw error;
    }
  }

  /**
   * Get all classes ordered by name
   * @returns Promise<ClassType[]>
   */
  async getAllClasses() {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select(TABLE_COLUMNS)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_CLASSES, error);
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
