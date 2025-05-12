import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { SCHEMA } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { classService } from './classService';
import { studentService } from './student.service';

// Constants
const ID_CARD_TABLE = 'IDCard';

// Types
export interface IDCardData {
  id?: string;
  studentId: string;
  studentName: string;
  className: string;
  classSection: string;
  fatherName: string;
  motherName: string;
  fatherMobile: string;
  motherMobile: string;
  address: string;
  studentPhotoUrl?: string;
  fatherPhotoUrl?: string;
  motherPhotoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDCardFormData {
  studentId: string;
  fatherName: string;
  motherName: string;
  fatherMobile: string;
  motherMobile: string;
  address: string;
  studentPhoto?: File;
  fatherPhoto?: File;
  motherPhoto?: File;
}

// Service for managing ID card operations
export const idCardService = {
  /**
   * Create a new ID card
   * @param data ID card data
   * @returns Created ID card
   */
  async create(data: IDCardFormData): Promise<IDCardData> {
    try {
      // Get student details
      const student = await studentService.findOne(data.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Get class details
      const classDetails = student.class || { name: 'N/A', section: 'N/A' };

      // Upload photos if provided
      const studentPhotoUrl = data.studentPhoto
        ? await this.uploadPhoto(data.studentPhoto, 'student', data.studentId)
        : undefined;

      const fatherPhotoUrl = data.fatherPhoto
        ? await this.uploadPhoto(data.fatherPhoto, 'father', data.studentId)
        : undefined;

      const motherPhotoUrl = data.motherPhoto
        ? await this.uploadPhoto(data.motherPhoto, 'mother', data.studentId)
        : undefined;

      const now = new Date();
      const idCardId = uuidv4();

      // Create ID card record
      const idCardData: IDCardData = {
        id: idCardId,
        studentId: data.studentId,
        studentName: student.name,
        className: classDetails.name,
        classSection: classDetails.section,
        fatherName: data.fatherName,
        motherName: data.motherName,
        fatherMobile: data.fatherMobile,
        motherMobile: data.motherMobile,
        address: data.address,
        studentPhotoUrl,
        fatherPhotoUrl,
        motherPhotoUrl,
        createdAt: now,
        updatedAt: now
      };

      const { error } = await supabase
        .from(ID_CARD_TABLE)
        .insert([idCardData]);

      if (error) {
        throw error;
      }

      return idCardData;
    } catch (error) {
      console.error('Error creating ID card:', error);
      throw error;
    }
  },

  /**
   * Get ID card by student ID
   * @param studentId Student ID
   * @returns ID card data
   */
  async getByStudentId(studentId: string): Promise<IDCardData | null> {
    try {
      const { data, error } = await supabase
        .from(ID_CARD_TABLE)
        .select('*')
        .eq('studentId', studentId)
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }

      return data as IDCardData;
    } catch (error: any) {
      console.error('Error fetching ID card:', error);
      if (error?.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update an existing ID card
   * @param id ID card ID
   * @param data Updated ID card data
   * @returns Updated ID card
   */
  async update(id: string, data: Partial<IDCardFormData>): Promise<IDCardData> {
    try {
      // Get existing ID card
      const { data: existingCard, error: fetchError } = await supabase
        .from(ID_CARD_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Upload new photos if provided
      const updateData: Partial<IDCardData> = {
        fatherName: data.fatherName,
        motherName: data.motherName,
        fatherMobile: data.fatherMobile,
        motherMobile: data.motherMobile,
        address: data.address,
        updatedAt: new Date()
      };

      if (data.studentPhoto) {
        updateData.studentPhotoUrl = await this.uploadPhoto(
          data.studentPhoto,
          'student',
          existingCard.studentId
        );
      }

      if (data.fatherPhoto) {
        updateData.fatherPhotoUrl = await this.uploadPhoto(
          data.fatherPhoto,
          'father',
          existingCard.studentId
        );
      }

      if (data.motherPhoto) {
        updateData.motherPhotoUrl = await this.uploadPhoto(
          data.motherPhoto,
          'mother',
          existingCard.studentId
        );
      }

      // No need to delete properties that don't exist on updateData

      const { data: updatedCard, error } = await supabase
        .from(ID_CARD_TABLE)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedCard as IDCardData;
    } catch (error) {
      console.error('Error updating ID card:', error);
      throw error;
    }
  },

  /**
   * Upload a photo for ID card
   * @param file Photo file
   * @param type Photo type (student, father, mother)
   * @param studentId Student ID
   * @returns Photo URL
   */
  async uploadPhoto(file: File, type: 'student' | 'father' | 'mother', studentId: string): Promise<string> {
    try {
      const filePath = `id-cards/${studentId}/${type}`;
      const uploadedFile = await fileService.uploadFile(file, filePath);

      if (!uploadedFile) {
        throw new Error('Failed to upload photo');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('File')
        .getPublicUrl(uploadedFile.path);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      throw error;
    }
  },

  /**
   * Get all students from ID cards by class ID
   * @param classId Class ID
   * @returns Array of students with their photos
   */
  async getStudentsByClass(classId: string): Promise<any[]> {
    try {
      console.log(`Fetching students for class ID: ${classId}`);

      // Use studentService directly
      console.log('Using studentService to get students...');
      const students = await studentService.getStudentsByClass(classId);

      if (students && students.length > 0) {
        console.log(`Found ${students.length} students using studentService`);

        // Map to the expected format
        return students.map((student: { id: string; name: string; classId?: string }) => ({
          id: student.id,
          student_name: student.name,
          student_photo_url: null, // We don't have photos from this service
          class_id: student.classId || classId // Use student's classId if available, otherwise use the provided classId
        }));
      } else {
        console.log('No students found for this class');
        return [];
      }
    } catch (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
  }
};
