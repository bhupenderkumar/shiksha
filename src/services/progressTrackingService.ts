import { supabase } from '@/lib/api-client';
import { v4 as uuidv4 } from 'uuid';
import { SCHEMA } from '@/lib/constants';
import type {
  StudentProgress,
  StudentProgressAnalytics,
  CompletionMilestone,
  InteractiveAssignmentType
} from '@/types/interactiveAssignment';

const STUDENT_PROGRESS_TABLE = 'StudentProgress';
const STUDENT_PROGRESS_ANALYTICS_TABLE = 'StudentProgressAnalytics';
const COMPLETION_MILESTONE_TABLE = 'CompletionMilestone';

export const progressTrackingService = {
  /**
   * Get progress for a specific student and assignment
   */
  async getStudentProgress(studentId: string, assignmentId: string): Promise<StudentProgress | null> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('*')
        .eq('student_id', studentId)
        .eq('assignment_id', assignmentId)
        .single();

      if (error) throw error;
      
      return data ? {
        id: data.id,
        studentId: data.student_id,
        assignmentId: data.assignment_id,
        startedAt: new Date(data.started_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        score: data.score,
        timeSpent: data.time_spent,
        attempts: data.attempts,
        status: data.status,
        feedback: data.feedback
      } : null;
    } catch (error) {
      console.error('Error getting student progress:', error);
      return null;
    }
  },

  /**
   * Create or update progress for a student's assignment
   */
  async updateStudentProgress(progress: Partial<StudentProgress> & { studentId: string, assignmentId: string }): Promise<StudentProgress | null> {
    try {
      const { studentId, assignmentId, ...progressData } = progress;
      
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('id, attempts')
        .eq('student_id', studentId)
        .eq('assignment_id', assignmentId)
        .single();

      if (existingProgress) {
        // Update existing record
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from(STUDENT_PROGRESS_TABLE)
          .update({
            ...progressData,
            attempts: progressData.attempts || existingProgress.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        return this.mapProgressData(data);
      } else {
        // Create new record
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from(STUDENT_PROGRESS_TABLE)
          .insert([{
            id: uuidv4(),
            student_id: studentId,
            assignment_id: assignmentId,
            started_at: progressData.startedAt || new Date().toISOString(),
            completed_at: progressData.completedAt,
            score: progressData.score,
            time_spent: progressData.timeSpent,
            attempts: progressData.attempts || 1,
            status: progressData.status || 'IN_PROGRESS',
            feedback: progressData.feedback,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return this.mapProgressData(data);
      }
    } catch (error) {
      console.error('Error updating student progress:', error);
      return null;
    }
  },

  /**
   * Get all progress records for a student
   */
  async getStudentProgressHistory(studentId: string): Promise<StudentProgress[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select(`
          *,
          assignment:InteractiveAssignment(
            id,
            title,
            type,
            class:Class(id, name, section),
            subject:Subject(id, name, code)
          )
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data.map(this.mapProgressData);
    } catch (error) {
      console.error('Error getting student progress history:', error);
      return [];
    }
  },

  /**
   * Get analytics for a student
   */
  async getStudentAnalytics(studentId: string): Promise<StudentProgressAnalytics[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_ANALYTICS_TABLE)
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        assignmentType: item.assignment_type,
        assignmentsCompleted: item.assignments_completed,
        averageScore: item.average_score,
        averageTimeSpent: item.average_time_spent,
        strengths: item.strengths,
        areasForImprovement: item.areas_for_improvement,
        lastUpdated: new Date(item.last_updated)
      }));
    } catch (error) {
      console.error('Error getting student analytics:', error);
      return [];
    }
  },

  /**
   * Update analytics for a student based on their progress
   */
  async updateStudentAnalytics(studentId: string, assignmentType: InteractiveAssignmentType): Promise<void> {
    try {
      // Get all completed assignments of this type
      const { data: progressData, error: progressError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select(`
          *,
          assignment:InteractiveAssignment(type)
        `)
        .eq('student_id', studentId)
        .eq('status', 'COMPLETED')
        .eq('assignment.type', assignmentType);

      if (progressError) throw progressError;

      if (progressData && progressData.length > 0) {
        // Calculate analytics
        const assignmentsCompleted = progressData.length;
        const scores = progressData.map(p => p.score || 0);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const timeSpent = progressData.map(p => p.time_spent || 0);
        const averageTimeSpent = timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length;

        // Check if analytics record exists
        const { data: existingAnalytics } = await supabase
          .schema(SCHEMA)
          .from(STUDENT_PROGRESS_ANALYTICS_TABLE)
          .select('id')
          .eq('student_id', studentId)
          .eq('assignment_type', assignmentType)
          .single();

        if (existingAnalytics) {
          // Update existing record
          await supabase
            .schema(SCHEMA)
            .from(STUDENT_PROGRESS_ANALYTICS_TABLE)
            .update({
              assignments_completed: assignmentsCompleted,
              average_score: averageScore,
              average_time_spent: averageTimeSpent,
              last_updated: new Date().toISOString()
            })
            .eq('id', existingAnalytics.id);
        } else {
          // Create new record
          await supabase
            .schema(SCHEMA)
            .from(STUDENT_PROGRESS_ANALYTICS_TABLE)
            .insert([{
              id: uuidv4(),
              student_id: studentId,
              assignment_type: assignmentType,
              assignments_completed: assignmentsCompleted,
              average_score: averageScore,
              average_time_spent: averageTimeSpent,
              strengths: [],
              areas_for_improvement: [],
              last_updated: new Date().toISOString()
            }]);
        }
      }
    } catch (error) {
      console.error('Error updating student analytics:', error);
    }
  },

  /**
   * Get all milestones for a student
   */
  async getStudentMilestones(studentId: string): Promise<CompletionMilestone[]> {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(COMPLETION_MILESTONE_TABLE)
        .select('*')
        .eq('student_id', studentId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        milestoneType: item.milestone_type,
        achievedAt: new Date(item.achieved_at),
        assignmentId: item.assignment_id,
        badgeAwarded: item.badge_awarded
      }));
    } catch (error) {
      console.error('Error getting student milestones:', error);
      return [];
    }
  },

  /**
   * Create a new milestone for a student
   */
  async createMilestone(milestone: Omit<CompletionMilestone, 'id'>): Promise<CompletionMilestone | null> {
    try {
      // Check if milestone already exists
      const { data: existingMilestone } = await supabase
        .schema(SCHEMA)
        .from(COMPLETION_MILESTONE_TABLE)
        .select('id')
        .eq('student_id', milestone.studentId)
        .eq('milestone_type', milestone.milestoneType)
        .single();

      if (existingMilestone) {
        // Milestone already exists
        return null;
      }

      // Create new milestone
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(COMPLETION_MILESTONE_TABLE)
        .insert([{
          id: uuidv4(),
          student_id: milestone.studentId,
          milestone_type: milestone.milestoneType,
          achieved_at: milestone.achievedAt.toISOString(),
          assignment_id: milestone.assignmentId,
          badge_awarded: milestone.badgeAwarded
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        studentId: data.student_id,
        milestoneType: data.milestone_type,
        achievedAt: new Date(data.achieved_at),
        assignmentId: data.assignment_id,
        badgeAwarded: data.badge_awarded
      };
    } catch (error) {
      console.error('Error creating milestone:', error);
      return null;
    }
  },

  /**
   * Check for and create milestones based on student progress
   */
  async checkAndCreateMilestones(studentId: string, assignmentId: string, assignmentType: InteractiveAssignmentType): Promise<void> {
    try {
      // Get count of completed assignments by type
      const { count, error } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('status', 'COMPLETED')
        .eq('assignment.type', assignmentType);

      if (error) throw error;

      // First completion of this type
      if (count === 1) {
        await this.createMilestone({
          studentId,
          milestoneType: `first_${assignmentType.toLowerCase()}`,
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: `${assignmentType.toLowerCase()}_beginner`
        });
      }

      // 5 completions of this type
      if (count === 5) {
        await this.createMilestone({
          studentId,
          milestoneType: `five_${assignmentType.toLowerCase()}`,
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: `${assignmentType.toLowerCase()}_intermediate`
        });
      }

      // 10 completions of this type
      if (count === 10) {
        await this.createMilestone({
          studentId,
          milestoneType: `ten_${assignmentType.toLowerCase()}`,
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: `${assignmentType.toLowerCase()}_advanced`
        });
      }

      // Get total count of all completed assignments
      const { count: totalCount, error: totalError } = await supabase
        .schema(SCHEMA)
        .from(STUDENT_PROGRESS_TABLE)
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('status', 'COMPLETED');

      if (totalError) throw totalError;

      // Milestone for total assignments
      if (totalCount === 10) {
        await this.createMilestone({
          studentId,
          milestoneType: 'ten_total_assignments',
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: 'learning_explorer'
        });
      }

      if (totalCount === 25) {
        await this.createMilestone({
          studentId,
          milestoneType: 'twenty_five_total_assignments',
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: 'learning_master'
        });
      }

      if (totalCount === 50) {
        await this.createMilestone({
          studentId,
          milestoneType: 'fifty_total_assignments',
          achievedAt: new Date(),
          assignmentId,
          badgeAwarded: 'learning_champion'
        });
      }
    } catch (error) {
      console.error('Error checking and creating milestones:', error);
    }
  },

  /**
   * Helper function to map database response to StudentProgress type
   */
  mapProgressData(data: any): StudentProgress {
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
      feedback: data.feedback
    };
  }
};

export default progressTrackingService;
