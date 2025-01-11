import { supabase } from '@/lib/api-client';

export interface Profile {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  avatar_url?: string;
}

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('Profile')
      .select(`
        *,
        Student(*),
        Staff(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('Profile')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('Profile')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  }
};
