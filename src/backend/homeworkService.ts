import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from '../services/fileTableService';
import type { Database } from '../types/supabase';
import { HOMEWORK_TABLE, SCHEMA } from '@/lib/constants';
import { profileService } from '../services/profileService';

type FileAttachment = Database['public']['Tables']['File']['Row'];

export interface HomeworkType {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  subjectId: string;
  classId: string;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
  attachments?: FileAttachment[];
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export type HomeworkStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SUBMITTED';

interface CreateHomeworkData {
  title: string;
  description: string;
  dueDate: Date | string;
  subjectId: string;
  classId: string;
  attachments?: FileAttachment[];
  uploadedBy: string;
}

interface UpdateHomeworkData extends Partial<Omit<CreateHomeworkData, 'uploadedBy' | 'attachments'>> {
  uploadedBy?: string;
  attachments?: UpdateFileData[];
}

interface UpdateFileData extends FileAttachment {
  id?: string;
}

const isValidISOString = (str: string) => {
  try {
    return new Date(str).toISOString() === str;
  } catch {
    return false;
  }
};

export const homeworkService = {
  async getAll(role: string, classId?: string) {
    let query = supabase
      .schema(SCHEMA as any)
      .from(HOMEWORK_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name, code),
        attachments:File(*)
      `)
      .order('dueDate', { ascending: false });

    if (role === 'STUDENT' && classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as any[]).map(homework => {
      const transformedHomework = {
        ...homework,
        dueDate: new Date(homework.dueDate),
        createdAt: new Date(homework.createdAt),
        updatedAt: new Date(homework.updatedAt),
      };

      if (homework.attachments) {
        transformedHomework.attachments = homework.attachments;
      }

      return transformedHomework;
    }) as HomeworkType[];
  },

  async create(data: CreateHomeworkData, userId: string) {
    try {
      const { attachments, uploadedBy, ...homeworkData } = data;
      const homeworkId = uuidv4();
      const now = new Date().toISOString();

      const dueDate = typeof homeworkData.dueDate === 'string' && isValidISOString(homeworkData.dueDate)
        ? homeworkData.dueDate
        : new Date(homeworkData.dueDate).toISOString();

      const { data: homework, error: homeworkError } = await supabase
        .schema(SCHEMA as any)
        .from(HOMEWORK_TABLE)
        .insert([{
          ...homeworkData,
          id: homeworkId,
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
          dueDate
        }])
        .select(`
          *,
          class:Class(
            id,
            name,
            section
          ),
          subject:Subject(
            id,
            name,
            code
          ),
          attachments:File(*)
        `)
        .single();

      if (homeworkError) throw homeworkError;
      if (!homework) throw new Error('Failed to create homework');

      if (attachments && attachments.length > 0) {
        const validAttachments = attachments.filter(file => {
          if (!file.fileName || !file.filePath) {
            console.warn('Skipping invalid file attachment:', file);
            return false;
          }
          return true;
        });

        if (validAttachments.length > 0) {
          const fileInserts = validAttachments.map(file => ({
            id: file.id || uuidv4(),
            fileName: file.fileName,
            filePath: file.filePath,
            fileType: file.fileType || 'application/octet-stream',
            homeworkId: homeworkId,
            uploadedBy: uploadedBy || userId,
            uploadedAt: file.uploadedAt || now
          }));

          const { error: fileError } = await supabase
            .schema(SCHEMA as any)
            .from('File')
            .insert(fileInserts);

          if (fileError) throw fileError;
        }
      }

      return {
        ...homework,
        dueDate: new Date(homework.dueDate),
        createdAt: new Date(homework.createdAt),
        updatedAt: new Date(homework.updatedAt)
      } as HomeworkType;
    } catch (error) {
      console.error('Error creating homework:', error);
      throw error;
    }
  },

  async update(id: string, data: UpdateHomeworkData, userId: string) {
    try {
      const { attachments, uploadedBy, ...homeworkData } = data;
      const now = new Date().toISOString();

      if (homeworkData.dueDate) {
        homeworkData.dueDate = typeof homeworkData.dueDate === 'string' && isValidISOString(homeworkData.dueDate)
          ? homeworkData.dueDate
          : new Date(homeworkData.dueDate).toISOString();
      }

      const { data: updatedHomework, error } = await supabase
        .schema(SCHEMA as any)
        .from(HOMEWORK_TABLE)
        .update({
          ...homeworkData,
          updatedAt: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updatedHomework) throw new Error('Failed to update homework');

      if (attachments) {
        const newFiles = attachments.filter(f => !('id' in f));
        for (const file of newFiles) {
          if (uploadedBy) {
            await fileTableService.createFile({
              fileName: file.fileName,
              filePath: file.filePath,
              homeworkId: id,
              fileType: file.fileType,
              uploadedBy
            });
          }
        }
      }

      return await homeworkService.getHomeworkDetails(id);
    } catch (error) {
      console.error('Error updating homework:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const files = await fileTableService.getFilesByHomeworkId(id);
      const fileIdsToDelete = files.map(file => file.id);

      await Promise.all(fileIdsToDelete.map(fileId => {
        return fileTableService.deleteFile(fileId);
      }));

      const { error } = await supabase
        .schema(SCHEMA as any)
        .from(HOMEWORK_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting homework ID ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  async getHomeworkDetails(id: string) {
    const { data: homework, error: homeworkError } = await supabase
      .schema(SCHEMA as any)
      .from(HOMEWORK_TABLE)
      .select(`
        *,
        class:Class(
          id,
          name,
          section
        ),
        subject:Subject(
          id,
          name,
          code
        )
      `)
      .eq('id', id)
      .single();

    if (homeworkError) throw new Error(homeworkError.message);
    if (!homework) throw new Error('Homework not found');

    const { data: files, error: filesError } = await supabase
      .schema(SCHEMA as any)
      .from('File')
      .select('*')
      .eq('homeworkId', id);

    if (filesError) throw new Error(filesError.message);

    return {
      ...homework,
      dueDate: new Date(homework.dueDate),
      createdAt: new Date(homework.createdAt),
      updatedAt: new Date(homework.updatedAt),
      attachments: files || []
    } as HomeworkType;
  }
};

export const fetchHomeworkDetails = homeworkService.getHomeworkDetails;