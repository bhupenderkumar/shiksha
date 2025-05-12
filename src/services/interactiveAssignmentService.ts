import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { SCHEMA } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { progressTrackingService } from './progressTrackingService';
import { normalizeInteractiveQuestions } from '@/utils/columnNameUtils';
import type {
  InteractiveAssignment,
  InteractiveQuestion,
  InteractiveSubmission,
  InteractiveResponse,
  CreateInteractiveAssignmentData,
  UpdateInteractiveAssignmentData,
  CreateInteractiveSubmissionData,
  UpdateInteractiveSubmissionData,
  InteractiveAssignmentType,
  InteractiveAssignmentStatus,
  SubmissionStatus
} from '@/types/interactiveAssignment';

const INTERACTIVE_ASSIGNMENT_TABLE = 'InteractiveAssignment';
const INTERACTIVE_QUESTION_TABLE = 'InteractiveQuestion';
const INTERACTIVE_SUBMISSION_TABLE = 'InteractiveSubmission';
const INTERACTIVE_RESPONSE_TABLE = 'InteractiveResponse';
const FILE_TABLE = 'File';

export const interactiveAssignmentService = {
  // Get a public assignment by ID - no authentication required
  async getPublicAssignmentById(id: string): Promise<InteractiveAssignment | null> {
    try {
      console.log('Getting public assignment by ID:', id);

      // Convert string ID to number if it's a numeric string
      let numericId: number | string = id;
      if (/^\d+$/.test(id)) {
        numericId = parseInt(id, 10);
        console.log('Converted ID to numeric:', numericId);
      } else {
        console.log('ID is not numeric, using as is');
      }

      // Use the supabase client directly instead of REST API to avoid schema issues
      const { data: assignment, error: assignmentError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `)
        .eq('id', numericId)
        .single();

      if (assignmentError) {
        console.error('Error fetching assignment:', assignmentError);
        return null;
      }

      if (!assignment) {
        console.log('No assignment found with ID:', numericId);
        return null;
      }

      console.log('Found assignment:', assignment);

      // Get the questions
      const { data: questions, error: questionsError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .select('*')
        .eq('assignmentId', assignment.id)
        .order('order', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        return null;
      }

      console.log('Found questions:', questions);

      // Format dates and combine data
      const formattedAssignment = {
        ...assignment,
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
        questions: normalizeInteractiveQuestions(questions || []),
        attachments: []
      };

      return formattedAssignment;
    } catch (error) {
      console.error('Error fetching public assignment:', error);
      return null;
    }
  },

  // Get a public assignment by shareable link - no authentication required
  async getPublicAssignmentByShareableLink(token: string): Promise<InteractiveAssignment | null> {
    try {
      console.log('Getting public assignment by shareable token:', token);

      // First, try to decrypt the token to get the assignment ID
      const decrypted = this.decryptAssignmentId(token);

      if (decrypted) {
        console.log('Successfully decrypted token:', decrypted);

        // Check if the link has expired based on the token
        if (decrypted.expired) {
          console.log('Link has expired according to token expiration');
          toast.error('This link has expired');
          return null;
        }

        // Try to get the assignment directly by ID
        const assignmentId = decrypted.id;
        console.log('Looking up public assignment with ID:', assignmentId);

        // Get the assignment using the public method
        const assignment = await this.getPublicAssignmentById(assignmentId);
        if (assignment) {
          console.log('Found public assignment by decrypted ID:', assignment);
          return assignment;
        }
      }

      // Fallback: If decryption fails or assignment not found, try to find by token in database
      console.log('Trying fallback method: searching by token in database');

      // Use the supabase client directly instead of REST API to avoid schema issues
      const { data: allAssignments, error: allError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `);

      if (allError) {
        console.error('Error fetching all assignments:', allError);
        return null;
      }

      if (!allAssignments || allAssignments.length === 0) {
        console.log('No assignments found in the database');
        return null;
      }

      console.log(`Found ${allAssignments.length} assignments in the database`);

      // Try to find an exact match first
      let foundAssignment = allAssignments.find(a =>
        a.shareableLink === token
      );

      if (foundAssignment) {
        console.log('Found assignment with exact shareableLink match:', foundAssignment);
      } else {
        // Try to find a partial match - only match the base64 part before the hyphen
        const baseToken = token.split('-')[0];
        console.log('Trying to match with base token part:', baseToken);

        foundAssignment = allAssignments.find(a =>
          a.shareableLink && (
            a.shareableLink.includes(token) ||
            (baseToken && a.shareableLink.includes(baseToken))
          )
        );

        if (foundAssignment) {
          console.log('Found assignment with partial shareableLink match:', foundAssignment);
        }
      }

      if (!foundAssignment) {
        console.error('Assignment not found with any query method');
        return null;
      }

      // Check if link has expired based on database expiration date
      if (foundAssignment.shareableLinkExpiresAt && new Date(foundAssignment.shareableLinkExpiresAt) < new Date()) {
        console.log('Link has expired:', foundAssignment.shareableLinkExpiresAt);
        toast.error('This link has expired');
        return null;
      }

      // Get questions for the found assignment
      const { data: questions, error: questionsError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .select('*')
        .eq('assignmentId', foundAssignment.id)
        .order('order', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      }

      // Format dates and combine data
      const formattedAssignment = {
        ...foundAssignment,
        dueDate: new Date(foundAssignment.dueDate),
        createdAt: new Date(foundAssignment.createdAt),
        updatedAt: new Date(foundAssignment.updatedAt),
        questions: normalizeInteractiveQuestions(questions || []),
        attachments: []
      };

      return formattedAssignment;
    } catch (error) {
      console.error('Error getting public assignment by shareable link:', error);
      return null;
    }
  },
  // Get all interactive assignments
  async getAll(
    role: string,
    classId?: string,
    filters?: {
      type?: InteractiveAssignmentType;
      status?: InteractiveAssignmentStatus;
      searchTerm?: string;
    }
  ): Promise<InteractiveAssignment[]> {
    try {
      let query = supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `);

      // Apply filters based on role
      if (role === 'STUDENT' && classId) {
        query = query.eq('classId', classId);
      }

      // Apply additional filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) throw error;

      // Format dates
      const formattedData = data.map(assignment => ({
        ...assignment,
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt)
      }));

      return formattedData;
    } catch (error) {
      console.error('Error fetching interactive assignments:', error);
      toast.error('Failed to load interactive assignments');
      return [];
    }
  },

  // Get a single interactive assignment by ID with questions
  async getById(id: string): Promise<InteractiveAssignment | null> {
    try {
      console.log('Getting assignment by ID:', id);

      // Convert string ID to number if it's a numeric string
      // This is important because the ID column is a bigint
      let numericId: number | string = id;
      if (/^\d+$/.test(id)) {
        numericId = parseInt(id, 10);
        console.log('Converted ID to numeric:', numericId);
      } else {
        console.log('ID is not numeric, using as is');
      }

      // Get the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `)
        .eq('id', numericId)
        .single();

      if (assignmentError) {
        console.error('Error fetching assignment:', assignmentError);

        // If we get an error with the numeric ID, try getting all assignments and filtering
        if (typeof numericId === 'number') {
          console.log('Trying to get all assignments and filter manually');
          const { data: allAssignments, error: allError } = await supabase
            .schema(SCHEMA)
            .from(INTERACTIVE_ASSIGNMENT_TABLE)
            .select(`
              *,
              class:Class (
                id,
                name,
                section
              ),
              subject:Subject (
                id,
                name,
                code
              )
            `);

          if (!allError && allAssignments && allAssignments.length > 0) {
            // Try to find by ID or shareableLink
            const foundAssignment = allAssignments.find(a =>
              a.id === numericId ||
              a.id === id ||
              a.shareableLink === id
            );

            if (foundAssignment) {
              console.log('Found assignment by manual filtering:', foundAssignment);

              // Continue with getting questions and attachments
              const { data: questions, error: questionsError } = await supabase
                .schema(SCHEMA)
                .from(INTERACTIVE_QUESTION_TABLE)
                .select('*')
                .eq('assignmentId', foundAssignment.id)
                .order('order', { ascending: true });

              if (questionsError) throw questionsError;

              // Get the attachments
              const { data: attachments, error: attachmentsError } = await supabase
                .schema(SCHEMA)
                .from(FILE_TABLE)
                .select('*')
                .eq('interactiveAssignmentId', foundAssignment.id);

              if (attachmentsError) throw attachmentsError;

              // Format dates and combine data
              const formattedAssignment = {
                ...foundAssignment,
                dueDate: new Date(foundAssignment.dueDate),
                createdAt: new Date(foundAssignment.createdAt),
                updatedAt: new Date(foundAssignment.updatedAt),
                questions: normalizeInteractiveQuestions(questions || []),
                attachments: attachments || []
              };

              return formattedAssignment;
            }
          }
        }

        throw assignmentError;
      }

      // Get the questions
      const { data: questions, error: questionsError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .select('*')
        .eq('assignmentId', assignment.id) // Use the ID from the assignment object
        .order('order', { ascending: true });

      if (questionsError) throw questionsError;

      // Get the attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .schema(SCHEMA)
        .from(FILE_TABLE)
        .select('*')
        .eq('interactiveAssignmentId', assignment.id); // Use the ID from the assignment object

      if (attachmentsError) throw attachmentsError;

      // Format dates and combine data
      const formattedAssignment = {
        ...assignment,
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
        questions: normalizeInteractiveQuestions(questions || []),
        attachments: attachments || []
      };

      return formattedAssignment;
    } catch (error) {
      console.error('Error fetching interactive assignment:', error);
      toast.error('Failed to load interactive assignment');
      return null;
    }
  },

  // Create a new interactive assignment
  async create(data: CreateInteractiveAssignmentData, userId: string): Promise<InteractiveAssignment | null> {
    try {
      const { files, questions, ...assignmentData } = data;
      const now = new Date().toISOString();

      // Create the assignment - let the database generate the ID
      const { data: assignment, error: assignmentError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .insert([{
          ...assignmentData,
          status: assignmentData.status || 'DRAFT',
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
          dueDate: new Date(assignmentData.dueDate).toISOString(),
          audioInstructions: assignmentData.audioInstructions,
          difficultyLevel: assignmentData.difficultyLevel,
          estimatedTimeMinutes: assignmentData.estimatedTimeMinutes,
          hasAudioFeedback: assignmentData.hasAudioFeedback || false,
          hasCelebration: assignmentData.hasCelebration !== false, // Default to true
          ageGroup: assignmentData.ageGroup,
          requiresParentHelp: assignmentData.requiresParentHelp || false
        }])
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create questions if provided
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => {
          const { order: _, ...questionWithoutOrder } = question;
          const { questionType: _type, ...questionDataWithoutType } = questionWithoutOrder;
          return {
            // Include both camelCase and snake_case versions of the fields
            assignmentId: assignment.id,
            assignment_id: assignment.id,
            question_type: questionWithoutOrder.questionType || assignmentData.type || 'MULTIPLE_CHOICE',
            questionType: questionWithoutOrder.questionType || assignmentData.type || 'MULTIPLE_CHOICE',
            question_text: questionWithoutOrder.questionText || '',
            questionText: questionWithoutOrder.questionText || '',
            question_order: index + 1,
            questionOrder: index + 1,
            order: index + 1,
            question_data: questionWithoutOrder.questionData || {},
            questionData: questionWithoutOrder.questionData || {},
            ...questionDataWithoutType
          };
        });

        const { error: questionsError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_QUESTION_TABLE)
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      // Upload files if provided
      if (files && files.length > 0) {
        const fileUploads = files.map(async (file) => {
          const filePath = `interactive-assignments/${assignment.id}/${file.name}`;
          await fileService.uploadFile(file, filePath);

          return {
            id: uuidv4(),
            fileName: file.name,
            fileType: file.type,
            filePath,
            uploadedAt: now,
            interactiveAssignmentId: assignment.id,
            uploadedBy: userId
          };
        });

        const uploadedFiles = await Promise.all(fileUploads);

        const { error: filesError } = await supabase
          .schema(SCHEMA)
          .from(FILE_TABLE)
          .insert(uploadedFiles);

        if (filesError) throw filesError;
      }

      toast.success('Interactive assignment created successfully');
      return this.getById(assignment.id);
    } catch (error) {
      console.error('Error creating interactive assignment:', error);
      toast.error('Failed to create interactive assignment');
      return null;
    }
  },

  // Update an existing interactive assignment
  async update(id: string, data: UpdateInteractiveAssignmentData): Promise<InteractiveAssignment | null> {
    try {
      console.log('Service updating assignment with ID:', id);
      console.log('Update data received:', data);
      toast.loading(`Preparing to update assignment ${id}...`, { id: 'service-update-toast' });

      // Validate the data
      const validationErrors = [];
      if (!data.title || data.title.trim().length < 3) {
        validationErrors.push('Title must be at least 3 characters');
      }
      if (!data.description || data.description.trim().length < 10) {
        validationErrors.push('Description must be at least 10 characters');
      }
      if (!data.classId) {
        validationErrors.push('Class is required');
      }
      if (!data.subjectId) {
        validationErrors.push('Subject is required');
      }

      if (validationErrors.length > 0) {
        const errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
        console.error(errorMessage);
        toast.error(errorMessage, { id: 'service-update-toast' });
        alert(`Validation errors in update service:\n\n${validationErrors.join('\n')}`);
        return null;
      }

      // Convert string ID to number if it's a numeric string
      // This is important because the ID column is a bigint
      let numericId: number | string = id;
      if (/^\d+$/.test(id)) {
        numericId = parseInt(id, 10);
        console.log('Converted ID to numeric:', numericId);
      } else {
        console.log('ID is not numeric, using as is');
      }

      const now = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: now,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
        ...(data.shareableLinkExpiresAt ? { shareableLinkExpiresAt: new Date(data.shareableLinkExpiresAt).toISOString() } : {})
      };

      console.log('Formatted update data:', updateData);
      console.log('Supabase schema:', SCHEMA);
      console.log('Table name:', INTERACTIVE_ASSIGNMENT_TABLE);

      try {
        toast.loading(`Checking if assignment ${id} exists...`, { id: 'service-update-toast' });
        // First, check if the assignment exists
        const { data: existingAssignment, error: checkError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_ASSIGNMENT_TABLE)
          .select('id')
          .eq('id', numericId)
          .single();

        if (checkError) {
          console.error('Error checking if assignment exists:', checkError);
          console.log('Trying alternative approach...');
          toast.loading(`Using alternative method to find assignment ${id}...`, { id: 'service-update-toast' });

          // Try getting all assignments and filtering manually
          const { data: allAssignments, error: allError } = await supabase
            .schema(SCHEMA)
            .from(INTERACTIVE_ASSIGNMENT_TABLE)
            .select('id');

          if (allError) {
            console.error('Error getting all assignments:', allError);
            toast.error(`Failed to find assignments: ${allError.message}`, { id: 'service-update-toast' });
            throw allError;
          }

          console.log('All assignments:', allAssignments);
          const exists = allAssignments.some(a => a.id === numericId || a.id === id);
          console.log('Assignment exists in manual check:', exists);

          if (!exists) {
            toast.error(`Assignment with ID ${id} not found`, { id: 'service-update-toast' });
            throw new Error(`Assignment with ID ${id} not found`);
          } else {
            toast.loading(`Assignment ${id} found, proceeding with update...`, { id: 'service-update-toast' });
          }
        } else {
          console.log('Assignment exists:', existingAssignment);
          toast.loading(`Assignment ${id} found, proceeding with update...`, { id: 'service-update-toast' });
        }

        // Proceed with update - make sure we're only sending valid fields
        // Create a clean update object with only the fields we want to update
        const cleanUpdateData = {
          title: updateData.title,
          description: updateData.description,
          type: updateData.type,
          classId: updateData.classId,
          subjectId: updateData.subjectId,
          dueDate: updateData.dueDate,
          status: updateData.status,
          difficultyLevel: updateData.difficultyLevel,
          estimatedTimeMinutes: updateData.estimatedTimeMinutes,
          hasAudioFeedback: updateData.hasAudioFeedback,
          hasCelebration: updateData.hasCelebration,
          requiresParentHelp: updateData.requiresParentHelp,
          updatedAt: updateData.updatedAt
        };

        console.log('Clean update data:', cleanUpdateData);

        // Proceed with update
        toast.loading(`Updating assignment ${id} in database...`, { id: 'service-update-toast' });
        const { data: updated, error } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_ASSIGNMENT_TABLE)
          .update(cleanUpdateData)
          .eq('id', numericId) // Use the numeric ID here
          .select();

        if (error) {
          console.error('Supabase error during update:', error);
          toast.error(`Database error: ${error.message}`, { id: 'service-update-toast' });
          alert(`Error updating assignment in database: ${error.message}`);
          throw error;
        }

        toast.loading(`Assignment ${id} updated successfully, retrieving updated data...`, { id: 'service-update-toast' });

        console.log('Update response from Supabase:', updated);
        toast.success('Interactive assignment updated successfully');
        return this.getById(numericId.toString()); // Convert back to string for getById
      } catch (innerError) {
        console.error('Inner error during update:', innerError);
        throw innerError;
      }
    } catch (error) {
      console.error('Error updating interactive assignment:', error);
      toast.error('Failed to update interactive assignment');
      return null;
    }
  },

  // Delete an interactive assignment
  async delete(id: string): Promise<boolean> {
    try {
      // Delete the assignment (cascade will handle related records)
      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Interactive assignment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting interactive assignment:', error);
      toast.error('Failed to delete interactive assignment');
      return false;
    }
  },

  // Delete a specific question
  async deleteQuestion(questionId: string): Promise<boolean> {
    try {
      console.log('Deleting question with ID:', questionId);
      toast.loading('Deleting question...', { id: 'delete-question-toast' });

      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('Error deleting question:', error);
        toast.error(`Failed to delete question: ${error.message}`, { id: 'delete-question-toast' });
        return false;
      }

      toast.success('Question deleted successfully', { id: 'delete-question-toast' });
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'delete-question-toast' });
      return false;
    }
  },

  // Add or update questions for an assignment
  async updateQuestions(assignmentId: string, questions: Omit<InteractiveQuestion, 'id' | 'assignmentId'>[]): Promise<boolean> {
    try {
      console.log('Updating questions for assignment ID:', assignmentId);
      console.log('Questions data received:', questions);
      toast.loading(`Preparing to update ${questions.length} questions for assignment ${assignmentId}...`, { id: 'questions-update-toast' });

      // Validate questions
      const validationErrors: string[] = [];

      if (!questions || questions.length === 0) {
        validationErrors.push('No questions provided for update');
      } else {
        // We'll fix missing questionType and order in the processing step,
        // so we'll only validate other fields here
        questions.forEach((question, index) => {
          // Allow null questionText - we'll handle it in the processing step
          if (question.questionText !== null && question.questionText !== undefined && question.questionText.trim() === '') {
            validationErrors.push(`Question ${index + 1}: Question text is required`);
          }

          // Check if questionType is missing
          if (!question.questionType) {
            console.warn(`Question ${index + 1} is missing questionType, will use default 'MATCHING'`);
          }
        });
      }

      if (validationErrors.length > 0) {
        const errorMessage = `Question validation failed: ${validationErrors.join(', ')}`;
        console.error(errorMessage);
        toast.error(errorMessage, { id: 'questions-update-toast' });
        alert(`Question validation errors:\n\n${validationErrors.join('\n')}`);
        return false;
      }

      // Log that we're fixing any null questionType or string order values
      console.log('Note: Any null questionType values will be set to MATCHING, and order will be forced to a number.');

      // Log the raw questions data for debugging
      console.log('Raw questions data before processing:');
      questions.forEach((q, i) => {
        console.log(`Question ${i + 1}:`, {
          questionType: q.questionType,
          questionTypeType: typeof q.questionType,
          order: q.order,
          orderType: typeof q.order,
          text: q.questionText
        });
      });

      // Convert string ID to number if it's a numeric string
      // This is important because the ID column is a bigint
      let numericId: number | string = assignmentId;
      if (/^\d+$/.test(assignmentId)) {
        numericId = parseInt(assignmentId, 10);
        console.log('Converted assignmentId to numeric:', numericId);
      } else {
        console.log('assignmentId is not numeric, using as is');
      }

      try {
        // First, check if the assignment exists
        const { data: existingAssignment, error: checkError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_ASSIGNMENT_TABLE)
          .select('id')
          .eq('id', numericId)
          .single();

        if (checkError) {
          console.error('Error checking if assignment exists:', checkError);
          console.log('Trying alternative approach for questions...');

          // Try getting all assignments and filtering manually
          const { data: allAssignments, error: allError } = await supabase
            .schema(SCHEMA)
            .from(INTERACTIVE_ASSIGNMENT_TABLE)
            .select('id');

          if (allError) {
            console.error('Error getting all assignments for questions:', allError);
            throw allError;
          }

          console.log('All assignments for questions:', allAssignments);
          const exists = allAssignments.some(a => a.id === numericId || a.id === assignmentId);
          console.log('Assignment exists in manual check for questions:', exists);

          if (!exists) {
            throw new Error(`Assignment with ID ${assignmentId} not found for questions`);
          }
        } else {
          console.log('Assignment exists for questions:', existingAssignment);
        }

        // We need to handle both updating existing questions and removing deleted ones
        console.log('Getting existing questions for assignment ID:', numericId);
        toast.loading(`Preparing to update questions for assignment ${assignmentId}...`, { id: 'questions-update-toast' });

        // First, get existing questions to know what we're working with
        const { data: existingQuestions, error: fetchError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_QUESTION_TABLE)
          .select('id, order')
          .eq('assignmentId', numericId);

        if (fetchError) {
          console.error('Error fetching existing questions:', fetchError);
          toast.error(`Failed to fetch existing questions: ${fetchError.message}`, { id: 'questions-update-toast' });
          // Continue anyway - we'll try to upsert without knowing existing questions
          console.log('Continuing without existing questions data');
        } else {
          console.log('Existing questions found:', existingQuestions?.length || 0);

          // If we have fewer questions now than before, some were deleted
          if (existingQuestions && existingQuestions.length > questions.length) {
            console.log(`Detected ${existingQuestions.length - questions.length} deleted questions`);

            // Create a map of current question orders for quick lookup
            const currentOrders = new Set(questions.map((_, index) => index + 1));

            // Find questions that need to be deleted (those with orders not in the current set)
            const questionsToDelete = existingQuestions.filter(q => !currentOrders.has(q.order));

            if (questionsToDelete.length > 0) {
              console.log('Questions to delete:', questionsToDelete);
              toast.loading(`Deleting ${questionsToDelete.length} removed questions...`, { id: 'questions-update-toast' });

              // Delete questions that are no longer in the form
              const { error: deleteError } = await supabase
                .schema(SCHEMA)
                .from(INTERACTIVE_QUESTION_TABLE)
                .delete()
                .in('id', questionsToDelete.map(q => q.id));

              if (deleteError) {
                console.error('Error deleting removed questions:', deleteError);
                toast.error(`Failed to delete removed questions: ${deleteError.message}`, { id: 'questions-update-toast' });
              } else {
                console.log('Successfully deleted removed questions');
                toast.loading(`Successfully deleted ${questionsToDelete.length} removed questions`, { id: 'questions-update-toast' });
              }
            }
          }
        }

        toast.loading(`Preparing to save ${questions.length} questions...`, { id: 'questions-update-toast' });

        // Then insert new questions
        if (questions.length > 0) {
          // Create a new array with properly formatted questions
          const questionsToInsert = [];

          // Process each question individually to ensure proper types
          for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            // Handle null questionType by providing a default value
            // This is critical as the database has a not-null constraint on this column
            let questionType = 'MATCHING' as InteractiveAssignmentType;

            if (question.questionType) {
              // Ensure we have a valid string value
              questionType = String(question.questionType) as InteractiveAssignmentType;
            }

            // Double-check that we have a valid value to prevent not-null constraint violations
            // We need to check the string value before casting to enum type
            const questionTypeStr = String(questionType);
            if (!questionTypeStr || questionTypeStr === 'null' || questionTypeStr === 'undefined') {
              console.warn(`Invalid questionType detected for question ${index + 1}, using default 'MATCHING'`);
              questionType = 'MATCHING' as InteractiveAssignmentType;
            }

            // Force order to be a number
            const order = index + 1;

            // Log for debugging
            console.log(`Processing question ${index + 1} in service:`, {
              questionTypeOriginal: question.questionType,
              questionTypeConverted: questionType,
              questionTypeType: typeof questionType,
              orderOriginal: question.order,
              orderConverted: order,
              orderType: typeof order
            });

            // Try to find an existing question with the same order
            let existingId = uuidv4(); // Default to a new ID
            if (existingQuestions && existingQuestions.length > 0) {
              const existingQuestion = existingQuestions.find(q => q.order === order);
              if (existingQuestion) {
                existingId = existingQuestion.id;
                console.log(`Reusing existing question ID ${existingId} for order ${order}`);
              }
            }

            // Create a properly formatted question object with only essential fields
            // to avoid issues with missing columns in the database
            // Ensure questionText is never null to avoid form validation errors
            let questionText = '';
            if (question.questionText !== null && question.questionText !== undefined) {
              questionText = question.questionText;
            }

            const formattedQuestion = {
              id: existingId,
              assignment_id: numericId, // Use snake_case for database
              question_type: questionType, // Use snake_case for database
              question_order: order, // Use snake_case for database and ensure order is sequential
              question_text: questionText, // Use snake_case for database and ensure it's never null
              question_data: question.questionData || {} // Use snake_case for database
              // Omitting potentially missing fields to avoid schema cache issues
            };

            questionsToInsert.push(formattedQuestion);
          }

          console.log('Questions to insert:', questionsToInsert);
          toast.loading(`Saving ${questions.length} questions to database...`, { id: 'questions-update-toast' });

          // First, delete all existing questions for this assignment
          console.log('Deleting existing questions for assignment ID:', numericId);
          const { error: deleteError } = await supabase
            .schema(SCHEMA)
            .from(INTERACTIVE_QUESTION_TABLE)
            .delete()
            .eq('assignmentId', numericId);

          if (deleteError) {
            console.error('Error deleting existing questions:', deleteError);
            toast.error(`Failed to delete existing questions: ${deleteError.message}`, { id: 'questions-update-toast' });
            throw deleteError;
          }

          console.log('Successfully deleted existing questions');
          toast.loading(`Inserting ${questions.length} new questions...`, { id: 'questions-update-toast' });

          // Then insert new questions
          let inserted;
          let insertError;

          try {
            console.log('Attempting to insert all questions at once...');
            const { data, error } = await supabase
              .schema(SCHEMA)
              .from(INTERACTIVE_QUESTION_TABLE)
              .insert(questionsToInsert)
              .select();

            if (error) {
              console.error('Error inserting all questions:', error);
              console.log('Error message:', error.message);

              // If the error mentions a missing column, schema cache issue, or not-null constraint violation,
              // we'll try with only essential fields
              if ((error.message && error.message.includes('column') && error.message.includes('does not exist')) ||
                  error.code === 'PGRST204' ||
                  (error.message && error.message.includes('violates not-null constraint'))) {
                console.log('Column does not exist error detected. Trying with essential fields only...');

                // Check specifically for camelCase column names issue or schema cache issue
                if (error.message.includes('audioInstructions') ||
                    error.message.includes('hintText') ||
                    error.message.includes('hintImageUrl') ||
                    error.message.includes('feedbackCorrect') ||
                    error.message.includes('feedbackIncorrect') ||
                    error.code === 'PGRST204') {
                  console.log('CamelCase column names or schema cache issue detected');
                  toast.error(`Database schema issue detected. Please run the comprehensive fix script.`, { id: 'questions-update-toast' });
                  alert(`Database schema issue: The InteractiveQuestion table is missing columns or they're not in the schema cache.\n\nPlease run the SQL script in fix_interactive_question_columns.sql in the Supabase SQL Editor to fix this issue.\n\nThis script will:\n1. Add the missing columns\n2. Grant proper permissions\n3. Refresh the schema cache\n4. Verify the columns exist`);
                } else {
                  toast.error(`Database schema issue detected: ${error.message}. Please run the migration script.`, { id: 'questions-update-toast' });
                }

                // Create a version with only the absolute minimum essential fields
                // This is a last resort to make it work even with schema cache issues
                const essentialQuestions = questionsToInsert.map(question => {
                  // Create a new object with only the fields we know exist
                  const minimalQuestion: Record<string, any> = {};

                  // Add each field individually to avoid any potential issues
                  minimalQuestion.id = question.id;
                  minimalQuestion.assignment_id = numericId; // Use snake_case for database

                  // Ensure question_type is never null (critical for not-null constraint)
                  // Use snake_case for database columns
                  const questionTypeStr = String(question.question_type || '');
                  if (!questionTypeStr || questionTypeStr === 'null' || questionTypeStr === 'undefined') {
                    minimalQuestion.question_type = 'MATCHING';
                  } else {
                    minimalQuestion.question_type = question.question_type;
                  }

                  minimalQuestion.question_order = question.question_order; // Use snake_case for database

                  // Ensure question_text is never null to avoid form validation errors
                  let questionText = '';
                  if (question.question_text !== null && question.question_text !== undefined) {
                    questionText = question.question_text;
                  }
                  minimalQuestion.question_text = questionText;

                  // Only add question_data if it's not empty
                  if (question.question_data && Object.keys(question.question_data).length > 0) {
                    minimalQuestion.question_data = question.question_data;
                  }

                  return minimalQuestion;
                });

                console.log('Attempting to insert with essential fields only...');
                const { data: essentialData, error: essentialError } = await supabase
                  .schema(SCHEMA)
                  .from(INTERACTIVE_QUESTION_TABLE)
                  .insert(essentialQuestions)
                  .select();

                if (essentialError) {
                  console.error('Error inserting with essential fields:', essentialError);
                  insertError = essentialError;
                } else {
                  console.log('Successfully inserted with essential fields');
                  inserted = essentialData;
                  toast.success('Questions saved with basic information only. Run the migration to enable all features.', { id: 'questions-update-toast' });
                }
              } else {
                // Some other error
                insertError = error;
              }
            } else {
              console.log('Successfully inserted all questions');
              inserted = data;
            }
          } catch (error) {
            console.error('Exception during insert:', error);
            insertError = error instanceof Error ? error : new Error('Unknown error during insert');
          }

          if (insertError) {
            console.error('Error inserting new questions:', insertError);
            toast.error(`Failed to save questions: ${insertError.message}`, { id: 'questions-update-toast' });
            alert(`Error saving questions: ${insertError.message}`);
            throw insertError;
          }

          console.log('Questions inserted successfully:', inserted);
          toast.loading(`All ${questions.length} questions saved successfully`, { id: 'questions-update-toast' });
        }

        toast.success('Questions updated successfully', { id: 'questions-update-toast' });
        return true;
      } catch (innerError) {
        console.error('Inner error during question update:', innerError);
        throw innerError;
      }
    } catch (error) {
      console.error('Error updating questions:', error);
      toast.error(`Failed to update questions: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'questions-update-toast' });
      alert(`Error updating questions: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the console for more details.`);
      return false;
    }
  },

  // Get submissions for an assignment
  async getSubmissions(assignmentId: string): Promise<InteractiveSubmission[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_SUBMISSION_TABLE)
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber
          )
        `)
        .eq('assignmentId', assignmentId);

      if (error) throw error;

      // Format dates
      const formattedData = data.map(submission => ({
        ...submission,
        startedAt: new Date(submission.startedAt),
        submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : undefined
      }));

      return formattedData;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      return [];
    }
  },

  // Get a student's submission for an assignment
  async getStudentSubmission(assignmentId: string, studentId: string): Promise<InteractiveSubmission | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_SUBMISSION_TABLE)
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber
          )
        `)
        .eq('assignmentId', assignmentId)
        .eq('studentId', studentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No submission found
          return null;
        }
        throw error;
      }

      // Get responses
      const { data: responses, error: responsesError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_RESPONSE_TABLE)
        .select('*')
        .eq('submissionId', data.id);

      if (responsesError) throw responsesError;

      // Get attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .schema(SCHEMA)
        .from(FILE_TABLE)
        .select('*')
        .eq('interactiveSubmissionId', data.id);

      if (attachmentsError) throw attachmentsError;

      // Format dates and combine data
      const formattedSubmission = {
        ...data,
        startedAt: new Date(data.startedAt),
        submittedAt: data.submittedAt ? new Date(data.submittedAt) : undefined,
        responses: responses || [],
        attachments: attachments || []
      };

      return formattedSubmission;
    } catch (error) {
      console.error('Error fetching student submission:', error);
      toast.error('Failed to load submission');
      return null;
    }
  },

  // Create or update a student submission
  async submitAssignment(data: CreateInteractiveSubmissionData, userId: string): Promise<InteractiveSubmission | null> {
    try {
      const { assignmentId, studentId, responses, files } = data;
      const now = new Date().toISOString();

      // Get assignment details to track progress
      const assignment = await this.getById(assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      // Check if a submission already exists
      const existingSubmission = await this.getStudentSubmission(assignmentId, studentId);
      const submissionId = existingSubmission?.id || uuidv4();
      const isNewSubmission = !existingSubmission;

      // Create or update the submission
      if (isNewSubmission) {
        const { error: submissionError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_SUBMISSION_TABLE)
          .insert([{
            id: submissionId,
            assignmentId,
            studentId,
            status: 'SUBMITTED',
            startedAt: now,
            submittedAt: now
          }]);

        if (submissionError) throw submissionError;
      } else {
        const { error: updateError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_SUBMISSION_TABLE)
          .update({
            status: 'SUBMITTED',
            submittedAt: now
          })
          .eq('id', submissionId);

        if (updateError) throw updateError;
      }

      // Update student progress
      await progressTrackingService.updateStudentProgress({
        studentId,
        assignmentId,
        status: 'COMPLETED',
        completedAt: new Date(now)
      });

      // Handle responses if provided
      if (responses && responses.length > 0) {
        // Delete existing responses if updating
        if (!isNewSubmission) {
          const { error: deleteError } = await supabase
            .schema(SCHEMA)
            .from(INTERACTIVE_RESPONSE_TABLE)
            .delete()
            .eq('submissionId', submissionId);

          if (deleteError) throw deleteError;
        }

        // Insert new responses
        const responsesToInsert = responses.map(response => ({
          id: uuidv4(),
          submissionId,
          ...response
        }));

        const { error: responsesError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_RESPONSE_TABLE)
          .insert(responsesToInsert);

        if (responsesError) throw responsesError;
      }

      // Upload files if provided
      if (files && files.length > 0) {
        const fileUploads = files.map(async (file) => {
          const filePath = `interactive-submissions/${submissionId}/${file.name}`;
          await fileService.uploadFile(file, filePath);

          return {
            id: uuidv4(),
            fileName: file.name,
            fileType: file.type,
            filePath,
            uploadedAt: now,
            interactiveSubmissionId: submissionId,
            uploadedBy: userId
          };
        });

        const uploadedFiles = await Promise.all(fileUploads);

        const { error: filesError } = await supabase
          .schema(SCHEMA)
          .from(FILE_TABLE)
          .insert(uploadedFiles);

        if (filesError) throw filesError;
      }

      toast.success('Assignment submitted successfully');
      return this.getStudentSubmission(assignmentId, studentId);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
      return null;
    }
  },

  // Grade a submission
  async gradeSubmission(submissionId: string, data: UpdateInteractiveSubmissionData): Promise<InteractiveSubmission | null> {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_SUBMISSION_TABLE)
        .update({
          status: 'GRADED',
          score: data.score,
          feedback: data.feedback
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Get the updated submission
      const { data: submission, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_SUBMISSION_TABLE)
        .select('*, assignment:InteractiveAssignment(*), student:Student(*)')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Update student progress with score and feedback
      if (submission) {
        await progressTrackingService.updateStudentProgress({
          studentId: submission.studentId,
          assignmentId: submission.assignmentId,
          score: data.score,
          feedback: data.feedback
        });

        // Update analytics and check for milestones
        await progressTrackingService.updateStudentAnalytics(
          submission.studentId,
          submission.assignment.type
        );

        await progressTrackingService.checkAndCreateMilestones(
          submission.studentId,
          submission.assignmentId,
          submission.assignment.type
        );
      }

      toast.success('Submission graded successfully');

      // Format dates
      return {
        ...submission,
        startedAt: new Date(submission.startedAt),
        submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : undefined
      };
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
      return null;
    }
  },

  // Encrypt an assignment ID for secure sharing
  encryptAssignmentId(id: number | string, expiresAt: Date): string {
    try {
      // Create a payload with the ID and expiration date
      const payload = {
        id: id.toString(),
        exp: expiresAt.getTime()
      };

      // Convert to base64 (simple encryption for demo purposes)
      // In a production app, use a proper encryption library
      const jsonPayload = JSON.stringify(payload);
      const base64Payload = btoa(jsonPayload);

      // Add some randomness to make links unpredictable
      const randomPart = Math.random().toString(36).substring(2, 6);

      // Combine with a separator that's URL-safe
      return `${base64Payload}-${randomPart}`;
    } catch (error) {
      console.error('Error encrypting assignment ID:', error);
      throw error;
    }
  },

  // Decrypt a shared link token to get the assignment ID
  decryptAssignmentId(token: string): { id: string, expired: boolean } | null {
    try {
      console.log('Attempting to decrypt token:', token);

      // Split the token to get the base64 payload
      const parts = token.split('-');
      if (parts.length < 1) {
        console.log('Token does not contain expected format (missing hyphen)');
        return null;
      }

      // Decode the base64 payload
      const base64Payload = parts[0];
      console.log('Base64 payload part:', base64Payload);

      try {
        const jsonPayload = atob(base64Payload);
        console.log('Decoded JSON payload:', jsonPayload);

        const payload = JSON.parse(jsonPayload);
        console.log('Parsed payload:', payload);

        if (!payload.id || !payload.exp) {
          console.log('Payload is missing required fields (id or exp)');
          return null;
        }

        // Check if the link has expired
        const expired = payload.exp < Date.now();
        console.log('Token expired status:', expired, 'Expiration:', new Date(payload.exp).toISOString());

        return {
          id: payload.id,
          expired
        };
      } catch (decodeError) {
        console.error('Error decoding base64 or parsing JSON:', decodeError);
        return null;
      }
    } catch (error) {
      console.error('Error decrypting assignment ID:', error);
      return null;
    }
  },

  // Generate a shareable link for an assignment
  async generateShareableLink(assignmentId: string, expiresInDays = 30): Promise<string | null> {
    try {
      console.log('Generating shareable link for assignment ID:', assignmentId);

      // First, check if the assignmentId is a valid number
      // This is important because the ID column is a bigint
      let numericId: number;
      try {
        numericId = parseInt(assignmentId, 10);
        if (isNaN(numericId)) {
          throw new Error('Invalid assignment ID: not a number');
        }
        console.log('Parsed numeric ID:', numericId);
      } catch (parseError) {
        console.error('Error parsing assignment ID:', parseError);
        toast.error('Invalid assignment ID');
        return null;
      }

      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      console.log('Link will expire at:', expiresAt.toISOString());

      // Generate an encrypted token that includes the ID and expiration
      const encryptedToken = this.encryptAssignmentId(numericId, expiresAt);
      console.log('Generated encrypted token:', encryptedToken);

      // Create the full shareable link - use the play route for interactive assignments
      // Make sure we're using the /assignments/play/ route which is set up for interactive play
      const fullShareableLink = `${window.location.origin}/assignments/play/${encryptedToken}`;
      console.log('Full shareable link for user:', fullShareableLink);

      // Update the assignment with the token
      const { data: updated, error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .update({
          shareableLink: encryptedToken,
          shareableLinkExpiresAt: expiresAt.toISOString()
        })
        .eq('id', numericId)
        .select();

      if (error) {
        console.error('Error updating assignment with shareable link:', error);
        throw error;
      }

      console.log('Assignment updated with encrypted token:', updated);

      // Verify the link was saved correctly
      const { data: verifyData, error: verifyError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select('id, shareableLink')
        .eq('id', numericId)
        .single();

      if (!verifyError && verifyData) {
        console.log('Verified link saved correctly:', verifyData);
      }

      toast.success('Shareable link generated successfully');
      return fullShareableLink;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast.error('Failed to generate shareable link');
      return null;
    }
  },

  // Try to get assignment directly by ID (for shared links that might be using the ID)
  async getByDirectId(id: string): Promise<InteractiveAssignment | null> {
    try {
      console.log('Attempting to get assignment directly by ID:', id);

      // We can't directly query with a string ID against a bigint column
      // So instead, we'll get all assignments and filter manually
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `);

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Try to find an assignment with a matching shareableLink
        const matchingAssignment = data.find(assignment =>
          assignment.shareableLink === id ||
          (assignment.shareableLink && assignment.shareableLink.includes(id))
        );

        if (matchingAssignment) {
          console.log('Found assignment with matching shareableLink:', matchingAssignment);
          return matchingAssignment;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting assignment by direct ID:', error);
      return null;
    }
  },

  // Get assignment by shareable link
  async getByShareableLink(token: string): Promise<InteractiveAssignment | null> {
    try {
      console.log('Getting assignment by shareable token:', token);

      // First, try to decrypt the token to get the assignment ID
      const decrypted = this.decryptAssignmentId(token);

      if (decrypted) {
        console.log('Successfully decrypted token:', decrypted);

        // Check if the link has expired based on the token
        if (decrypted.expired) {
          console.log('Link has expired according to token expiration');
          toast.error('This link has expired');
          return null;
        }

        // Try to get the assignment directly by ID
        const assignmentId = decrypted.id;
        console.log('Looking up assignment with ID:', assignmentId);

        // Convert to number if it's a numeric string
        let numericId: number | string = assignmentId;
        if (/^\d+$/.test(assignmentId)) {
          numericId = parseInt(assignmentId, 10);
          console.log('Converted to numeric ID:', numericId);
        }

        // Try to get the assignment directly
        try {
          const assignment = await this.getById(assignmentId);
          if (assignment) {
            console.log('Found assignment by decrypted ID:', assignment);
            return assignment;
          }
        } catch (directError) {
          console.error('Error getting assignment by decrypted ID:', directError);
          // Continue to fallback methods
        }
      }

      // Fallback: If decryption fails or assignment not found, try to find by token in database
      console.log('Trying fallback method: searching by token in database');

      // Get all assignments and filter by shareableLink
      const { data: allAssignments, error: allError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .select(`
          *,
          class:Class (
            id,
            name,
            section
          ),
          subject:Subject (
            id,
            name,
            code
          )
        `);

      if (allError) {
        console.error('Error fetching all assignments:', allError);
        throw allError;
      }

      if (!allAssignments || allAssignments.length === 0) {
        console.log('No assignments found in the database');
        return null;
      }

      console.log(`Found ${allAssignments.length} assignments in the database`);

      // Try to find an exact match first
      let foundAssignment = allAssignments.find(a =>
        a.shareableLink === token
      );

      if (foundAssignment) {
        console.log('Found assignment with exact shareableLink match:', foundAssignment);
      } else {
        // Try to find a partial match
        foundAssignment = allAssignments.find(a =>
          a.shareableLink && a.shareableLink.includes(token)
        );

        if (foundAssignment) {
          console.log('Found assignment with partial shareableLink match:', foundAssignment);
        }
      }

      if (!foundAssignment) {
        console.error('Assignment not found with any query method');
        return null;
      }

      // Check if link has expired based on database expiration date
      if (foundAssignment.shareableLinkExpiresAt && new Date(foundAssignment.shareableLinkExpiresAt) < new Date()) {
        console.log('Link has expired:', foundAssignment.shareableLinkExpiresAt);
        toast.error('This link has expired');
        return null;
      }

      // Get questions and attachments if needed
      if (!foundAssignment.questions) {
        console.log('Fetching full assignment details with ID:', foundAssignment.id);
        return this.getById(foundAssignment.id);
      }

      return foundAssignment;
    } catch (error) {
      console.error('Error getting assignment by shareable link:', error);
      return null;
    }
  }
};

export default interactiveAssignmentService;








