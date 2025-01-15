import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { SUBJECT_TABLE } from '../lib/constants';

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
      .from(SUBJECT_TABLE)
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
      .from(SUBJECT_TABLE)
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
      .from(SUBJECT_TABLE)
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
      .from(SUBJECT_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
