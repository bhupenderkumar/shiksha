import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface FileData {
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy: string;
  classworkId?: string;
  homeworkId?: string;
  admissionId?: string;
  documentType?: string;
}

// Entity type mapping to database column names
type EntityType = 'homework' | 'classwork' | 'fee' | 'admission' | 'grievance' | 'homeworkSubmission';

const entityColumnMap: Record<EntityType, string> = {
  homework: 'homeworkId',
  classwork: 'classworkId',
  fee: 'feeId',
  admission: 'admissionId',
  grievance: 'grievanceId',
  homeworkSubmission: 'homeworkSubmissionId',
};

// Service for managing file operations in the database
export const fileTableService = {
  /**
   * Create a new file entry in the database
   * @param fileData Data for the file to be created
   */
  async createFile(fileData: FileData) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .insert([{ ...fileData, id: uuidv4(), uploadedAt: new Date().toISOString() }]);

    if (error) {
      console.error('Error creating file:', error);
      throw new Error('Failed to create file');
    }
  },

  /**
   * Delete a file by its ID
   * @param fileId ID of the file to be deleted
   */
  async deleteFile(fileId: string) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  },

  /**
   * Get files by entity type and ID (generalized method)
   * @param entityType Type of entity ('homework' | 'classwork' | 'fee' | 'admission' | 'grievance' | 'homeworkSubmission')
   * @param entityId ID of the entity
   * @returns Array of file objects
   */
  async getFilesByEntityId(entityType: EntityType, entityId: string) {
    const columnName = entityColumnMap[entityType];
    if (!columnName) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .select('*')
      .eq(columnName, entityId);

    if (error) {
      console.error(`Error fetching files by ${entityType} ID:`, error);
      throw new Error(`Failed to fetch files for ${entityType}`);
    }
    return data;
  },

  /**
   * Delete files by entity type and ID (generalized method)
   * @param entityType Type of entity ('homework' | 'classwork' | 'fee' | 'admission' | 'grievance' | 'homeworkSubmission')
   * @param entityId ID of the entity
   * @param fileIdsToDelete Optional array of specific file IDs to delete. If not provided, deletes all files for the entity.
   */
  async deleteFilesByEntityId(entityType: EntityType, entityId: string, fileIdsToDelete?: string[]) {
    const columnName = entityColumnMap[entityType];
    if (!columnName) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    let query = supabase
      .schema('school')
      .from('File')
      .delete()
      .eq(columnName, entityId);

    if (fileIdsToDelete && fileIdsToDelete.length > 0) {
      query = query.in('id', fileIdsToDelete);
    }

    const { error } = await query;

    if (error) {
      console.error(`Error deleting files for ${entityType}:`, error);
      throw new Error(`Failed to delete files for ${entityType}`);
    }
  },

  /**
   * Delete files not in a specified list
   * @param columnName Column name to filter by
   * @param id ID to filter by
   * @param idsToKeep IDs of files to keep
   */
  async deleteFilesNotInList(columnName: string, id: string, idsToKeep: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq(columnName, id)
      .not('id', 'in', idsToKeep);

    if (error) {
      console.error('Error deleting files not in list:', error);
      throw new Error('Failed to delete files not in list');
    }
  },

  /**
   * Get files by classwork ID
   * @param classworkId ID of the classwork to filter by
   * @returns Array of file objects
   */
  async getFilesByClassworkId(classworkId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .select('*')
      .eq('classworkId', classworkId);

    if (error) {
      console.error('Error fetching files by classwork ID:', error);
      throw new Error('Failed to fetch files by classwork ID');
    }
    return data;
  },

  /**
   * Get files by homework ID
   * @param homeworkId ID of the homework to filter by
   * @returns Array of file objects
   */
  async getFilesByHomeworkId(homeworkId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('File')
      .select('*')
      .eq('homeworkId', homeworkId);

    if (error) {
      console.error('Error fetching files by homework ID:', error);
      throw new Error('Failed to fetch files by homework ID');
    }
    return data;
  },

  /**
   * Delete files by classwork ID
   * @param classworkId ID of the classwork to filter by
   * @param fileIdsToDelete IDs of files to delete
   */
  async deleteFilesByClassworkId(classworkId: string, fileIdsToDelete: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('classworkId', classworkId)
      .in('id', fileIdsToDelete);

    if (error) {
      console.error('Error deleting files by classwork ID:', error);
      throw new Error('Failed to delete files by classwork ID');
    }
  },

  /**
   * Delete files by homework ID
   * @param homeworkId ID of the homework to filter by
   * @param fileIdsToDelete IDs of files to delete
   */
  async deleteFilesByHomeworkId(homeworkId: string, fileIdsToDelete: string[]) {
    const { error } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('homeworkId', homeworkId)
      .in('id', fileIdsToDelete);

    if (error) {
      console.error('Error deleting files by homework ID:', error);
      throw new Error('Failed to delete files by homework ID');
    }
  },

  /**
   * Update files based on a specified column and ID
   * @param columnName Column name to filter by
   * @param id ID to filter by
   * @param filesToKeep IDs of files to keep
   */
  async updateFiles(columnName: string, id: string, filesToKeep: string[]) {
    // First, get all existing files
    const { data: existingFiles, error: fetchError } = await supabase
      .schema('school')
      .from('File')
      .select('id')
      .eq(columnName, id);

    if (fetchError) {
      console.error('Error fetching existing files:', fetchError);
      throw new Error('Failed to fetch existing files');
    }

    // Find files to delete (files that exist but are not in filesToKeep)
    const existingFileIds = existingFiles.map(f => f.id);
    const fileIdsToDelete = existingFileIds.filter(existingId => !filesToKeep.includes(existingId));

    // Delete files that are not in the keep list
    if (fileIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .schema('school')
        .from('File')
        .delete()
        .in('id', fileIdsToDelete);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
        throw new Error('Failed to delete files');
      }
    }
  },
};

// Export the EntityType for use in other modules
export type { EntityType };
