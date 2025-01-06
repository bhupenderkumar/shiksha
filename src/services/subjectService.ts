import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

export interface SubjectType {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const loadSubjects = async (classId?: string) => {
  try {
    let query = supabase
      .schema('school')
      .from('Subject')
      .select(`
        *,
        class:classId(*),
        teacher:teacherId(*)
      `);

    if (classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading subjects:', error);
    throw error;
  }
};

export const createSubject = async (subject: Omit<SubjectType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Subject')
      .insert([{
        ...subject,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (id: string, subject: Partial<SubjectType>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Subject')
      .update({
        ...subject,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (id: string) => {
  try {
    const { error } = await supabase
      .schema('school')
      .from('Subject')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
