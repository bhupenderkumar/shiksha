import { supabase } from '@/lib/api-client';
import { STAFF_TABLE } from '../lib/constants';

export type StaffRole = 'TEACHER' | 'ADMIN' | 'PRINCIPAL' | 'ACCOUNTANT';

export const supervisorService = {
  async getStaffByRole(role: StaffRole) {
    try {
      const { data, error } = await supabase
        .from(STAFF_TABLE)
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
