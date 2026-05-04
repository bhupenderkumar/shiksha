import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const SCHOOL_FEEDBACK_TABLE = 'SchoolFeedback';
const STORAGE_BUCKET = 'File';

// Client-side rate limiting for public feedback submissions
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;
const submissionTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove expired timestamps
  while (submissionTimestamps.length > 0 && submissionTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    submissionTimestamps.shift();
  }
  return submissionTimestamps.length < MAX_SUBMISSIONS_PER_WINDOW;
}

function recordSubmission(): void {
  submissionTimestamps.push(Date.now());
}

// Helper to get typed query builder (table not yet in generated types)
const fromTable = () =>
  (supabase.schema(SCHEMA) as any).from(SCHOOL_FEEDBACK_TABLE);

export interface SchoolFeedback {
  id: string;
  ticket_code: string | null;
  category: string | null;
  parent_name: string | null;
  phone: string | null;
  message: string | null;
  voice_url: string | null;
  rating: number | null;
  created_at: string;
  status: 'NEW' | 'REVIEWED' | 'REPLIED';
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
}

export interface SchoolFeedbackFormData {
  parent_name?: string;
  phone?: string;
  message?: string;
  voice_blob?: Blob;
  rating?: number;
  category?: string;
}

/**
 * Generate a short, human-friendly ticket code (e.g. "FSPS-7K3X9P").
 * Uses crypto where available, falls back to Math.random.
 */
function generateTicketCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
  let code = '';
  const len = 6;
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) code += alphabet[arr[i] % alphabet.length];
  } else {
    for (let i = 0; i < len; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FSPS-${code}`;
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
    // Rate limit check
    if (!checkRateLimit()) {
      throw new Error('Too many submissions. Please try again after a few minutes.');
    }

    let voice_url: string | null = null;

    // Upload voice if provided
    if (formData.voice_blob) {
      voice_url = await this.uploadVoiceRecording(formData.voice_blob);
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const ticket_code = generateTicketCode();

    const feedbackData = {
      id,
      ticket_code,
      category: formData.category || null,
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

    recordSubmission();
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
   * Look up a single feedback by its ticket code (public — for parents to check status).
   * Returns null if not found.
   */
  async getByTicketCode(ticketCode: string): Promise<SchoolFeedback | null> {
    const code = (ticketCode || '').trim().toUpperCase();
    if (!code) return null;

    const { data, error } = await fromTable()
      .select('*')
      .eq('ticket_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error fetching feedback by ticket code:', error);
      throw new Error('Failed to look up feedback');
    }
    return (data as SchoolFeedback) || null;
  },

  /**
   * Save admin reply to a feedback. Sets status to REPLIED.
   */
  async replyFeedback(
    id: string,
    reply: string,
    repliedBy?: string
  ): Promise<void> {
    const trimmed = (reply || '').trim();
    if (!trimmed) throw new Error('Reply cannot be empty');

    const { error } = await fromTable()
      .update({
        admin_reply: trimmed,
        replied_at: new Date().toISOString(),
        replied_by: repliedBy || null,
        status: 'REPLIED',
      })
      .eq('id', id);

    if (error) {
      console.error('Error replying to feedback:', error);
      throw new Error('Failed to send reply');
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
