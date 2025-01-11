import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api-client';
import { ROLES } from '@/lib/constants';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface UserProfile extends User {
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

class ProfileService {
  private cache: Map<string, UserProfile> = new Map();

  async getUser(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      if (this.cache.has(userId)) {
        return this.cache.get(userId) || null;
      }

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        // Get staff data by email
        const { data: staffData, error: staffError } = await supabase
          .from('Staff')
          .select('*')
          .eq('email', user.email)
          .single();

        if (staffError && staffError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching staff data:', staffError);
        }

        // Get student data if not found in staff
        const { data: studentData, error: studentError } = await supabase
          .from('Student')
          .select('id')
          .eq('email', user.email)
          .single();

        if (studentError && studentError.code !== 'PGRST116') {
          console.error('Error fetching student data:', studentError);
        }

        // Determine role based on data
        let role: UserRole = 'STUDENT'; // default role
        let fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        
        if (staffData) {
          role = staffData.role as UserRole;
          fullName = staffData.name;
        } else if (studentData) {
          role = 'STUDENT';
        }

        const userProfile: UserProfile = {
          ...user,
          role,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url
        };
        
        // Cache the result
        this.cache.set(userId, userProfile);
        return userProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user?.email) {
        throw new Error('User email not found');
      }

      // First, remove any existing roles
      const { error: deleteError } = await supabase
        .from('Staff')
        .delete()
        .eq('email', user.email);

      if (deleteError) throw deleteError;

      // If the new role is staff (ADMIN or TEACHER)
      if (role === 'ADMIN' || role === 'TEACHER') {
        const { error: staffError } = await supabase
          .from('Staff')
          .insert({
            id: userId,
            employeeId: `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: role,
            qualification: 'Not Specified',
            experience: 0,
            email: user.email,
            contactNumber: 'Not Specified',
            address: 'Not Specified',
            joiningDate: new Date().toISOString(),
            schoolId: '1', // Using default school
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

        if (staffError) throw staffError;
      }

      // Clear cache to force refresh
      this.cache.delete(userId);
      
      // Get updated user profile
      return this.getUser(userId);
    } catch (error) {
      console.error('Error updating user role:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        return this.getUser(user.id);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export const profileService = new ProfileService();

// Utility functions
export const isAdmin = (user?: UserProfile | null): boolean => {
  return user?.role === 'ADMIN';
};

export const isTeacher = (user?: UserProfile | null): boolean => {
  return user?.role === 'TEACHER';
};

export const isStudent = (user?: UserProfile | null): boolean => {
  return user?.role === 'STUDENT';
};

export const isAdminOrTeacher = (user?: UserProfile | null): boolean => {
  return isAdmin(user) || isTeacher(user);
};

// React Hook for user profile
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const user = await profileService.getCurrentUser();
        if (mounted) {
          setProfile(user);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return { profile, loading, error };
}

// Hook for role-based access control
export function useProfileAccess() {
  const { profile, loading, error } = useProfile();
  
  return {
    profile,
    loading,
    error,
    isAdmin: isAdmin(profile),
    isTeacher: isTeacher(profile),
    isStudent: isStudent(profile),
    isAdminOrTeacher: isAdminOrTeacher(profile)
  };
}
