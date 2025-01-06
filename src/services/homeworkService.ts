import { supabase } from '@/lib/supabase';
import { HomeworkStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { uploadFile, deleteFile } from './fileService';

export interface HomeworkType {
  id: string;
  title: string;
  description: string;
  dueDate: Date | string;
  studentId: string;
  subjectId: string;
  classId: string;
  status: HomeworkStatus;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: Array<{ id: string; fileName: string }>;
}

export interface FileType {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}

export const loadHomeworks = async (userId: string, role: string) => {
  try {
    if (role === 'ADMIN' || role === 'TEACHER') {
      // Get all homeworks for admin/teacher
      const { data, error } = await supabase
      .schema('school')
        .from('Homework')
        .select(`
          *,
          subject:subjectId(*),
          class:classId(*),
          attachments:File(*)
        `);

      if (error) throw error;
      return data;
    } else {
      // For students, first get their profile to know their classId
      const { data: profile, error: profileError } = await supabase
        .schema('school')
      .from('Student')
        .select('classId')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Then get homeworks for their class
      const { data, error } = await supabase
      .schema('school')
        .from('Homework')
        .select(`
          *,
          subject:subjectId(*),
          class:classId(*),
          attachments:File(*),
          submissions:HomeworkSubmission(*)
        `)
        .eq('classId', profile.classId);

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error loading homeworks:', error);
    throw error;
  }
};

export const createHomework = async (homework: Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Homework')
      .insert([{
        ...homework,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating homework:', error);
    throw error;
  }
};

export const updateHomework = async (id: string, homework: Partial<HomeworkType>) => {
  try {
    const { data, error } = await supabase
    .schema('school')
      .from('Homework')
      .update({
        ...homework,
        updatedAt: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating homework:', error);
    throw error;
  }
};

export const deleteHomework = async (id: string) => {
  try {
    const { error } = await supabase
    .schema('school')
      .from('Homework')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting homework:', error);
    throw error;
  }
};

export const uploadHomeworkFile = async (file: File, homeworkId: string) => {
  return uploadFile(file, `homeworks/${homeworkId}`, { homeworkId });
};

export const deleteHomeworkFile = async (fileId: string) => {
  return deleteFile(fileId);
};

export const loadSubjects = async () => {
  try {
    const { data, error } = await supabase
    .schema('school')
      .from('Subject')
      .select('id, name, code');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading subjects:', error);
    throw error;
  }
};
