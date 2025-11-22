import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { ID_CARD_TABLE } from '@/lib/constants';
import { studentService } from './student.service';

import { Database } from '@/database.types';

// Types
export type IDCardData = Database['school']['Tables']['IDCard']['Row'];
export type IDCardInsert = Database['school']['Tables']['IDCard']['Insert'];
export type IDCardUpdate = Database['school']['Tables']['IDCard']['Update'];

export interface IDCardFormData {
  studentId: string;
  father_name: string;
  mother_name: string;
  father_mobile: string;
  mother_mobile: string;
  address: string;
  student_photo_url?: File;
  father_photo_url?: File;
  mother_photo_url?: File;
}

// Service for managing ID card operations
export const idCardService = {
  /**
   * Create a new ID card
   * @param data ID card data
   * @returns Created ID card
   */
  async create(data: IDCardFormData): Promise<IDCardData> {
    // Get student details
    const student = await studentService.findOne(data.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Upload photos if provided
    const student_photo_url = data.student_photo_url
      ? await this.uploadPhoto(data.student_photo_url, 'student', data.studentId)
      : undefined;

    const father_photo_url = data.father_photo_url
      ? await this.uploadPhoto(data.father_photo_url, 'father', data.studentId)
      : undefined;

    const mother_photo_url = data.mother_photo_url
      ? await this.uploadPhoto(data.mother_photo_url, 'mother', data.studentId)
      : undefined;

    const now = new Date().toISOString();

    // Create ID card record
    const idCardData: IDCardInsert = {
      id: data.studentId,
      student_name: student.name,
      class_id: student.classId,
      father_name: data.father_name,
      mother_name: data.mother_name,
      father_mobile: data.father_mobile,
      mother_mobile: data.mother_mobile,
      address: data.address,
      student_photo_url: student_photo_url ?? null,
      father_photo_url: father_photo_url ?? null,
      mother_photo_url: mother_photo_url ?? null,
      created_at: now,
      date_of_birth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString() : null,
    };

    const { data: newCard, error } = await supabase
      .from(ID_CARD_TABLE)
      .insert([idCardData])
      .select()
      .single();

    if (error) {
      console.error('Error creating ID card:', error);
      throw error;
    }
    if (!newCard) {
        throw new Error('Failed to create ID card: The operation returned no data.');
    }
    return newCard;
  },

  /**
   * Get ID card by student ID
   * @param studentId Student ID
   * @returns ID card data
   */
  async getByStudentId(studentId: string): Promise<IDCardData | null> {
    const { data, error } = await supabase
      .from(ID_CARD_TABLE)
      .select('*')
      .eq('id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 means no rows were found, which is not an error in this case.
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching ID card:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update an existing ID card
   * @param id ID card ID
   * @param data Updated ID card data
   * @returns Updated ID card
   */
  async update(id: string, data: Partial<IDCardFormData>): Promise<IDCardData> {
    const { data: existingCard, error: fetchError } = await supabase
      .from(ID_CARD_TABLE)
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing card for update:', fetchError);
      throw fetchError;
    }
    if (!existingCard) {
      throw new Error(`ID card with id ${id} not found.`);
    }

    const updateData: IDCardUpdate = {};
    if (data.father_name) updateData.father_name = data.father_name;
    if (data.mother_name) updateData.mother_name = data.mother_name;
    if (data.father_mobile) updateData.father_mobile = data.father_mobile;
    if (data.mother_mobile) updateData.mother_mobile = data.mother_mobile;
    if (data.address) updateData.address = data.address;

    if (data.student_photo_url) {
      updateData.student_photo_url = await this.uploadPhoto(
        data.student_photo_url,
        'student',
        existingCard.id
      );
    }

    if (data.father_photo_url) {
      updateData.father_photo_url = await this.uploadPhoto(
        data.father_photo_url,
        'father',
        existingCard.id
      );
    }

    if (data.mother_photo_url) {
      updateData.mother_photo_url = await this.uploadPhoto(
        data.mother_photo_url,
        'mother',
        existingCard.id
      );
    }

    const { data: updatedCard, error } = await supabase
      .from(ID_CARD_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ID card:', error);
      throw error;
    }
    if (!updatedCard) {
      throw new Error('Failed to update ID card: The operation returned no data.');
    }

    return updatedCard;
  },

  /**
   * Upload a photo for ID card
   * @param file Photo file
   * @param type Photo type (student, father, mother)
   * @param studentId Student ID
   * @returns Photo URL
   */
  async uploadPhoto(file: File, type: 'student' | 'father' | 'mother', studentId: string): Promise<string> {
    const filePath = `id-cards/${studentId}/${type}`;
    const uploadedFile = await fileService.uploadFile(file, filePath);

    if (!uploadedFile) {
      throw new Error('Failed to upload photo');
    }

    return fileService.getViewUrl(uploadedFile.path);
  },

  /**
   * Get all ID cards
   * @returns Array of all ID cards
   */
  async getAll(): Promise<IDCardData[]> {
    const { data, error } = await supabase
      .from(ID_CARD_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all ID cards:', error);
      throw error;
    }

    return data || [];
  },

};
