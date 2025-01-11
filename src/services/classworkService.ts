import { supabase } from '@/lib/api-client';
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
    const { attachments, uploadedBy, ...classworkData } = data;

    // Generate ID for classwork
    const classworkId = uuidv4();

    // First create the classwork without uploadedBy
    const { data: classwork, error: classworkError } = await supabase
      .schema('school')  
      .from('Classwork')
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
  },

  async update(id: string, data: UpdateClassworkData) {
    const { attachments, uploadedBy, ...classworkData } = data;

    // Update classwork without uploadedBy
    const { data: updatedClasswork, error } = await supabase
      .schema("school")
      .from('Classwork')
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

export const fetchClassworkDetails = async (id: string) => {
  const { data, error } = await supabase
    .schema("school")
    .from('Classwork')
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
