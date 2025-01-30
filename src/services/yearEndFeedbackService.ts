import { supabase } from '@/lib/api-client';
import { fileService } from './fileService';
import { SCHEMA } from '@/lib/constants';

export interface YearEndFeedbackType {
  id: string;
  student_id: string;
  academic_year_id: string;
  parent_feedback: string;
  student_feedback: string;
  areas_of_improvement: string;
  strengths: string;
  next_class_recommendation: string;
  student_photo_url: string;
  father_photo_url: string;
  mother_photo_url: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  father_contact: string;
  mother_contact: string;
  father_email: string;
  mother_email: string;
  address: string;
  emergency_contact: string;
  medical_conditions: string;
  extracurricular_activities: string;
  achievements: string;
  attendance_record: Record<string, any>;
  feedback_status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  Student?: {
    id: string;
    name: string;
    admissionNumber: string;
    Class: {
      id: string;
      name: string;
    };
  };
}

export const yearEndFeedbackService = {
  async uploadPhoto(file: File, type: 'student' | 'father' | 'mother'): Promise<string | null> {
    try {
      const filePath = `year-end-feedback/${type}-photos`;
      const data = await fileService.uploadFile(file, filePath);
      if (!data) return null;

      const { data: { publicUrl } } = supabase.storage
        .from('File')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  async submitFeedback(feedback: Omit<YearEndFeedbackType, 'id' | 'created_at' | 'updated_at'>): Promise<YearEndFeedbackType> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('YearEndFeedback')
        .insert([{
          ...feedback,
          submitted_at: new Date().toISOString(),
        }])
        .select(`
          *,
          Student:student_id (
            id,
            name,
            admission_number:admissionNumber,
            class:classId (
              id,
              name
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  async getFeedback(id: string): Promise<YearEndFeedbackType> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('YearEndFeedback')
        .select(`
          *,
          Student:student_id (
            id,
            name,
            admission_number:admissionNumber,
            class:classId (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  },

  async getAllFeedback(academicYearId: string): Promise<YearEndFeedbackType[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('YearEndFeedback')
        .select(`
          *,
          Student:student_id (
            id,
            name,
            admission_number:admissionNumber,
            class:classId (
              id,
              name
            )
          )
        `)
        .eq('academic_year_id', academicYearId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all feedback:', error);
      throw error;
    }
  },

  async updateFeedbackStatus(id: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from('YearEndFeedback')
        .update({ feedback_status: status })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  },

  async getActiveAcademicYear(): Promise<{ id: string; year_name: string }> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('AcademicYear')
        .select('id, year_name')
        .eq('status', 'ACTIVE')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting active academic year:', error);
      throw error;
    }
  }
};
