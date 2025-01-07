import type { Database } from '@/types/supabase';

export type HomeworkWithRelations = Database['public']['Tables']['Homework']['Row'] & {
  student: Database['public']['Tables']['Student']['Row'];
  teacher: Database['public']['Tables']['Staff']['Row'];
  subjects: Database['public']['Tables']['Subject']['Row'];
  file: Database['public']['Tables']['File']['Row'];
};

export type StudentWithRelations = Database['public']['Tables']['Student']['Row'] & {
  user: Database['public']['Tables']['Profile']['Row'];
  homework: Database['public']['Tables']['Homework']['Row'][];
  fees: Database['public']['Tables']['Fee']['Row'][];
};

export type TeacherWithRelations = Database['public']['Tables']['Staff']['Row'] & {
  user: Database['public']['Tables']['Profile']['Row'];
  homework: Database['public']['Tables']['Homework']['Row'][];
};

export type FeeWithRelations = Database['public']['Tables']['Fee']['Row'] & {
  student: Database['public']['Tables']['Student']['Row'];
};
