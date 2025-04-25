import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { SCHEMA } from '@/lib/constants';
import { fileService } from '@/services/fileService';
import type {
  InteractiveAssignment,
  InteractiveQuestion,
  InteractiveSubmission,
  InteractiveResponse,
  CreateInteractiveAssignmentData,
  UpdateInteractiveAssignmentData,
  CreateInteractiveSubmissionData,
  UpdateInteractiveSubmissionData
} from '@/types/interactiveAssignment';

const INTERACTIVE_ASSIGNMENT_TABLE = 'InteractiveAssignment';
const INTERACTIVE_QUESTION_TABLE = 'InteractiveQuestion';
const INTERACTIVE_SUBMISSION_TABLE = 'InteractiveSubmission';
const INTERACTIVE_RESPONSE_TABLE = 'InteractiveResponse';
const FILE_TABLE = 'File';

export const interactiveAssignmentService = {
  async getAll(role: string, classId?: string, filters?: any) {
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
      return data || [];
    } catch (error) {
      console.error('Error fetching interactive assignments:', error);
      return [];
    }
  },

  async getById(id: string) {
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

      return {
        ...assignment,
        questions: questions || [],
        attachments: attachments || []
      };
    } catch (error) {
      console.error('Error fetching interactive assignment:', error);
      return null;
    }
  },

  async create(data: CreateInteractiveAssignmentData, userId: string) {
    try {
      console.log(data);
      const { files, questions, ...assignmentData } = data;
      const assignmentId = uuidv4();
      const now = new Date().toISOString();

      // Create the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .insert([{
          id: assignmentId,
          ...assignmentData,
          status: assignmentData.status || 'DRAFT',
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
          dueDate: new Date(assignmentData.dueDate).toISOString()
        }])
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create questions if provided
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => ({
          id: uuidv4(),
          assignmentId,
          order: index + 1,
          ...question
        }));

        const { error: questionsError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_QUESTION_TABLE)
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      // Upload files if provided
      if (files && files.length > 0) {
        const fileUploads = files.map(async (file) => {
          const filePath = `interactive-assignments/${assignmentId}/${file.name}`;
          await fileService.uploadFile(file, filePath);

          return {
            id: uuidv4(),
            fileName: file.name,
            fileType: file.type,
            filePath,
            uploadedAt: now,
            interactiveAssignmentId: assignmentId,
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

      return this.getById(assignmentId);
    } catch (error) {
      console.error('Error creating interactive assignment:', error);
      return null;
    }
  },

  async update(id: string, data: UpdateInteractiveAssignmentData) {
    try {
      const now = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: now,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {})
      };

      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return this.getById(id);
    } catch (error) {
      console.error('Error updating interactive assignment:', error);
      return null;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_ASSIGNMENT_TABLE)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting interactive assignment:', error);
      return false;
    }
  },

  async updateQuestions(assignmentId: string, questions: Omit<InteractiveQuestion, 'id' | 'assignmentId'>[]) {
    try {
      // First, delete existing questions
      const { error: deleteError } = await supabase
        .schema(SCHEMA)
        .from(INTERACTIVE_QUESTION_TABLE)
        .delete()
        .eq('assignmentId', assignmentId);

      if (deleteError) throw deleteError;

      // Then insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => ({
          id: uuidv4(),
          assignmentId,
          order: index + 1,
          ...question
        }));

        const { error: insertError } = await supabase
          .schema(SCHEMA)
          .from(INTERACTIVE_QUESTION_TABLE)
          .insert(questionsToInsert);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error updating questions:', error);
      return false;
    }
  },

  async getSubmissions(assignmentId: string) {
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
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  async getStudentSubmission(assignmentId: string, studentId: string) {
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

      return {
        ...data,
        responses: responses || [],
        attachments: attachments || []
      };
    } catch (error) {
      console.error('Error fetching student submission:', error);
      return null;
    }
  },

  async submitAssignment(data: CreateInteractiveSubmissionData, userId: string) {
    try {
      const { assignmentId, studentId, responses, files } = data;
      const now = new Date().toISOString();

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

      return this.getStudentSubmission(assignmentId, studentId);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return null;
    }
  },

  async gradeSubmission(submissionId: string, data: UpdateInteractiveSubmissionData) {
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
        .select('*, assignment:InteractiveAssignment(*)')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;
      
      return submission;
    } catch (error) {
      console.error('Error grading submission:', error);
      return null;
    }
  }
};

export default interactiveAssignmentService;
