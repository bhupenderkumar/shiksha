import React, { useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email, password, role, fullName) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (signUpError) throw signUpError;
    
    if (authData.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              role,
              full_name: fullName,
            }
          ]);
        
        if (profileError) throw profileError;
      } catch (error) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },
  loadUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ user: null, profile: null, loading: false });
    }
  },
}));

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const loadUser = useAuth((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return children;
}; 