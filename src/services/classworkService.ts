import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ClassworkType {
  id: string;
  title: string;
  description: string;
  date: Date;
  classId: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: Array<{ id: string; fileName: string }>;
}

export const loadClassworks = async (classId?: string) => {
  try {
    let query = supabase
      .schema('school')
      .from('Classwork')
      .select(`
        *,
        class:classId(*),
        attachments:File(*)
      `);

    if (classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading classworks:', error);
    throw error;
  }
};

export const createClasswork = async (classwork: Omit<ClassworkType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Classwork')
      .insert([{
        ...classwork,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating classwork:', error);
    throw error;
  }
};

export const updateClasswork = async (id: string, classwork: Partial<ClassworkType>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Classwork')
      .update({
        ...classwork,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating classwork:', error);
    throw error;
  }
};

export const deleteClasswork = async (id: string) => {
  try {
    const { error } = await supabase
      .schema('school')
      .from('Classwork')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting classwork:', error);
    throw error;
  }
};

