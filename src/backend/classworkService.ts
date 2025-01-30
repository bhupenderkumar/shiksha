import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from '../services/fileTableService';
import type { Database } from '../types/supabase';
import { CLASSWORK_TABLE, SCHEMA } from '@/lib/constants';

type FileRow = Database['public']['Tables']['File']['Row'];

interface FileAttachment extends Omit<FileRow, 'fileType'> {
  fileType: string;
}

export interface ClassworkType {
  id: string;
  title: string;
  description: string;
  date: Date;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: FileAttachment[];
  class?: {
    id: string;
    name: string;
    section: string;
    roomNumber?: string;
    capacity?: number;
  };
}

interface CreateClassworkData {
  title: string;
  description: string;
  date: Date;
  classId: string;
  attachments?: Array<{
    fileName: string;
    filePath: string;
    fileType: string;
  }>;
  uploadedBy: string;
}

type UpdateClassworkData = Partial<Omit<CreateClassworkData, 'uploadedBy'>> & {
  uploadedBy?: string;
};

export const classworkService = {
  async getAll(role: string, classId?: string) {
    let query = supabase
      .schema(SCHEMA)
      .from(CLASSWORK_TABLE)
      .select(`
        *,
        class:Class(id, name, section, roomNumber, capacity),
        attachments:File(*)
      `)
      .order('date', { ascending: false });

    if (role === 'STUDENT' && classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as any[]).map(classwork => ({
      ...classwork,
      date: new Date(classwork.date),
      createdAt: new Date(classwork.createdAt),
      updatedAt: new Date(classwork.updatedAt),
    })) as ClassworkType[];
  },

  async create(data: CreateClassworkData, userId: string) {
    try {
      const { attachments, uploadedBy, ...classworkData } = data;
      const classworkId = uuidv4();

      const { data: classwork, error: classworkError } = await supabase
        .schema(SCHEMA)
        .from(CLASSWORK_TABLE)
        .insert([{
          ...classworkData,
          id: classworkId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (classworkError) throw classworkError;

      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          await fileTableService.createFile({
            fileName: file.fileName,
            filePath: file.filePath,
            classworkId: classworkId,
            fileType: file.fileType,
            uploadedBy: uploadedBy
          });
        }
      }

      return classwork;
    } catch (error) {
      console.error('Error creating classwork:', error);
      throw error;
    }
  },

  async update(id: string, data: UpdateClassworkData, userId: string) {
    try {
      const { attachments, uploadedBy, ...classworkData } = data;

      const { data: updatedClasswork, error } = await supabase
        .schema(SCHEMA)
        .from(CLASSWORK_TABLE)
        .update({
          ...classworkData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (attachments) {
        const newFiles = attachments.filter(f => !('id' in f));
        for (const file of newFiles) {
          if (uploadedBy) {
            await fileTableService.createFile({
              fileName: file.fileName,
              filePath: file.filePath,
              classworkId: id,
              fileType: file.fileType,
              uploadedBy
            });
          }
        }
      }

      return updatedClasswork;
    } catch (error) {
      console.error('Error updating classwork:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const files = await fileTableService.getFilesByClassworkId(id);
      const fileIdsToDelete = files.map(file => file.id);

      await Promise.all(fileIdsToDelete.map(fileId => {
        return fileTableService.deleteFile(fileId);
      }));

      const { error } = await supabase
        .schema(SCHEMA)
        .from(CLASSWORK_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting classwork ID ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
};

export const fetchClassworkDetails = async (id: string) => {
  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(CLASSWORK_TABLE)
    .select(`
      *,
      class:Class(
        id,
        name,
        section,
        roomNumber,
        capacity
      ),
      attachments:File(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    date: new Date(data.date),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as ClassworkType;
};