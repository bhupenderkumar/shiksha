import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { fileService } from './fileService';
import { SCHEMA } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { progressTrackingService } from './progressTrackingService';
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
        .eq('id', id)
        .single();

      if (assignmentError) throw assignmentError;

      // Get the questions
      const { data: questions, error: questionsError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .select('*')
        .eq('assignmentId', id)
        .order('order', { ascending: true });

      if (questionsError) throw questionsError;

      // Get the attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .schema(SCHEMA)
        .from(FILE_TABLE)
        .select('*')
        .eq('interactiveAssignmentId', id);

      if (attachmentsError) throw attachmentsError;

      // Format dates and combine data
      const formattedAssignment = {
        ...assignment,
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
        questions: questions || [],
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
            assignmentId: assignment.id,
            question_type: questionWithoutOrder.questionType || assignmentData.type || 'MULTIPLE_CHOICE',
            question_text: questionWithoutOrder.questionText,
            question_order: index + 1,

            order: index + 1,
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
      const now = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: now,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
        ...(data.shareableLinkExpiresAt ? { shareableLinkExpiresAt: new Date(data.shareableLinkExpiresAt).toISOString() } : {})
      };

      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Interactive assignment updated successfully');
      return this.getById(id);
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

  // Add or update questions for an assignment
  async updateQuestions(assignmentId: string, questions: Omit<InteractiveQuestion, 'id' | 'assignmentId'>[]): Promise<boolean> {
    try {
      // Convert assignmentId to number if it's a string
      const numericAssignmentId = typeof assignmentId === 'string' ? parseInt(assignmentId, 10) : assignmentId;

      // First, delete existing questions
      const { error: deleteError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .delete()
        .eq('assignmentId', numericAssignmentId);

      if (deleteError) throw deleteError;

      // Then insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((question) => {
          // Remove order to avoid duplicate property
          const { order: _, ...questionWithoutOrder } = question;
          
          return {
            id: uuidv4(),
            assignmentId,
            questionType: question.questionType, // Explicitly set questionType
            order: question.order,
            questionText: question.questionText,
            questionData: question.questionData
          };
        });

        const { error: insertError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_QUESTION_TABLE)
          .insert(questionsToInsert);

        if (insertError) throw insertError;
      }

      toast.success('Questions updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating questions:', error);
      toast.error('Failed to update questions');
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

  // Generate a shareable link for an assignment
  async generateShareableLink(assignmentId: string, expiresInDays = 30): Promise<string | null> {
    try {
      // Generate a unique link
      const linkId = uuidv4().slice(0, 8);
      const shareableLink = `${window.location.origin}/assignments/play/${linkId}`;

      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Update the assignment with the link
      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .update({
          shareableLink,
          shareableLinkExpiresAt: expiresAt.toISOString()
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Shareable link generated successfully');
      return shareableLink;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast.error('Failed to generate shareable link');
      return null;
    }
  },

  // Get assignment by shareable link
  async getByShareableLink(linkId: string): Promise<InteractiveAssignment | null> {
    try {
      const shareableLink = `${window.location.origin}/assignments/play/${linkId}`;

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
        `)
        .eq('shareableLink', shareableLink)
        .single();

      if (error) throw error;

      // Check if link has expired
      if (data.shareableLinkExpiresAt && new Date(data.shareableLinkExpiresAt) < new Date()) {
        toast.error('This link has expired');
        return null;
      }

      // Get questions and attachments
      return this.getById(data.id);
    } catch (error) {
      console.error('Error getting assignment by shareable link:', error);
      return null;
    }
  }
};

export default interactiveAssignmentService;








