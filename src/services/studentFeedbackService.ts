import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { 
  StudentFeedback, 
  StudentFeedbackFormData, 
  FeedbackSearchParams,
  FeedbackCertificate,
  CertificateData
} from '@/types/feedback';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { SCHOOL_INFO } from '@/lib/constants';

// Constants
const STUDENT_FEEDBACK_TABLE = 'StudentFeedback';
const FEEDBACK_CERTIFICATE_TABLE = 'FeedbackCertificate';
const CLASS_TABLE = 'Class';
const FILE_BUCKET = 'File';

export const studentFeedbackService = {
  /**
   * Create a new student feedback entry
   * @param data Feedback form data
   * @returns Created feedback
   */
  async createFeedback(data: StudentFeedbackFormData): Promise<StudentFeedback> {
    try {
      // Upload photo if provided
      let studentPhotoUrl = '';
      if (data.student_photo && typeof data.student_photo !== 'string') {
        studentPhotoUrl = await this.uploadPhoto(data.student_photo, data.student_name);
      } else if (typeof data.student_photo === 'string') {
        studentPhotoUrl = data.student_photo;
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      const feedbackData = {
        id,
        class_id: data.class_id,
        student_name: data.student_name,
        month: data.month,
        good_things: data.good_things,
        need_to_improve: data.need_to_improve,
        best_can_do: data.best_can_do,
        attendance_percentage: data.attendance_percentage,
        student_photo_url: studentPhotoUrl,
        created_at: now,
        updated_at: now,
        created_by: supabase.auth.getUser().then(res => res.data.user?.id)
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_FEEDBACK_TABLE)
        .insert([feedbackData])
        .select()
        .single();

      if (error) throw error;

      return result as StudentFeedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  /**
   * Update an existing student feedback
   * @param id Feedback ID
   * @param data Updated feedback data
   * @returns Updated feedback
   */
  async updateFeedback(id: string, data: Partial<StudentFeedbackFormData>): Promise<StudentFeedback> {
    try {
      // Upload photo if provided and is a File
      let updateData: any = { ...data, updated_at: new Date().toISOString() };
      
      if (data.student_photo && typeof data.student_photo !== 'string') {
        const studentPhotoUrl = await this.uploadPhoto(data.student_photo, data.student_name || 'student');
        updateData.student_photo_url = studentPhotoUrl;
        delete updateData.student_photo;
      } else if (typeof data.student_photo === 'string') {
        updateData.student_photo_url = data.student_photo;
        delete updateData.student_photo;
      }

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_FEEDBACK_TABLE)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return result as StudentFeedback;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  /**
   * Get a student feedback by ID
   * @param id Feedback ID
   * @returns Feedback data
   */
  async getFeedbackById(id: string): Promise<StudentFeedback | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_FEEDBACK_TABLE)
        .select(`
          *,
          Class:class_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Add className from joined data
      const feedback = {
        ...data,
        className: data.Class?.name || ''
      };

      delete feedback.Class;
      return feedback as StudentFeedback;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }
  },

  /**
   * Search for student feedback based on parameters
   * @param params Search parameters
   * @returns List of matching feedback entries
   */
  async searchFeedback(params: FeedbackSearchParams): Promise<StudentFeedback[]> {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(STUDENT_FEEDBACK_TABLE)
        .select(`
          *,
          Class:class_id (
            id,
            name
          )
        `);

      // Apply filters
      if (params.class_id) {
        query = query.eq('class_id', params.class_id);
      }

      if (params.student_name) {
        query = query.ilike('student_name', `%${params.student_name}%`);
      }
      
      if (params.month) {
        query = query.eq('month', params.month);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Add className from joined data
      return (data || []).map(item => ({
        ...item,
        className: item.Class?.name || ''
      })) as StudentFeedback[];
    } catch (error) {
      console.error('Error searching feedback:', error);
      return [];
    }
  },

  /**
   * Delete a student feedback
   * @param id Feedback ID
   * @returns Success status
   */
  async deleteFeedback(id: string): Promise<boolean> {
    try {
      // First delete any associated certificates
      await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .delete()
        .eq('feedback_id', id);

      // Then delete the feedback
      const { error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_FEEDBACK_TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return false;
    }
  },

  /**
   * Upload a student photo
   * @param file Photo file
   * @param studentName Student name for file naming
   * @returns Photo URL
   */
  async uploadPhoto(file: File, studentName: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileName = `${sanitizedName}_${Date.now()}.${fileExt}`;
      const filePath = `student-feedback/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(FILE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(FILE_BUCKET)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  /**
   * Generate a certificate for a feedback
   * @param feedbackId Feedback ID
   * @returns Certificate data
   */
  async generateCertificate(feedbackId: string): Promise<FeedbackCertificate> {
    try {
      // Get feedback data
      const feedback = await this.getFeedbackById(feedbackId);
      if (!feedback) {
        throw new Error('Feedback not found');
      }

      // Create certificate data
      const certificateData: CertificateData = {
        studentName: feedback.student_name,
        className: feedback.className || '',
        month: feedback.month,
        goodThings: feedback.good_things,
        needToImprove: feedback.need_to_improve,
        bestCanDo: feedback.best_can_do,
        attendancePercentage: feedback.attendance_percentage,
        studentPhotoUrl: feedback.student_photo_url,
        schoolName: SCHOOL_INFO.name,
        schoolAddress: SCHOOL_INFO.address,
        date: new Date().toLocaleDateString()
      };

      // Generate PDF certificate
      const certificateUrl = await this.createCertificatePDF(certificateData);

      // Save certificate to database
      const certificateId = uuidv4();
      const now = new Date().toISOString();

      const certificateData = {
        id: certificateId,
        feedback_id: feedbackId,
        certificate_url: certificateUrl,
        download_count: 0,
        created_at: now,
        updated_at: now
      };

      const { data: result, error } = await supabase
        .schema(SCHEMA)
        .from(FEEDBACK_CERTIFICATE_TABLE)
        .insert([certificateData])
        .select()
        .single();

      if (error) throw error;

      return result as FeedbackCertificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },

  /**
   * Create a PDF certificate
   * @param data Certificate data
   * @returns Certificate URL or base64 data
   */
  async createCertificatePDF(data: CertificateData): Promise<string> {
    // This is a placeholder - in a real implementation, you would generate a PDF
    // and either save it to storage or return it as base64
    // For now, we'll return a placeholder URL
    return `https://example.com/certificates/${Date.now()}.pdf`;
  }
};

export default studentFeedbackService;
