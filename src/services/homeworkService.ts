import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';
import type { Database } from '../types/supabase';
import { HOMEWORK_TABLE, SCHEMA } from '@/lib/constants';
import { de } from 'date-fns/locale';
import { profileService } from './profileService';

// Define the structure of a file attachment from API response
interface FileAttachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  feeId: string | null;
  schoolId: string | null;
  homeworkId: string | null;
  uploadedAt: string;
  uploadedBy: string;
  classworkId: string | null;
  grievanceId: string | null;
  homeworkSubmissionId: string | null;
}

// Define the structure of a homework object
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

// Define homework status types
export type HomeworkStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SUBMITTED';

// Define the structure of data required to create a new homework entry
interface FileData {
  name: string;
  filePath: {
    fullPath: string;
    path: string;
    id?: string;
  };
  type: string;
}

interface CreateHomeworkData {
  title: string;
  description: string;
  dueDate: Date | string;
  subjectId: string;
  classId: string;
  attachments?: FileAttachment[];
  uploadedBy: string;
}

interface UpdateFileData extends FileData {
  id?: string;
}

// Define the structure of data required to update an existing homework entry
interface UpdateHomeworkData extends Partial<Omit<CreateHomeworkData, 'uploadedBy' | 'attachments'>> {
  uploadedBy?: string;
  attachments?: UpdateFileData[];
}

// Helper function to validate ISO date string
const isValidISOString = (str: string) => {
  try {
    return new Date(str).toISOString() === str;
  } catch {
    return false;
  }
};

// Homework service to manage homework-related operations
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
      
      // Ensure attachments are preserved
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

      // Use the dueDate as is if it's already an ISO string, otherwise convert it
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

      // Handle file uploads if present
      if (attachments && attachments.length > 0) {
        // Validate required fields
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

      // Handle new file attachments
      if (attachments && attachments.length > 0) {
        // Validate required fields
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
            homeworkId: id,
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

      // Fetch and return the updated homework with attachments
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

    // Fetch files separately
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

// Keep the fetchHomeworkDetails export for backward compatibility
export const fetchHomeworkDetails = homeworkService.getHomeworkDetails;