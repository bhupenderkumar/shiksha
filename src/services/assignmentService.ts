import { supabase } from '../lib/api-client';
import { ASSIGNMENT_TABLE } from '../lib/constants';
import { toast } from 'react-hot-toast';

export const loadAssignments = async (date: Date, isEditable: boolean): Promise<Assignment[]> => {
  try {
    const dateStr = date.toISOString().split('T')[0];

    let query = supabase
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
    toast.error('Failed to load assignments');
    console.error('Error:', error);
    return [];
  }
};

export const loadAllAssignments = async (): Promise<Assignment[]> => {
  try {
    const { data, error } = await supabase
      .from(ASSIGNMENT_TABLE)
      .select(`*, assignment_files (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load all assignments');
      console.error(error);
      return [];
    }
    return data || [];
  } catch (error) {
    toast.error('Failed to load all assignments');
    console.error('Error:', error);
    return [];
  }
};

export const createOrUpdateAssignment = async (assignmentData: Partial<Assignment>, editingAssignmentId?: string) => {
  try {
    const { error } = editingAssignmentId
      ? await supabase
          .from(ASSIGNMENT_TABLE)
          .update(assignmentData)
          .eq('id', editingAssignmentId)
      : await supabase
          .from(ASSIGNMENT_TABLE)
          .insert([{ ...assignmentData }]);

    if (error) throw error;

    toast.success(`Assignment ${editingAssignmentId ? 'updated' : 'created'} successfully`);
  } catch (error) {
    toast.error('Failed to save assignment');
    console.error(error);
  }
};

export const deleteAssignment = async (id: string) => {
  try {
    const { error } = await supabase.from(ASSIGNMENT_TABLE).delete().eq('id', id);
    if (error) throw error;

    toast.success('Assignment deleted successfully');
  } catch (error) {
    toast.error('Failed to delete assignment');
    console.error(error);
  }
}; 