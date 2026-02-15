import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

const SPORTS_ENROLLMENT_TABLE = 'SportsEnrollment';

export interface SportsEnrollmentData {
  studentName: string;
  parentName: string;
  contactNumber: string;
  classId: string;
  className: string;
  selectedGames: string[];
  specialNotes?: string;
}

export interface SportsEnrollment extends SportsEnrollmentData {
  id: string;
  status: string;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}

export const sportsEnrollmentService = {
  /**
   * Create a new sports enrollment
   */
  async createEnrollment(data: SportsEnrollmentData): Promise<SportsEnrollment> {
    const { data: result, error } = await supabase
      .schema(SCHEMA)
      .from(SPORTS_ENROLLMENT_TABLE)
      .insert([{
        studentName: data.studentName,
        parentName: data.parentName,
        contactNumber: data.contactNumber,
        classId: data.classId,
        className: data.className,
        selectedGames: data.selectedGames,
        specialNotes: data.specialNotes || null,
        status: 'ENROLLED',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating sports enrollment:', error);
      throw error;
    }

    return result as SportsEnrollment;
  },

  /**
   * Check if a student is already enrolled (by name + class)
   */
  async checkExistingEnrollment(studentName: string, classId: string): Promise<boolean> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SPORTS_ENROLLMENT_TABLE)
      .select('id')
      .ilike('studentName', studentName.trim())
      .eq('classId', classId)
      .limit(1);

    if (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  },

  /**
   * Get enrollment count
   */
  async getEnrollmentCount(): Promise<number> {
    const { count, error } = await supabase
      .schema(SCHEMA)
      .from(SPORTS_ENROLLMENT_TABLE)
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting enrollment count:', error);
      return 0;
    }

    return count ?? 0;
  },
};
