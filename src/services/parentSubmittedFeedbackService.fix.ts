import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import {
  ParentSubmittedFeedback,
  ParentSubmittedFeedbackFormData
} from '@/types/parentFeedback';
import { v4 as uuidv4 } from 'uuid';

// Constants
const PARENT_SUBMITTED_FEEDBACK_TABLE = 'ParentSubmittedFeedback';
const CLASS_TABLE = 'Class';

export const parentSubmittedFeedbackService = {
  /**
   * Get the correct class ID from a class name or identifier
   * @param classIdentifier Class name or ID
   * @returns Correct UUID for the class
   */
  async getCorrectClassId(classIdentifier: string): Promise<string | null> {
    try {
      console.log(`Looking up correct class ID for: ${classIdentifier}`);
      
      // First try to find by name
      const { data: classData, error: classError } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id')
        .eq('name', classIdentifier)
        .single();
      
      if (classData) {
        console.log(`Found class by name: ${classData.id}`);
        return classData.id;
      }
      
      // If not found by name, try to find by ID if it's already a UUID
      if (classIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's already a UUID, just return it
        console.log(`Class identifier is already a UUID: ${classIdentifier}`);
        return classIdentifier;
      }
      
      // If it's not a UUID and not found by name, try a more flexible search
      const { data: flexData, error: flexError } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id')
        .or(`name.ilike.%${classIdentifier}%,id::text.ilike.%${classIdentifier}%`)
        .limit(1);
      
      if (flexData && flexData.length > 0) {
        console.log(`Found class by flexible search: ${flexData[0].id}`);
        return flexData[0].id;
      }
      
      // If still not found, get the first class as a fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id')
        .limit(1);
      
      if (fallbackData && fallbackData.length > 0) {
        console.log(`Using fallback class ID: ${fallbackData[0].id}`);
        return fallbackData[0].id;
      }
      
      console.log('Could not find any class ID');
      return null;
    } catch (error) {
      console.error('Error getting correct class ID:', error);
      return null;
    }
  },

  /**
   * Check if feedback already exists for a student in a specific month
   * @param class_id Class ID
   * @param student_name Student name
   * @param month Month
   * @returns Existing feedback or null
   */
  async checkExistingFeedback(class_id: string, student_name: string, month: string): Promise<ParentSubmittedFeedback | null> {
    try {
      console.log('Checking for existing feedback:', { class_id, student_name, month });
      
      // First get the correct class ID
      const correctClassId = await this.getCorrectClassId(class_id);
      
      if (!correctClassId) {
        console.error('Could not find a valid class ID');
        return null;
      }
      
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
        .select(`
          *,
          Class:class_id (
            id,
            name,
            section
          )
        `)
        .eq('class_id', correctClassId)
        .eq('student_name', student_name)
        .eq('month', month);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error checking existing feedback: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('No existing feedback found');
        return null;
      }

      console.log('Found existing feedback:', data[0]);
      
      // Format the result to include className and classSection
      const formattedResult = {
        ...data[0],
        className: data[0].Class?.name || '',
        classSection: data[0].Class?.section || ''
      };

      return formattedResult as ParentSubmittedFeedback;
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      // Return null instead of throwing to prevent errors from propagating
      return null;
    }
  },

  /**
   * Submit new parent feedback or update existing one
   * @param data Parent feedback form data
   * @returns Created or updated feedback
   */
  async submitFeedback(data: ParentSubmittedFeedbackFormData): Promise<ParentSubmittedFeedback | null> {
    try {
      const now = new Date().toISOString();
      
      // Get the correct class ID
      const correctClassId = await this.getCorrectClassId(data.class_id);
      
      if (!correctClassId) {
        console.error('Could not find a valid class ID');
        return null;
      }
      
      // Check if feedback already exists for this student and month
      const existingFeedback = await this.checkExistingFeedback(
        correctClassId,
        data.student_name,
        data.month
      );

      // Generate a new ID for new submissions
      const id = existingFeedback?.id || uuidv4();
      
      // Prepare feedback data
      const feedbackData = {
        id,
        class_id: correctClassId,
        student_name: data.student_name,
        parent_name: data.parent_name,
        month: data.month,
        feedback: data.feedback,
        created_at: existingFeedback ? existingFeedback.created_at : now,
        updated_at: now,
        status: 'PENDING'
      };

      console.log('Submitting feedback to Supabase:', feedbackData);
      
      let result;
      
      if (existingFeedback) {
        // Update existing feedback
        const { data: updateResult, error: updateError } = await supabase
          .schema(SCHEMA)
          .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
          .update({
            parent_name: data.parent_name,
            feedback: data.feedback,
            updated_at: now,
            status: 'PENDING' // Reset status when feedback is updated
          })
          .eq('id', id)
          .select(`
            *,
            Class:class_id (
              id,
              name,
              section
            )
          `);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(`Error updating feedback: ${updateError.message}`);
        }
        
        result = updateResult[0];
      } else {
        // Insert new feedback
        const { data: insertResult, error: insertError } = await supabase
          .schema(SCHEMA)
          .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
          .insert(feedbackData)
          .select(`
            *,
            Class:class_id (
              id,
              name,
              section
            )
          `);

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(`Error submitting feedback: ${insertError.message}`);
        }
        
        result = insertResult[0];
      }
      
      if (!result) {
        console.error('No result returned from Supabase');
        return null;
      }
      
      // Format the result to include className and classSection
      const formattedResult = {
        ...result,
        className: result.Class?.name || '',
        classSection: result.Class?.section || ''
      };
      
      return formattedResult as ParentSubmittedFeedback;
    } catch (error) {
      console.error('Error submitting parent feedback:', error);
      // Return null instead of throwing to prevent errors from propagating
      return null;
    }
  },

  // Other methods remain the same...
};
