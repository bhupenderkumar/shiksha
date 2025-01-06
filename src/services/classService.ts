import { supabase } from "@/lib/api-client";

export interface ClassType {
  id: string;
  name: string;
  section: string;
}

export const classService = {
  async getAll() {
    const { data, error } = await supabase
      .schema('school')
      .from('Class')
      .select('id, name, section')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('Class')
      .select('id, name, section')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};
