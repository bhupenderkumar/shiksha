// This service manages classwork-related operations.
// It includes functions for creating, updating, and fetching classwork details.
// Each function interacts with the Supabase backend to manage classwork data.

import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';
import { CLASSWORK_TABLE } from '../lib/constants';

// Define the structure of a classwork object
export type ClassworkType = {
  id: string;
  title: string;
  description: string;
  date: Date;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Array<{ id: string; fileName: string; filePath: string }>;
  class?: {
    id: string;
    name: string;
    section: string;
  };
};

// Define the structure of data required to create a new classwork entry
type CreateClassworkData = Omit<ClassworkType, 'id' | 'createdAt' | 'updatedAt'>;

// Define the structure of data required to update an existing classwork entry
type UpdateClassworkData = Partial<CreateClassworkData>;

// Classwork service to manage classwork-related operations
export const classworkService = {
  /**
   * Retrieves all classwork entries for a given role and class ID.
   * If the role is 'STUDENT', it filters the results by the provided class ID.
   * 
   * @param role The role of the user (e.g., 'STUDENT', 'TEACHER')
   * @param classId The ID of the class (optional)
   * @returns A list of classwork entries
   */
  async getAll(role: string, classId?: string) {
    let query = supabase
      .schema('school')
      .from(CLASSWORK_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        attachments:File(*)
      `)
      .order('date', { ascending: false });

    if (role === 'STUDENT' && classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as ClassworkType[]).map(classwork => ({
      ...classwork,
      date: new Date(classwork.date),
      createdAt: new Date(classwork.createdAt),
      updatedAt: new Date(classwork.updatedAt),
    }));
  },

  /**
   * Creates a new classwork entry in the database.
   * Handles attachments if any are provided.
   * 
   * @param data The data required to create a new classwork entry
   * @returns The newly created classwork entry
   */
  async create(data: CreateClassworkData) {
    // Function to create a new classwork entry in the database.
    // Retrieves the current user and prepares the data for insertion.
    // Handles attachments if any are provided.
    try {
      const { attachments, uploadedBy, ...classworkData } = data;

      // Generate ID for classwork
      const classworkId = uuidv4();

      // First create the classwork without uploadedBy
      const { data: classwork, error: classworkError } = await supabase
        .schema('school')  
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

      // Then create file records with uploadedBy
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          await fileTableService.createFile({
            fileName: file.fileName,
            filePath: file.filePath,
            classworkId: classworkId,
            fileType: file.fileType || file.fileName.split('.').pop() || 'application/octet-stream',
            uploadedBy // Pass uploadedBy only to the File table
          });
        }
      }

      return classwork;
    } catch (error) {
      console.error('Error creating classwork:', error);
      throw error;
    }
  },

  /**
   * Updates an existing classwork entry in the database.
   * Handles attachments if any are provided.
   * 
   * @param id The ID of the classwork entry to update
   * @param data The updated data for the classwork entry
   * @returns The updated classwork entry
   */
  async update(id: string, data: UpdateClassworkData) {
    // Function to update an existing classwork entry in the database.
    // Retrieves the current user and prepares the data for update.
    // Handles attachments if any are provided.
    try {
      const { attachments, uploadedBy, ...classworkData } = data;

      // Update classwork without uploadedBy
      const { data: updatedClasswork, error } = await supabase
        .schema("school")
        .from(CLASSWORK_TABLE)
        .update({
          ...classworkData,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Handle file attachments with uploadedBy
      if (attachments && attachments.length > 0) {
        const fileIdsToKeep = attachments.filter(f => f.id).map(f => f.id);
        
        // Delete files not in fileIdsToKeep
        await fileTableService.deleteFilesByClassworkId(id, fileIdsToKeep);

        // Add new files
        const newFiles = attachments.filter(f => !f.id);
        for (const file of newFiles) {
          await fileTableService.createFile({
            fileName: file.fileName,
            filePath: file.filePath,
            classworkId: id,
            fileType: file.fileType || file.fileName.split('.').pop() || 'application/octet-stream',
            uploadedBy // Pass uploadedBy only to the File table
          });
        }
      }

      return updatedClasswork;
    } catch (error) {
      console.error('Error updating classwork:', error);
      throw error;
    }
  },

  /**
   * Deletes a classwork entry from the database.
   * Also deletes any associated file records.
   * 
   * @param id The ID of the classwork entry to delete
   */
  async delete(id: string) {
    console.log(`Attempting to delete classwork with ID: ${id}`); // Log the ID being deleted

    // Retrieve associated file IDs
    const files = await fileTableService.getFilesByClassworkId(id);
    const fileIdsToDelete = files.map(file => file.id);

    // Delete associated files first
    await Promise.all(fileIdsToDelete.map(fileId => {
      return fileTableService.deleteFile(fileId); // Delete from the Files table
    }));

    // Then delete the classwork
    const { error } = await supabase
    .schema("school")
      .from(CLASSWORK_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting classwork ID ${id}:`, error); // Log any errors
      throw error;
    }
  },
};

/**
 * Retrieves the details of a classwork entry by its ID.
 * 
 * @param id The ID of the classwork entry to retrieve
 * @returns The classwork entry details
 */
export const fetchClassworkDetails = async (id: string) => {
  const { data, error } = await supabase
    .schema("school")
    .from(CLASSWORK_TABLE)
    .select(`
      *,
      attachments:File(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  
  // Convert date fields to Date objects if necessary
  return {
    ...data,
    date: new Date(data.date),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
};
