import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

export const fileTableService = {
  async createFile(fileData: { fileName: string; filePath: string; classworkId: string; fileType: string; }) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .insert([{ ...fileData, id: uuidv4() }]);

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

  async deleteFilesByClassworkId(classworkId: string, fileIdsToDelete: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('classworkId', classworkId)
      .in('id', fileIdsToDelete);

    if (error) throw error;
  },
};
