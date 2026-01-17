import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';
import type { Database } from '../types/supabase';
import { CLASSWORK_TABLE, SCHEMA } from '@/lib/constants';

// Define database row types
type FileRow = Database['public']['Tables']['File']['Row'];

// Define the structure of a file attachment
interface FileAttachment extends Omit<FileRow, 'fileType'> {
  fileType: string; // Make fileType required
}

// Define the structure of a classwork object
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

// Define the structure of data required to create a new classwork entry
export interface CreateClassworkData {
  title: string;
  description: string;
  date: Date;
  classId: string;
  attachments?: Array<{
    fileName: string;
    filePath: string;
    fileType: string;
    id?: string;  // Added to support existing files
  }>;
  uploadedBy: string;
}

// Define the structure of data required to update an existing classwork entry
export type UpdateClassworkData = Partial<Omit<CreateClassworkData, 'uploadedBy'>> & {
  uploadedBy?: string;
  filesToDelete?: string[]; // IDs of files to be deleted
};

// Service for managing classwork-related operations
export const classworkService = {
  /**
   * Fetch all classwork entries based on user role and class ID
   * @param role User role (e.g., 'STUDENT', 'TEACHER')
   * @param classId Optional class ID to filter classwork by
   * @returns Array of classwork objects
   */
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

    if (error) {
      console.error('Error fetching classwork:', error);
      throw new Error('Failed to fetch classwork');
    }

    return (data as any[]).map(classwork => ({
      ...classwork,
      date: new Date(classwork.date),
      createdAt: new Date(classwork.createdAt),
      updatedAt: new Date(classwork.updatedAt),
    })) as ClassworkType[];
  },

  /**
   * Create a new classwork entry
   * @param data Classwork data to create
   * @param userId User ID of the creator
   * @returns Created classwork object
   */
  async create(data: CreateClassworkData, userId: string) {
    const { attachments, uploadedBy, ...classworkData } = data;
    const classworkId = uuidv4();

    try {
      // Start a transaction
      const { data: classwork, error: classworkError } = await supabase
        .schema(SCHEMA)
        .from(CLASSWORK_TABLE)
        .insert([
          {
            id: classworkId,
            ...classworkData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (classworkError) throw classworkError;

      // Handle attachments if they exist
      if (attachments && attachments.length > 0) {
        const filePromises = attachments.map(async (attachment) => {
          if (attachment.id) return attachment; // Skip if it's an existing file
          
          return await fileTableService.createFileRecord({
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileType: attachment.fileType,
            uploadedBy,
            classworkId,
          });
        });

        await Promise.all(filePromises);
      }

      return await this.fetchClassworkDetails(classworkId);
    } catch (error) {
      console.error('Error creating classwork:', error);
      throw new Error('Failed to create classwork');
    }
  },

  /**
   * Update an existing classwork entry
   * @param id Classwork ID to update
   * @param data Classwork data to update
   * @param userId User ID of the updater
   * @returns Updated classwork object
   */
  async update(id: string, data: UpdateClassworkData, userId: string) {
    try {
      const { attachments, uploadedBy, filesToDelete, ...classworkData } = data;
      const now = new Date().toISOString();

      // Delete files that were removed by user
      if (filesToDelete && filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map(fileId => fileTableService.deleteFile(fileId)));
      }

      const { data: updatedClasswork, error } = await supabase
        .schema(SCHEMA)
        .from(CLASSWORK_TABLE)
        .update({
          ...classworkData,
          updatedAt: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle attachments if present
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
      throw new Error('Failed to update classwork');
    }
  },

  /**
   * Delete a classwork entry by ID
   * @param id Classwork ID to delete
   */
  async delete(id: string) {
    try {
      const files = await fileTableService.getFilesByEntityId('classwork', id);
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
      throw new Error('Failed to delete classwork');
    }
  },

  /**
   * Fetch classwork details by ID
   * @param id Classwork ID to fetch
   * @returns Classwork object
   */
  async fetchClassworkDetails(id: string) {
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

    if (error) throw error;

    return {
      ...data,
      date: new Date(data.date),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as ClassworkType;
  },
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
