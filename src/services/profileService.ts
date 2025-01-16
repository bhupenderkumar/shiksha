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
  // Add email sanitization function
  private sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
  // Updated utility function to handle encoding properly
  private encodeData(data: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value // Remove encoding as Supabase handles this
      ])
    );
  }
  async getUser(userId: string): Promise<UserProfile | null> {
    console.log('Fetching user role:', userId);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw  error;
      if (user?.email) {
        const sanitizedEmail = this.sanitizeEmail(user.email);
        console.log('Querying staff with email:', sanitizedEmail);
        // First try staff lookup
        let { data: staffData, error: staffError } = await supabase
          .from('Staff')
          .select('*')
          .eq('email', sanitizedEmail);
        console.log('Staff query response:', { staffData, staffError });
        if (staffData && staffData.length > 0) {
          const role = staffData[0].role ? (staffData[0].role as UserRole) : 'TEACHER';
          
          const userProfile: UserProfile = {
            ...user,
            role,
            full_name: staffData[0].name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          this.cache.set(userId, userProfile);
          return userProfile;
        }
        // Try student lookup using parent's email
        let { data: studentData, error: studentError } = await supabase
          .from('Student')
          .select('*')
          .eq('parentEmail', sanitizedEmail); // Changed from 'email' to 'parentEmail'
        console.log('Student query response:', { studentData, studentError });
        // Create student profile if found
        if (studentData && studentData.length > 0) {
          const userProfile: UserProfile = {
            ...user,
            role: 'STUDENT',
            full_name: studentData[0].name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          this.cache.set(userId, userProfile);
          return userProfile;
        }
        // Default profile if no specific role found
        const userProfile: UserProfile = {
          ...user,
          role: 'STUDENT',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url,
        };
        this.cache.set(userId, userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error in getUser:', error);
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
      const sanitizedEmail = this.sanitizeEmail(user.email);

      // Delete existing staff record if any
      await supabase
        .from('Staff')
        .delete()
        .eq('email', sanitizedEmail);

      if (role === 'ADMIN' || role === 'TEACHER') {
        const staffData = {
          id: userId,
          employeeId: `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: role,
          qualification: 'Not Specified',
          experience: 0,
          email: sanitizedEmail,
          contactNumber: 'Not Specified',
          address: 'Not Specified',
          joiningDate: new Date().toISOString(),
          schoolId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { error: staffError } = await supabase
          .from('Staff')
          .insert(staffData)
          .select()
          .single();

        if (staffError) {
          console.error('Error inserting staff data:', staffError);
          throw staffError;
        }
      }

      this.cache.delete(userId);
      return this.getUser(userId);
    } catch (error) {
      console.error('Error in updateUserRole:', error);
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
export const isAdmin = (user?: UserProfile | null): boolean => user?.role === 'ADMIN';
export const isTeacher = (user?: UserProfile | null): boolean => user?.role === 'TEACHER';
export const isStudent = (user?: UserProfile | null): boolean => user?.role === 'STUDENT';
export const isAdminOrTeacher = (user?: UserProfile | null): boolean => isAdmin(user) || isTeacher(user);
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
  // Add debug logging
  useEffect(() => {
    console.log('Profile Access Check:', {
      profile,
      loading,
      isAdmin: isAdmin(profile),
      isTeacher: isTeacher(profile),
      isAdminOrTeacher: isAdmin(profile) || isTeacher(profile)
    });
  }, [profile]);
  return {
    profile,
    loading,
    error,
    isAdmin: isAdmin(profile),
    isTeacher: isTeacher(profile),
    isStudent: isStudent(profile),
    isAdminOrTeacher: isAdmin(profile) || isTeacher(profile),
  };
}