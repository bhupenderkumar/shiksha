import { supabase } from '@/lib/api-client';

export type StaffRole = 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';

export const supervisorService = {
  async getStaffByRole(role: StaffRole) {
    try {
      const { data, error } = await supabase
        .from('Staff')
        .select('*')
        .eq('role', role);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching staff with role ${role}:`, error);
      throw error;
    }
  },
};
