// This service handles authentication operations using Supabase.
// It includes functions for signing in, signing up, and signing out users.

import { supabase } from '@/lib/api-client';
import { AuthResponse, User } from '@supabase/supabase-js';

// Function to sign in a user with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data: data ?? null, error };
};

// Function to sign up a new user with email, password, role, and full name
export const signUp = async (
  email: string,
  password: string,
  role: string,
  fullName: string
): Promise<AuthResponse> => {
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    // Additional logic for creating a user profile in the database
    const { error: profileError } = await supabase
      .schema('school')
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
};

// Function to sign out the current user
export const signOut = async (): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signOut();
  return { data: null, error };
};

// Function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return data?.user ?? null;
};
