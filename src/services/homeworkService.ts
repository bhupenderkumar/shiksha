// This service handles all operations related to homework management.
// It includes functions for creating, updating, and fetching homework details.
// Each function is designed to interact with the Supabase backend.

import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';
import { profileService } from '@/services/profileService';
import { HOMEWORK_TABLE } from '../lib/constants';

// Define the structure of a homework entry
export type HomeworkType = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subjectId: string;
  classId: string;
  status: HomeworkStatus;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType?: string;
  }>;
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
};

// Define the possible statuses of a homework entry
export type HomeworkStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SUBMITTED';

// Define the structure of data required to create a new homework entry
type CreateHomeworkData = Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'> & {
};

// Define the structure of data required to update an existing homework entry
type UpdateHomeworkData = Partial<Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'>> & {
  attachments?: Array<{
    id?: string;
    fileName: string;
    filePath: string;
    fileType?: string;
  }>;
};

// Homework service object
export const homeworkService = {
  /**
   * Retrieves all homework entries, optionally filtered by role or class ID.
   * @param role Optional role to filter by
   * @param classId Optional class ID to filter by
   * @returns An array of homework entries
   */
  async getAll(role?: string, classId?: string) {
    try {
      let query = supabase
        .schema('school')
        .from(HOMEWORK_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          ),
          attachments:File(*)
        `);

      if (classId) {
        query = query.eq('classId', classId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
  },

  /**
   * Creates a new homework entry in the database.
   * Retrieves the current user and prepares the data for insertion.
   * Handles attachments if any are provided.
   * @param data Data required to create a new homework entry
   * @returns The ID of the newly created homework entry
   */
  async create(data: CreateHomeworkData) {
    // Function to create a new homework entry in the database.
    // Retrieves the current user and prepares the data for insertion.
    // Handles attachments if any are provided.
    try {
      const user = await profileService.getCurrentUser();
      const uploadedBy = user?.id;

      const { attachments, ...homeworkData } = data;
      const localHomeworkData = { ...homeworkData };
      delete localHomeworkData?.userId;

      const id = uuidv4();
      const now = new Date().toISOString();

      const { error: homeworkError } = await supabase
        .schema('school')
        .from(HOMEWORK_TABLE)
        .insert({
          id,
          ...localHomeworkData,
          createdAt: now,
          updatedAt: now
        });

      if (homeworkError) throw homeworkError;

      // Handle attachments if any
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const fileId = uuidv4(); // Generate UUID for file
          await fileTableService.createFile({
            id: fileId,
            fileName: file.fileName,
            filePath: file.filePath,
            fileType: file.fileType || file.fileName.split('.').pop() || 'application/octet-stream',
            uploadedBy,
            homeworkId: id
          });
        }
      }

      return id;
    } catch (error) {
      console.error('Error creating homework:', error);
      throw error;
    }
  },

  /**
   * Updates an existing homework entry in the database.
   * Retrieves the current user and prepares the data for update.
   * Handles attachments if any are provided.
   * @param id ID of the homework entry to update
   * @param data Data required to update the homework entry
   * @returns The ID of the updated homework entry
   */
  async update(id: string, data: UpdateHomeworkData) {
    try {
      const user = await profileService.getCurrentUser();
      const uploadedBy = user?.id;
      const { attachments, ...homeworkData } = data;
      const localHomeworkData = { ...homeworkData };
      delete localHomeworkData?.userId;
      const now = new Date().toISOString();

      // Update homework
      const { error: homeworkError } = await supabase
        .schema('school')
        .from(HOMEWORK_TABLE)
        .update({
          ...localHomeworkData,
          updatedAt: now,
        })
        .eq('id', id);

      if (homeworkError) throw homeworkError;

      // Handle attachments if provided
      if (attachments !== undefined) {
        // Get existing files
        const existingFiles = await fileTableService.getFilesByHomeworkId(id);
        const fileIdsToKeep = attachments.filter(f => f.id).map(f => f.id);

        // Delete files not in fileIdsToKeep
        if (existingFiles.length > 0) {
          await fileTableService.deleteFilesNotInList('homeworkId', id, fileIdsToKeep);
        }

        // Add new files
        const newFiles = attachments.filter(f => !f.id);
        for (const file of newFiles) {
          const fileId = uuidv4(); // Generate UUID for file
          await fileTableService.createFile({
            id: fileId,
            fileName: file.fileName,
            filePath: typeof file.filePath === 'string' ? file.filePath : file.filePath.path,
            fileType: file.fileType || file.fileName.split('.').pop() || 'application/octet-stream',
            uploadedBy: uploadedBy,
            homeworkId: id      
              });
        }
      }

      return id;
    } catch (error) {
      console.error('Error updating homework:', error);
      throw error;
    }
  },

  /**
   * Retrieves the details of a homework entry by ID.
   * @param id ID of the homework entry to retrieve
   * @returns The homework entry details
   */
  async getHomeworkDetails(id: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(HOMEWORK_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          ),
          attachments:File(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching homework details:', error);
      throw error;
    }
  }
};