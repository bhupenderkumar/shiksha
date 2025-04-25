import { supabase } from '@/lib/api-client';
import { ASSIGNMENT_TABLE, SCHEMA } from '@/lib/constants';

export const assignmentService = {
  async loadAssignments(date: Date, isEditable: boolean) {
    try {
      const dateStr = date.toISOString().split('T')[0];

      let query = supabase
        .schema(SCHEMA)
        .from(ASSIGNMENT_TABLE)
        .select(`
          *,
          assignment_files (
            id,
            file_path,
            file_type,
            file_name,
            uploaded_at,
            uploaded_by
          )
        `)
        .order('created_at', { ascending: false });

      if (!isEditable) {
        query = query.eq('assignment_date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load assignments:', error);
      return [];
    }
  },

  async loadAllAssignments() {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(ASSIGNMENT_TABLE)
        .select(`*, assignment_files (*)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load all assignments:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Failed to load all assignments:', error);
      return [];
    }
  },

  async createOrUpdateAssignment(assignmentData: any, editingAssignmentId?: string) {
    try {
      alert(editingAssignmentId)
      const { error } = editingAssignmentId
        ? await supabase
            .schema(SCHEMA)
            .from(ASSIGNMENT_TABLE)
            .update(assignmentData)
            .eq('id', editingAssignmentId)
        : await supabase
            .schema(SCHEMA)
            .from(ASSIGNMENT_TABLE)
            .insert([{ ...assignmentData }]);

      if (error) throw error;

      console.log(`Assignment ${editingAssignmentId ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  },

  async deleteAssignment(id: string) {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(ASSIGNMENT_TABLE)
        .delete()
        .eq('id', id);
      if (error) throw error;

      console.log('Assignment deleted successfully');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  }
};