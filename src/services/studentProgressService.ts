import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const STUDENT_PROGRESS_TABLE = 'StudentProgress';

export interface StudentProgress {
  id: string;
  studentId: string;
  assignmentId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  timeSpent?: number; // in seconds
  attempts: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentProgressData {
  studentId: string;
  assignmentId: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  score?: number;
  timeSpent?: number;
}

export interface UpdateStudentProgressData {
  completedAt?: Date;
  score?: number;
  timeSpent?: number;
  attempts?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'GRADED';
  feedback?: string;
}

export const studentProgressService = {
  async getByStudentAndAssignment(studentId: string, assignmentId: string): Promise<StudentProgress | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('*')
        .eq('student_id', studentId)
        .eq('assignment_id', assignmentId)
        .single();

      if (error) throw error;
      
      return data ? this.mapFromDb(data) : null;
    } catch (error) {
      console.error('Error getting student progress:', error);
      return null;
    }
  },

  async getByStudent(studentId: string): Promise<StudentProgress[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select(`
          *,
          assignment:InteractiveAssignment (
            id,
            title,
            type,
            class_id,
            subject_id
          )
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data ? data.map(this.mapFromDb) : [];
    } catch (error) {
      console.error('Error getting student progress:', error);
      return [];
    }
  },

  async getByAssignment(assignmentId: string): Promise<StudentProgress[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select(`
          *,
          student:Student (
            id,
            name,
            admission_number
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data ? data.map(this.mapFromDb) : [];
    } catch (error) {
      console.error('Error getting assignment progress:', error);
      return [];
    }
  },

  async create(data: CreateStudentProgressData): Promise<StudentProgress | null> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data: progress, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .insert([{
          id,
          student_id: data.studentId,
          assignment_id: data.assignmentId,
          started_at: now,
          status: data.status || 'IN_PROGRESS',
          score: data.score,
          time_spent: data.timeSpent,
          attempts: 1,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) throw error;
      
      return progress ? this.mapFromDb(progress) : null;
    } catch (error) {
      console.error('Error creating student progress:', error);
      return null;
    }
  },

  async update(id: string, data: UpdateStudentProgressData): Promise<StudentProgress | null> {
    try {
      const now = new Date().toISOString();
      
      const { data: progress, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .update({
          completed_at: data.completedAt ? new Date(data.completedAt).toISOString() : undefined,
          score: data.score,
          time_spent: data.timeSpent,
          attempts: data.attempts,
          status: data.status,
          feedback: data.feedback,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return progress ? this.mapFromDb(progress) : null;
    } catch (error) {
      console.error('Error updating student progress:', error);
      return null;
    }
  },

  async incrementAttempt(id: string): Promise<boolean> {
    try {
      const { data: current, error: fetchError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('attempts')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      const { error: updateError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .update({
          attempts: (current?.attempts || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Error incrementing attempt:', error);
      return false;
    }
  },

  async getStudentStats(studentId: string): Promise<{
    completed: number;
    inProgress: number;
    totalAssignments: number;
    averageScore: number;
  }> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          completed: 0,
          inProgress: 0,
          totalAssignments: 0,
          averageScore: 0
        };
      }
      
      const completed = data.filter(p => p.status === 'COMPLETED' || p.status === 'GRADED').length;
      const inProgress = data.filter(p => p.status === 'IN_PROGRESS').length;
      
      // Calculate average score only from completed assignments with scores
      const scoresArray = data
        .filter(p => (p.status === 'COMPLETED' || p.status === 'GRADED') && p.score !== null)
        .map(p => p.score || 0);
      
      const averageScore = scoresArray.length > 0
        ? scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
        : 0;
      
      return {
        completed,
        inProgress,
        totalAssignments: data.length,
        averageScore
      };
    } catch (error) {
      console.error('Error getting student stats:', error);
      return {
        completed: 0,
        inProgress: 0,
        totalAssignments: 0,
        averageScore: 0
      };
    }
  },

  // Helper method to map database column names to camelCase
  mapFromDb(data: any): StudentProgress {
    return {
      id: data.id,
      studentId: data.student_id,
      assignmentId: data.assignment_id,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      score: data.score,
      timeSpent: data.time_spent,
      attempts: data.attempts,
      status: data.status,
      feedback: data.feedback,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      // Include related data if available
      student: data.student,
      assignment: data.assignment
    };
  }
};
