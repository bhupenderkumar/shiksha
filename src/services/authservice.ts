import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data: data ?? null, error };
};


export const signUp = async (
  email: string,
  password: string,
  role: string,
  fullName: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  // Add user metadata after successful signup
  const { error: metadataError } = await supabase.from('profiles').insert({
    id: data?.user?.id,
    full_name: fullName,
    role,
  });

  if (metadataError) {
    // Handle metadata insertion error (e.g., log, retry, or inform the user)
    console.error('Error adding user metadata:', metadataError);
    return { data: null, error: metadataError };
  }

  return { data, error: null };
};

export const signOut = async (): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signOut();
  return { data: null, error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return data?.user ?? null;
};
