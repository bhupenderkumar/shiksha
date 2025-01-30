import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface FileData {
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy: string;
  classworkId?: string;
  homeworkId?: string;
}

export const fileTableService = {
  async createFile(fileData: FileData) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .insert([{ ...fileData, id: uuidv4(), uploadedAt: new Date().toISOString() }]);

    if (error) throw error;
  },

  async deleteFile(fileId: string) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  },

  async deleteFilesNotInList(columnName: string, id: string, idsToKeep: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq(columnName, id)
      .not('id', 'in', idsToKeep);

    if (error) throw error;
  },

  async getFilesByClassworkId(classworkId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .select('*')
      .eq('classworkId', classworkId);

    if (error) throw error;
    return data;
  },

  async getFilesByHomeworkId(homeworkId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .select('*')
      .eq('homeworkId', homeworkId);

    if (error) throw error;
    return data;
  },

  async deleteFilesByClassworkId(classworkId: string, fileIdsToDelete: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('classworkId', classworkId)
      .in('id', fileIdsToDelete);

    if (error) throw error;
  },

  async deleteFilesByHomeworkId(homeworkId: string, fileIdsToDelete: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('homeworkId', homeworkId)
      .in('id', fileIdsToDelete);

    if (error) throw error;
  },

  async updateFiles(columnName: string, id: string, filesToKeep: string[]) {
    const { data: existingFiles, error: fetchError } = await supabase
      .schema('school')
      .from('File')
      .select('id')
      .eq(columnName, id);

    if (fetchError) throw fetchError;

    const existingFileIds = existingFiles.map(f => f.id);
    const fileIdsToDelete = existingFileIds.filter(id => !filesToKeep.includes(id));

    if (fileIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .schema('school')
        .from('File')
        .delete()
        .eq(columnName, id)
        .in('id', fileIdsToDelete);

      if (deleteError) throw deleteError;
    }
  }
};