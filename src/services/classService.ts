import { supabase } from "@/lib/supabase";

export interface ClassType {
  id: string;
  name: string;
  section: string;
}

export const loadClasses = async () => {
  const { data, error } = await supabase
    .schema('school')
    .from('Class')
    .select('id, name, section');
  
  if (error) throw error;
  return data;
};
