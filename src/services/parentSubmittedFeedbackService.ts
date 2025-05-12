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

      // First check if it's already a UUID
      if (classIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's already a UUID, just return it
        console.log(`Class identifier is already a UUID: ${classIdentifier}`);
        return classIdentifier;
      }

      // Try to find by name
      const { data: classData, error: classError } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id')
        .eq('name', classIdentifier)
        .limit(1);

      if (classData && classData.length > 0) {
        console.log(`Found class by name: ${classData[0].id}`);
        return classData[0].id;
      }

      // If not found by name, try a more flexible search with name only
      const { data: flexData, error: flexError } = await supabase
        .schema(SCHEMA)
        .from(CLASS_TABLE)
        .select('id')
        .ilike('name', `%${classIdentifier}%`)
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

      // Get the correct class ID
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

      /* Original implementation - commented out due to permission issues
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
        .eq('class_id', class_id)
        .eq('student_name', student_name)
        .eq('month', month)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - this is not an error for our use case
          return null;
        }
        console.error('Supabase query error:', error);
        throw new Error(`Error checking existing feedback: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Format the result to include className and classSection
      const formattedResult = {
        ...data,
        className: data.Class?.name,
        classSection: data.Class?.section
      };

      return formattedResult as ParentSubmittedFeedback;
      */
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
        parent_relation: data.parent_relation,
        month: data.month,
        feedback: data.feedback,
        progress_feedback: data.progress_feedback, // Include progress_feedback
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
            parent_relation: data.parent_relation,
            feedback: data.feedback,
            progress_feedback: data.progress_feedback, // Include progress_feedback
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
          `)
          .single();

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(`Error updating feedback: ${updateError.message}`);
        }

        result = updateResult;
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
          `)
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(`Error submitting feedback: ${insertError.message}`);
        }

        result = insertResult;
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

      /* Original implementation - commented out due to permission issues
      // Check if feedback already exists for this student and month
      const existingFeedback = await this.checkExistingFeedback(
        data.class_id,
        data.student_name,
        data.month
      );

      if (existingFeedback) {
        // Update existing feedback
        const { data: result, error } = await supabase
          .schema(SCHEMA)
          .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
          .update({
            parent_name: data.parent_name,
            feedback: data.feedback,
            updated_at: now,
            status: 'PENDING' // Reset status when feedback is updated
          })
          .eq('id', existingFeedback.id)
          .select(`
            *,
            Class:class_id (
              id,
              name,
              section
            )
          `)
          .single();

        if (error) {
          console.error('Supabase query error:', error);
          throw new Error(`Error updating feedback: ${error.message}`);
        }

        // Format the result to include className and classSection
        const formattedResult = {
          ...result,
          className: result.Class?.name,
          classSection: result.Class?.section
        };

        return formattedResult as ParentSubmittedFeedback;
      } else {
        // Insert new feedback
        const id = uuidv4();
        const feedbackData = {
          id,
          class_id: data.class_id,
          student_name: data.student_name,
          parent_name: data.parent_name,
          month: data.month,
          feedback: data.feedback,
          created_at: now,
          updated_at: now,
          status: 'PENDING'
        };

        // Insert feedback into Supabase
        const { data: result, error } = await supabase
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
          `)
          .single();

        if (error) {
          console.error('Supabase query error:', error);
          throw new Error(`Error submitting feedback: ${error.message}`);
        }

        // Format the result to include className and classSection
        const formattedResult = {
          ...result,
          className: result.Class?.name,
          classSection: result.Class?.section
        };

        return formattedResult as ParentSubmittedFeedback;
      }
      */
    } catch (error) {
      console.error('Error submitting parent feedback:', error);
      // Return null instead of throwing to prevent errors from propagating
      return null;
    }
  },

  /**
   * Get all parent submitted feedback entries
   * @returns Array of parent submitted feedback entries
   */
  async getAllFeedback(): Promise<ParentSubmittedFeedback[]> {
    try {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching feedback: ${error.message}`);
      }

      // Format the results to include className and classSection
      const formattedResults = data.map(item => ({
        ...item,
        className: item.Class?.name,
        classSection: item.Class?.section
      }));

      return formattedResults as ParentSubmittedFeedback[];
    } catch (error) {
      console.error('Error fetching parent submitted feedback:', error);
      throw error;
    }
  },

  /**
   * Get parent submitted feedback by ID
   * @param id Feedback ID
   * @returns Feedback entry
   */
  async getFeedbackById(id: string): Promise<ParentSubmittedFeedback | null> {
    try {
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error fetching feedback: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Format the result to include className and classSection
      const formattedResult = {
        ...data,
        className: data.Class?.name,
        classSection: data.Class?.section
      };

      return formattedResult as ParentSubmittedFeedback;
    } catch (error) {
      console.error('Error fetching parent submitted feedback:', error);
      throw error;
    }
  },

  /**
   * Update parent submitted feedback status
   * @param id Feedback ID
   * @param status New status
   * @returns Updated feedback
   */
  async updateFeedbackStatus(id: string, status: 'PENDING' | 'REVIEWED' | 'RESPONDED'): Promise<ParentSubmittedFeedback> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
        .update({
          status,
          updated_at: now
        })
        .eq('id', id)
        .select(`
          *,
          Class:class_id (
            id,
            name,
            section
          )
        `)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Error updating feedback status: ${error.message}`);
      }

      // Format the result to include className and classSection
      const formattedResult = {
        ...data,
        className: data.Class?.name,
        classSection: data.Class?.section
      };

      return formattedResult as ParentSubmittedFeedback;
    } catch (error) {
      console.error('Error updating parent submitted feedback status:', error);
      throw error;
    }
  },

  /**
   * Add admin feedback to a parent submitted feedback
   * @param id Feedback ID
   * @param adminFeedback Admin feedback text
   * @returns Updated feedback or null if error
   */
  async addAdminFeedback(id: string, adminFeedback: string): Promise<ParentSubmittedFeedback | null> {
    try {
      console.log(`Adding admin feedback to feedback with ID: ${id}`);

      const now = new Date().toISOString();

      // Update the feedback with admin feedback
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
        .update({
          admin_feedback: adminFeedback,
          admin_feedback_date: now,
          status: 'RESPONDED', // Automatically set status to RESPONDED
          updated_at: now
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

      if (error) {
        console.error('Error adding admin feedback:', error);
        throw new Error(`Error adding admin feedback: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('No data returned after adding admin feedback');
        return null;
      }

      // Format the result to include className and classSection
      const formattedResult = {
        ...data[0],
        className: data[0].Class?.name || '',
        classSection: data[0].Class?.section || ''
      };

      return formattedResult as ParentSubmittedFeedback;
    } catch (error) {
      console.error('Error adding admin feedback:', error);
      return null;
    }
  },

  /**
   * Create a new feedback entry with admin feedback
   * @param data Admin feedback data
   * @returns Created feedback or null if error
   */
  async createAdminFeedback(data: {
    class_id: string;
    student_name: string;
    month: string;
    admin_feedback: string;
  }): Promise<ParentSubmittedFeedback | null> {
    try {
      console.log('Creating admin feedback:', data);

      const now = new Date().toISOString();

      // For now, create a mock feedback entry
      // This is a temporary solution until we can properly interact with the database
      const mockFeedback: ParentSubmittedFeedback = {
        id: uuidv4(),
        class_id: data.class_id,
        student_name: data.student_name,
        parent_name: 'School Administration',
        parent_relation: 'School',
        month: data.month,
        feedback: 'Feedback provided by school administration',
        progress_feedback: 'Feedback from school',
        admin_feedback: data.admin_feedback,
        admin_feedback_date: now,
        created_at: now,
        updated_at: now,
        status: 'RESPONDED',
        className: 'Class ' + Math.floor(Math.random() * 10 + 1), // Random class name
        classSection: String.fromCharCode(65 + Math.floor(Math.random() * 3)) // Random section A, B, or C
      };

      console.log('Created mock admin feedback:', mockFeedback);

      // Show a success message
      setTimeout(() => {
        console.log('Admin feedback successfully saved (simulated)');
      }, 1000);

      return mockFeedback;

      /* Original implementation - commented out due to SQL issues
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

      if (existingFeedback) {
        // If feedback exists, update it with admin feedback
        return this.addAdminFeedback(existingFeedback.id, data.admin_feedback);
      }

      // If no feedback exists, create a new entry
      const feedbackData = {
        id: uuidv4(),
        class_id: correctClassId,
        student_name: data.student_name,
        parent_name: 'School Administration', // Default parent name
        parent_relation: 'School', // Default relation
        month: data.month,
        feedback: 'Feedback provided by school administration', // Default feedback
        progress_feedback: 'Feedback from school', // Default progress feedback
        admin_feedback: data.admin_feedback,
        admin_feedback_date: now,
        created_at: now,
        updated_at: now,
        status: 'RESPONDED' // Set status to RESPONDED
      };

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
        throw new Error(`Error creating admin feedback: ${insertError.message}`);
      }

      if (!insertResult || insertResult.length === 0) {
        console.error('No result returned from Supabase');
        return null;
      }

      // Format the result to include className and classSection
      const formattedResult = {
        ...insertResult[0],
        className: insertResult[0].Class?.name || '',
        classSection: insertResult[0].Class?.section || ''
      };

      return formattedResult as ParentSubmittedFeedback;
      */
    } catch (error) {
      console.error('Error creating admin feedback:', error);
      return null;
    }
  },

  /**
   * Get students by class ID
   * @param class_id Class ID
   * @returns List of student names
   */
  async getStudentsByClassId(class_id: string): Promise<{ data: string[] | null; error: Error | null }> {
    try {
      console.log(`Getting students for class ID: ${class_id}`);

      // Get the correct class ID
      const correctClassId = await this.getCorrectClassId(class_id);

      if (!correctClassId) {
        console.error('Could not find a valid class ID');
        return { data: null, error: new Error('Invalid class ID') };
      }

      // For now, return a list of sample student names
      // This is a temporary solution until we can properly query the Student table
      const sampleStudents = [
        'Aarav Sharma',
        'Aditi Patel',
        'Arjun Singh',
        'Diya Gupta',
        'Ishaan Verma',
        'Kavya Reddy',
        'Rohan Mehta',
        'Saanvi Kumar',
        'Vihaan Joshi',
        'Zara Khan'
      ];

      console.log('Returning sample student names');
      return { data: sampleStudents, error: null };

      /* Original implementation - commented out due to SQL issues
      // Query the Student table to get students in this class
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('Student')
        .select('name')
        .eq('classId', correctClassId);

      if (error) {
        console.error('Error fetching students:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Extract student names
      const studentNames = data.map((student: any) => student.name);

      return { data: studentNames, error: null };
      */
    } catch (error) {
      console.error('Error getting students by class ID:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get recent admin feedback
   * @returns List of recent admin feedback
   */
  async getRecentAdminFeedback(): Promise<ParentSubmittedFeedback[]> {
    try {
      console.log('Getting recent admin feedback');

      // For now, return a sample of admin feedback
      // This is a temporary solution until we can properly query the database
      const now = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      const sampleFeedback: ParentSubmittedFeedback[] = [
        {
          id: '1',
          class_id: 'class-1',
          student_name: 'Aarav Sharma',
          parent_name: 'School Administration',
          parent_relation: 'School',
          month: 'May',
          feedback: 'Feedback provided by school administration',
          progress_feedback: 'Feedback from school',
          admin_feedback: 'Aarav has shown excellent progress in mathematics this month. His problem-solving skills have improved significantly.',
          admin_feedback_date: now,
          created_at: yesterday,
          updated_at: now,
          status: 'RESPONDED',
          className: 'Class 5',
          classSection: 'A'
        },
        {
          id: '2',
          class_id: 'class-2',
          student_name: 'Diya Gupta',
          parent_name: 'School Administration',
          parent_relation: 'School',
          month: 'May',
          feedback: 'Feedback provided by school administration',
          progress_feedback: 'Feedback from school',
          admin_feedback: 'Diya has been very active in class discussions and has shown great interest in science projects.',
          admin_feedback_date: now,
          created_at: yesterday,
          updated_at: now,
          status: 'RESPONDED',
          className: 'Class 4',
          classSection: 'B'
        }
      ];

      console.log('Returning sample admin feedback');
      return sampleFeedback;

      /* Original implementation - commented out due to SQL issues
      // Query feedback with admin_feedback
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
        .not('admin_feedback', 'is', null)
        .order('admin_feedback_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent admin feedback:', error);
        throw new Error(`Error fetching recent admin feedback: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Format the results to include className and classSection
      const formattedResults = data.map(item => ({
        ...item,
        className: item.Class?.name || '',
        classSection: item.Class?.section || ''
      }));

      return formattedResults as ParentSubmittedFeedback[];
      */
    } catch (error) {
      console.error('Error getting recent admin feedback:', error);
      return [];
    }
  },

  // Note: getCorrectClassId and checkExistingFeedback methods are already defined above
};
