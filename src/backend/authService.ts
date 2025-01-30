import { supabase } from '@/lib/api-client';
import { AuthResponse, User } from '@supabase/supabase-js';
import { SCHEMA } from '@/lib/constants';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data: data ?? null, error: error ?? null };
  },

  async signUp(email: string, password: string, role: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase
        .schema(SCHEMA)
        .from('Profile')
        .insert([
          {
            id: authData.user?.id,
            user_id: authData.user?.id,
            role: role,
            full_name: fullName,
          },
        ]);

      if (profileError) throw profileError;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async signOut(): Promise<AuthResponse> {
    const { error } = await supabase.auth.signOut();
    return { data: null, error };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return data?.user ?? null;
  }
};