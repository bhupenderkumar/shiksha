import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const SCHOOL_FEEDBACK_TABLE = 'SchoolFeedback';
const STORAGE_BUCKET = 'File';

// Helper to get typed query builder (table not yet in generated types)
const fromTable = () =>
  (supabase.schema(SCHEMA) as any).from(SCHOOL_FEEDBACK_TABLE);

export interface SchoolFeedback {
  id: string;
  parent_name: string | null;
  phone: string | null;
  message: string | null;
  voice_url: string | null;
  rating: number | null;
  created_at: string;
  status: 'NEW' | 'REVIEWED';
}

export interface SchoolFeedbackFormData {
  parent_name?: string;
  phone?: string;
  message?: string;
  voice_blob?: Blob;
  rating?: number;
}

export const schoolFeedbackService = {
  /**
   * Upload voice recording to Supabase storage
   */
  async uploadVoiceRecording(blob: Blob): Promise<string> {
    const fileName = `school-feedback/voice/${uuidv4()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'audio/webm',
      });

    if (uploadError) {
      console.error('Error uploading voice recording:', uploadError);
      throw new Error('आवाज अपलोड नहीं हो सकी / Voice upload failed');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  /**
   * Submit school feedback (public - no auth needed)
   */
  async submitFeedback(formData: SchoolFeedbackFormData): Promise<SchoolFeedback> {
    let voice_url: string | null = null;

    // Upload voice if provided
    if (formData.voice_blob) {
      voice_url = await this.uploadVoiceRecording(formData.voice_blob);
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const feedbackData = {
      id,
      parent_name: formData.parent_name || null,
      phone: formData.phone || null,
      message: formData.message || null,
      voice_url,
      rating: formData.rating || null,
      created_at: now,
      status: 'NEW',
    };

    const { data, error } = await fromTable()
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('फीडबैक जमा नहीं हो सका / Feedback submission failed');
    }

    return data as SchoolFeedback;
  },

  /**
   * Get all feedback (admin only)
   */
  async getAllFeedback(): Promise<SchoolFeedback[]> {
    const { data, error } = await fromTable()
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      throw new Error('Failed to load feedback');
    }

    return (data || []) as SchoolFeedback[];
  },

  /**
   * Mark feedback as reviewed (admin)
   */
  async markReviewed(id: string): Promise<void> {
    const { error } = await fromTable()
      .update({ status: 'REVIEWED' })
      .eq('id', id);

    if (error) {
      console.error('Error updating feedback:', error);
      throw new Error('Failed to update feedback');
    }
  },

  /**
   * Delete feedback (admin)
   */
  async deleteFeedback(id: string): Promise<void> {
    const { error } = await fromTable()
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feedback:', error);
      throw new Error('Failed to delete feedback');
    }
  },

  /**
   * Get signed URL for voice playback
   */
  async getVoiceUrl(filePath: string): Promise<string> {
    // If it's already a full URL, return as-is
    if (filePath.startsWith('http')) {
      return filePath;
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Error getting voice URL:', error);
      throw new Error('Failed to get voice URL');
    }

    return data.signedUrl;
  },
};
