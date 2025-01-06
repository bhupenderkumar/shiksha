import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { HomeworkStatus } from '@prisma/client';

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
  attachments?: Array<{ id: string; fileName: string; filePath: string }>;
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

type CreateHomeworkData = Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateHomeworkData = Partial<CreateHomeworkData>;

export const homeworkService = {
  async getAll(role: string, classId?: string) {
    let query = supabase
      .schema('school')
      .from('Homework')
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name),
        attachments:File(*)
      `)
      .order('dueDate', { ascending: false });

    if (role === 'STUDENT' && classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as HomeworkType[]).map(homework => ({
      ...homework,
      dueDate: new Date(homework.dueDate),
      createdAt: new Date(homework.createdAt),
      updatedAt: new Date(homework.updatedAt),
    }));
  },

  async create(data: CreateHomeworkData) {
    const { attachments, ...homeworkData } = data;
    
    // Generate ID for homework
    const homeworkId = uuidv4();
    
    // First create the homework
    const { data: homework, error: homeworkError } = await supabase
      .schema('school')
      .from('Homework')
      .insert([{
        id: homeworkId,
        ...homeworkData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (homeworkError) throw homeworkError;

    // Then create file records if there are any attachments
    if (attachments && attachments.length > 0) {
      const { error: filesError } = await supabase
        .schema('school')
        .from('File')
        .insert(
          attachments.map(file => ({
            ...file,
            id: uuidv4(),
            homeworkId: homeworkId
          }))
        );

      if (filesError) throw filesError;
    }

    return homework;
  },

  async update(id: string, data: UpdateHomeworkData) {
    const { attachments, ...homeworkData } = data;
    
    const { error: homeworkError } = await supabase
      .schema('school')
      .from('Homework')
      .update({
        ...homeworkData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (homeworkError) throw homeworkError;

    if (attachments) {
      // Delete existing files not in the new attachments
      const { error: deleteError } = await supabase
        .schema('school')
        .from('File')
        .delete()
        .eq('homeworkId', id)
        .not('id', 'in', attachments.map(f => f.id));

      if (deleteError) throw deleteError;

      // Add new files
      const newFiles = attachments.filter(f => !f.id);
      if (newFiles.length > 0) {
        const { error: filesError } = await supabase
          .schema('school')
          .from('File')
          .insert(
            newFiles.map(file => ({
              ...file,
              id: uuidv4(),
              homeworkId: id
            }))
          );

        if (filesError) throw filesError;
      }
    }
  },

  async delete(id: string) {
    // Delete associated files first
    const { error: filesError } = await supabase
      .schema('school')
      .from('File')
      .delete()
      .eq('homeworkId', id);

    if (filesError) throw filesError;

    // Then delete the homework
    const { error } = await supabase
      .schema('school')
      .from('Homework')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
