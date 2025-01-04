import { supabase } from '../lib/supabase';
import { Homework } from '@prisma/client';
import { toast } from 'react-hot-toast';

export const loadHomeworks = async (date: Date, isEditable: boolean): Promise<Homework[]> => {
  try {
    const dateStr = date.toISOString().split('T')[0];

    let query = supabase
      .from('homework') // Ensure this matches your database table name
      .select(`
        *,
        homework_files (
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
    toast.error('Failed to load homeworks');
    console.error('Error:', error);
    return [];
  }
};

export const loadAllHomeworks = async (): Promise<Homework[]> => {
  try {
    const { data, error } = await supabase
      .from('homework') // Ensure this matches your database table name
      .select(`*, homework_files (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load all homeworks');
      console.error(error);
      return [];
    }
    return data || [];
  } catch (error) {
    toast.error('Failed to load all homeworks');
    console.error('Error:', error);
    return [];
  }
};

export const createOrUpdateHomework = async (homeworkData: Partial<Homework>, editingHomeworkId?: string) => {
  try {
    const { error } = editingHomeworkId
      ? await supabase
          .from('homework') // Ensure this matches your database table name
          .update(homeworkData)
          .eq('id', editingHomeworkId)
      : await supabase
          .from('homework') // Ensure this matches your database table name
          .insert([{ ...homeworkData }]);

    if (error) throw error;

    toast.success(`Homework ${editingHomeworkId ? 'updated' : 'created'} successfully`);
  } catch (error) {
    toast.error('Failed to save homework');
    console.error(error);
  }
};

export const deleteHomework = async (id: string) => {
  try {
    const { error } = await supabase.from('homework').delete().eq('id', id); // Ensure this matches your database table name
    if (error) throw error;

    toast.success('Homework deleted successfully');
  } catch (error) {
    toast.error('Failed to delete homework');
    console.error(error);
  }
}; 