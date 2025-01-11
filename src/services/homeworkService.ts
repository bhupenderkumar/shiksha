import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileTableService } from './fileTableService';
import { fileService } from './fileService';

export type HomeworkType = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  classId: string;
  subjectId: string;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Array<{ id: string; fileName: string; filePath: string; fileType?: string }>;
  class?: {
    id: string;
    name: string;
    section: string;
  };
  subject?: {
    id: string;
    name: string;
  };
};

export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';

type CreateHomeworkData = Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateHomeworkData = Partial<CreateHomeworkData>;

export const homeworkService = {
  async getAll(role?: string, classId?: string) {
    try {
      let query = supabase
        .schema('school')
        .from('Homework')
        .select(`
          *,
          class:Class!classId (
            id,
            name,
            section
          ),
          subject:Subject!subjectId (
            id,
            name,
            code
          ),
          files:File(*)
        `);

      if (classId) {
        query = query.eq('classId', classId);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });
      if (error) throw error;

      // Transform the response to include attachments from files
      return data.map(homework => ({
        ...homework,
        attachments: homework.files || []
      }));
    } catch (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
  },

  async create(data: CreateHomeworkData & { files?: File[] }) {
    const { files, attachments, ...homeworkData } = data;

    // Generate ID for homework
    const homeworkId = uuidv4();

    // Create the homework without userId
    const { error: homeworkError } = await supabase
      .schema('school')
      .from('Homework')
      .insert([{
        ...homeworkData,
        id: homeworkId,
        status: homeworkData.status || 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (homeworkError) throw homeworkError;

    // Handle file uploads if there are any
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const timestamp = new Date().getTime();
          const filePath = `homework/${homeworkId}/${timestamp}_${file.name}`;
          const { data: uploadData } = await supabase.storage
            .from('File')
            .upload(filePath, file);

          if (uploadData) {
            await fileTableService.createFile({
              fileName: file.name,
              filePath: filePath,
              homeworkId: homeworkId,
              fileType: file.type || file.name.split('.').pop() || ''
            });
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
      }
    }

    return homeworkId;
  },

  async update(id: string, data: UpdateHomeworkData & { files?: File[] }) {
    const { files, attachments, ...homeworkData } = data;

    // First update the homework
    const { error: homeworkError } = await supabase
      .schema('school')
      .from('Homework')
      .update({
        ...homeworkData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (homeworkError) throw homeworkError;

    // Handle file attachments
    if (files || attachments) {
      // Get existing files
      const existingFiles = await fileTableService.getFilesByHomeworkId(id);
      
      // Keep track of files to keep
      const fileIdsToKeep = attachments?.map(file => file.id) || [];

      // Upload new files if any
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            // 1. Upload file to storage
            const timestamp = new Date().getTime();
            const filePath = `homework/${id}/${timestamp}_${file.name}`;
            const { data: uploadData } = await supabase.storage
              .from('File')
              .upload(filePath, file);

            if (uploadData) {
              // 2. Create file record in database
              await fileTableService.createFile({
                fileName: file.name,
                filePath: filePath,
                homeworkId: id,
                fileType: file.type || file.name.split('.').pop() || ''
              });
            }
          } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
          }
        }
      }

      // Remove files that are not in fileIdsToKeep
      const filesToDelete = existingFiles.filter(file => !fileIdsToKeep.includes(file.id));
      for (const file of filesToDelete) {
        try {
          // 1. Delete from storage
          await supabase.storage
            .from('File')
            .remove([file.filePath]);

          // 2. Delete from database
          await fileTableService.deleteFile(file.id);
        } catch (error) {
          console.error('Error deleting file:', error);
          throw error;
        }
      }
    }
  },

  async delete(id: string) {
    // Delete all associated files first
    const files = await fileTableService.getFilesByHomeworkId(id);
    
    // Delete files from storage and database
    for (const file of files) {
      try {
        // 1. Delete from storage
        await supabase.storage
          .from('File')
          .remove([file.filePath]);

        // 2. Delete from database
        await fileTableService.deleteFile(file.id);
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    }

    // Then delete the homework
    const { error } = await supabase
      .schema('school')
      .from('Homework')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async fetchHomeworkDetails(id: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('Homework')
      .select(`
        *,
        files:File(*),
        class:Class(id, name, section),
        subject:Subject(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      attachments: data.files || [],
      dueDate: new Date(data.dueDate),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as HomeworkType;
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Homework')
        .select(`
          *,
          files:File(*),
          subject:Subject!subjectId (
            id,
            name
          ),
          class:Class!classId (
            id,
            name,
            section
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the response to include attachments from files
      return {
        ...data,
        attachments: data.files || []
      };
    } catch (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
  }
};

export const updateHomework = async (id: string, data: UpdateHomeworkData & { files?: File[] }, teacherId: string) => {
  return await homeworkService.update(id, data, teacherId);
};

export const fetchHomeworkDetails = async (id: string) => {
  return await homeworkService.fetchHomeworkDetails(id);
};