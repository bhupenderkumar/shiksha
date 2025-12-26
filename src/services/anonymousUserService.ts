import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

const ANONYMOUS_USER_TABLE = 'AnonymousUser';
const ANONYMOUS_USER_PROGRESS_TABLE = 'AnonymousUserProgress';

export interface AnonymousUser {
  id: string;
  name: string;
  mobile_number?: string;
  created_at?: string;
  last_active?: string;
}

export interface AnonymousUserProgress {
  id: string;
  user_id: string;
  assignment_id: number;
  score?: number;
  completed: boolean;
  started_at?: string;
  completed_at?: string;
  responses?: Record<string, any>;
}

/**
 * Service for managing anonymous users who access exercises via shared links
 */
export const anonymousUserService = {
  /**
   * Create a new anonymous user or update an existing one
   */
  async createOrUpdateUser(name: string, mobileNumber?: string): Promise<AnonymousUser | null> {
    try {
      // Check if user with this mobile number already exists
      if (mobileNumber) {
        const { data: existingUser } = await supabase
          .schema(SCHEMA as any)
          .from(ANONYMOUS_USER_TABLE)
          .select('*')
          .eq('mobile_number', mobileNumber)
          .single();

        if (existingUser) {
          // Update the existing user's name and last_active
          const { data: updatedUser, error } = await supabase
            .schema(SCHEMA as any)
            .from(ANONYMOUS_USER_TABLE)
            .update({
              name,
              last_active: new Date().toISOString()
            })
            .eq('id', existingUser.id)
            .select()
            .single();

          if (error) throw error;
          return updatedUser;
        }
      }

      // Create a new user
      const { data: newUser, error } = await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_TABLE)
        .insert({
          name,
          mobile_number: mobileNumber || null
        })
        .select()
        .single();

      if (error) throw error;
      return newUser;
    } catch (error) {
      console.error('Error creating/updating anonymous user:', error);
      return null;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<AnonymousUser | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting anonymous user:', error);
      return null;
    }
  },

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_TABLE)
        .update({
          last_active: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last active timestamp:', error);
    }
  },

  /**
   * Start tracking progress for an assignment
   */
  async startProgress(userId: string, assignmentId: number): Promise<AnonymousUserProgress | null> {
    try {
      // Check if progress already exists
      const { data: existingProgress } = await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_PROGRESS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .eq('assignment_id', assignmentId)
        .single();

      if (existingProgress) {
        // If not completed, just return the existing progress
        if (!existingProgress.completed) {
          return existingProgress;
        }
      }

      // Create new progress entry
      const { data, error } = await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_PROGRESS_TABLE)
        .insert({
          user_id: userId,
          assignment_id: assignmentId,
          completed: false,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting assignment progress:', error);
      return null;
    }
  },

  /**
   * Update progress with responses
   */
  async updateProgress(
    userId: string, 
    assignmentId: number, 
    responses: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_PROGRESS_TABLE)
        .update({
          responses
        })
        .eq('user_id', userId)
        .eq('assignment_id', assignmentId);
    } catch (error) {
      console.error('Error updating progress responses:', error);
    }
  },

  /**
   * Complete an assignment and record the score
   */
  async completeProgress(
    userId: string, 
    assignmentId: number, 
    score: number, 
    responses: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_PROGRESS_TABLE)
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          score,
          responses
        })
        .eq('user_id', userId)
        .eq('assignment_id', assignmentId);
    } catch (error) {
      console.error('Error completing assignment progress:', error);
    }
  },

  /**
   * Get all completed assignments for a user
   */
  async getCompletedAssignments(userId: string): Promise<AnonymousUserProgress[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA as any)
        .from(ANONYMOUS_USER_PROGRESS_TABLE)
        .select(`
          *,
          assignment:assignment_id (
            id,
            title,
            description,
            type
          )
        `)
        .eq('user_id', userId)
        .eq('completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting completed assignments:', error);
      return [];
    }
  }
};
