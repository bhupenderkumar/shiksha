import { supabase } from '@/lib/api-client';
import type { Database } from '@/lib/database.types';
import { v4 as uuidv4 } from 'uuid';

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
      .insert([{
        id: classworkId,
        ...classworkData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (classworkError) throw classworkError;

    // Then create file records if there are any attachments
    if (attachments && attachments.length > 0) {
      const { error: filesError } = await supabase
      .schema("school")
        .from('File')
        .insert(
          attachments.map(file => ({
            ...file,
            id: uuidv4(), 
            classworkId: classworkId
          }))
        );

      if (filesError) throw filesError;
    }

    return classwork;
  },

  async update(id: string, data: UpdateClassworkData) {
    const { attachments, ...classworkData } = data;
    
    const { error: classworkError } = await supabase
    .schema("school")
      .from('Classwork')
      .update({
        ...classworkData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (classworkError) throw classworkError;

    if (attachments) {
      // Delete existing files not in the new attachments
      const { error: deleteError } = await supabase
      .schema("school")
        .from('File')
        .delete()
        .eq('classworkId', id)
        .not('id', 'in', attachments.map(f => f.id));

      if (deleteError) throw deleteError;

      // Add new files
      const newFiles = attachments.filter(f => !f.id);
      if (newFiles.length > 0) {
        const { error: filesError } = await supabase
        .schema("school")
          .from('File')
          .insert(
            newFiles.map(file => ({
              ...file,
              id: uuidv4(),
              classworkId: id
            }))
          );

        if (filesError) throw filesError;
      }
    }
  },

  async delete(id: string) {
    // Delete associated files first
    const { error: filesError } = await supabase
      .from('File')
      .delete()
      .eq('classworkId', id);

    if (filesError) throw filesError;

    // Then delete the classwork
    const { error } = await supabase
    .schema("school")
      .from('Classwork')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

