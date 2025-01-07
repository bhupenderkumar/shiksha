import { supabase } from '@/lib/api-client';
import type { Database } from '@/lib/database.types';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';

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

type CreateClassworkData = Omit<ClassworkType, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateClassworkData = Partial<CreateClassworkData>;

export const classworkService = {
  async getAll(role: string, classId?: string) {
    let query = supabase
      .schema('school')
      .from('Classwork')
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

  async create(data: CreateClassworkData) {
    const { attachments, ...classworkData } = data;

    // Generate ID for classwork
    const classworkId = uuidv4();

    // First create the classwork
    const { data: classwork, error: classworkError } = await supabase
    .schema('school')  
    .from('Classwork')
      .insert([{ ...classworkData, id: classworkId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }])
      .select()
      .single();

    if (classworkError) throw classworkError;

    // Then create file records if there are any attachments
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        await fileTableService.createFile({
          fileName: file.fileName,
          filePath: file.filePath,
          classworkId: classworkId,
          fileType: file.fileName.split('.').pop() // Set fileType based on the file extension
        });
      }
    }

    return classwork;
  },

  async update(id: string, data: UpdateClassworkData) {
    const { attachments, ...classworkData } = data;
    console.log(classworkData)
    const classworkId = id; // Use the passed id as classworkId

    const { data: updatedClasswork, error } = await supabase
    .schema("school")
      .from('Classwork')
      .update({
        ...classworkData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', classworkId);

    if (error) {
      console.error('Error updating classwork:', error);
      throw new Error(error.message);
    }

    if (attachments && attachments.length > 0) {
      // Delete existing files not in the new attachments
      const fileIdsToDelete = attachments.filter(f => !f.id).map(f => f.id);
      await fileTableService.deleteFilesByClassworkId(classworkId, fileIdsToDelete);
      alert(fileIdsToDelete)
      // Add new files
      const newFiles = attachments.filter(f => !f.id);
      alert(newFiles)
      console.log(newFiles)
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          await fileTableService.createFile({
            fileName: file.fileName,
            filePath: file.filePath,
            classworkId: classworkId,
            fileType: file.fileName.split('.').pop() 
          });
        }
      }
    }
  },

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
      .from('Classwork')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting classwork ID ${id}:`, error); // Log any errors
      throw error;
    }
  },
};

export const fetchClassworkDetails = async (id) => {
  const { data, error } = await supabase
  .schema("school")
    .from('Classwork')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};
