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
  filesToDelete?: string[]; // IDs of files to be deleted
}

// Helper function to validate ISO date string
const isValidISOString = (str: string) => {
  try {
    return new Date(str).toISOString() === str;
  } catch {
    return false;
  }
};

interface HomeworkSearchParams {
  searchTerm?: string;
  subjectId?: string;
  status?: HomeworkStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Service for managing homework-related operations
export const homeworkService = {
  /**
   * Fetch all homework entries based on user role and class ID
   * @param role User role (e.g., 'STUDENT', 'TEACHER')
   * @param classId Optional class ID to filter homework by
   * @returns Array of homework objects
   */
  async getAll(role: string, classId?: string, params?: HomeworkSearchParams) {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(HOMEWORK_TABLE)
        .select(`
          *,
          class:Class(id, name, section),
          subject:Subject(id, name, code),
          attachments:File(*)
        `);

      // Apply role-based filters
      if (role === 'STUDENT' && classId) {
        query = query.eq('classId', classId);
      }

      // Apply search filters
      if (params?.searchTerm) {
        query = query.or(`
          title.ilike.%${params.searchTerm}%,
          description.ilike.%${params.searchTerm}%,
          subject.name.ilike.%${params.searchTerm}%
        `);
      }

      if (params?.subjectId) {
        query = query.eq('subjectId', params.subjectId);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.dateRange) {
        query = query
          .gte('dueDate', params.dateRange.start.toISOString())
          .lte('dueDate', params.dateRange.end.toISOString());
      }

      const { data, error } = await query.order('dueDate', { ascending: false });

      if (error) throw error;

      return (data as any[]).map(homework => ({
        ...homework,
        dueDate: new Date(homework.dueDate),
        createdAt: new Date(homework.createdAt),
        updatedAt: new Date(homework.updatedAt),
      })) as HomeworkType[];
    } catch (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
  },

  /**
   * Create a new homework entry
   * @param data Homework data to create
   * @param userId User ID of the creator
   * @returns Created homework object
   */
  async create(data: CreateHomeworkData, userId: string) {
    try {
      const { attachments, uploadedBy, ...homeworkData } = data;
      const homeworkId = uuidv4();

      const { data: homework, error: homeworkError } = await supabase
        .schema(SCHEMA)
        .from(HOMEWORK_TABLE)
        .insert([{ 
          ...homeworkData, 
          id: homeworkId, 
          status: 'PENDING', 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        }])
        .select(`
          *,
          class:Class(id, name, section),
          subject:Subject(id, name, code),
          attachments:File(*)
        `)
        .single();

      if (homeworkError) throw homeworkError;

      // Handle file uploads if present
      if (attachments && attachments.length > 0) {
        // Validate required fields
        const validAttachments = attachments.filter(file => {
          if (!file.name || !file.filePath) {
            console.warn('Skipping invalid file attachment:', file);
            return false;
          }
          return true;
        });

        if (validAttachments.length > 0) {
          const fileInserts = validAttachments.map(file => ({
            id: file.id || uuidv4(),
            fileName: file.name,
            filePath: file.filePath.fullPath,
            fileType: file.type || 'application/octet-stream',
            homeworkId: homeworkId,
            uploadedBy: uploadedBy || userId,
            uploadedAt: new Date().toISOString()
          }));

          const { error: fileError } = await supabase
            .schema(SCHEMA)
            .from('File')
            .insert(fileInserts);

          if (fileError) throw fileError;
        }
      }

      return {
        ...homework,
        dueDate: new Date(homework.dueDate),
        createdAt: new Date(homework.createdAt),
        updatedAt: new Date(homework.updatedAt),
      } as HomeworkType;
    } catch (error) {
      console.error('Error creating homework:', error);
      throw new Error('Failed to create homework');
    }
  },

  /**
   * Update an existing homework entry
   * @param id Homework ID to update
   * @param data Homework data to update
   * @param userId User ID of the updater
   * @returns Updated homework object
   */
  async update(id: string, data: UpdateHomeworkData, userId: string) {
    try {
      const { attachments, uploadedBy, filesToDelete, ...homeworkData } = data;
      const now = new Date().toISOString();

      // Delete files that were removed by user
      if (filesToDelete && filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map(fileId => fileTableService.deleteFile(fileId)));
      }

      if (homeworkData.dueDate) {
        homeworkData.dueDate = typeof homeworkData.dueDate === 'string' && isValidISOString(homeworkData.dueDate)
          ? homeworkData.dueDate
          : new Date(homeworkData.dueDate).toISOString();
      }

      const { data: updatedHomework, error } = await supabase
        .schema(SCHEMA)
        .from(HOMEWORK_TABLE)
        .update({
          ...homeworkData,
          updatedAt: now
        })
        .eq('id', id)
        .select(`
          *,
          class:Class(id, name, section),
          subject:Subject(id, name, code),
          attachments:File(*)
        `)
        .single();

      if (error) throw error;

      // Handle new file attachments
      if (attachments && attachments.length > 0) {
        // Validate required fields
        const validAttachments = attachments.filter(file => {
          if (!file.name || !file.filePath) {
            console.warn('Skipping invalid file attachment:', file);
            return false;
          }
          return true;
        });

        if (validAttachments.length > 0) {
          const fileInserts = validAttachments.map(file => ({
            id: file.id || uuidv4(),
            fileName: file.name,
            filePath: file.filePath.fullPath,
            fileType: file.type || 'application/octet-stream',
            homeworkId: id,
            uploadedBy: uploadedBy || userId,
            uploadedAt: now
          }));

          const { error: fileError } = await supabase
            .schema(SCHEMA)
            .from('File')
            .insert(fileInserts);

          if (fileError) throw fileError;
        }
      }

      // Fetch and return the updated homework with attachments
      return {
        ...updatedHomework,
        dueDate: new Date(updatedHomework.dueDate),
        createdAt: new Date(updatedHomework.createdAt),
        updatedAt: new Date(updatedHomework.updatedAt),
      } as HomeworkType;
    } catch (error) {
      console.error('Error updating homework:', error);
      throw new Error('Failed to update homework');
    }
  },

  /**
   * Delete a homework entry by ID
   * @param id Homework ID to delete
   */
  async delete(id: string) {
    try {
      const files = await fileTableService.getFilesByEntityId('homework', id);
      const fileIdsToDelete = files.map(file => file.id);

      await Promise.all(fileIdsToDelete.map(fileId => {
        return fileTableService.deleteFile(fileId);
      }));

      const { error } = await supabase
        .schema(SCHEMA)
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

  /**
   * Fetch homework details by ID
   * @param id Homework ID to fetch
   * @returns Homework object with attachments
   */
  async getHomeworkDetails(id: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(HOMEWORK_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name, code),
        attachments:File(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      dueDate: new Date(data.dueDate),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as HomeworkType;
  }
};

// Keep the fetchHomeworkDetails export for backward compatibility
export const fetchHomeworkDetails = homeworkService.getHomeworkDetails;