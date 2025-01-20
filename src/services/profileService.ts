// String Constants
const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
} as const;

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: ['ADMIN', 'TEACHER', 'STUDENT'],
  [USER_ROLES.TEACHER]: ['TEACHER', 'STUDENT'],
  [USER_ROLES.STUDENT]: ['STUDENT']
} as const;

const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_FOUND: 'User email not found',
  UPDATE_ROLE: 'Error updating user role:',
  FETCH_USER: 'Error in getUser:',
  UPDATE_PROFILE: 'Error updating user profile:',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this operation'
};

const LOG_MESSAGES = {
  FETCH_ROLE: 'Fetching user role:',
  QUERY_STAFF: 'Querying staff with email:',
  STAFF_RESPONSE: 'Staff query response:',
  STUDENT_RESPONSE: 'Student query response:'
};

const DEFAULT_VALUES = {
  USER_NAME: 'User',
  ROLE: USER_ROLES.STUDENT
};

import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api-client';
import { SCHEMA, STAFF_TABLE, STUDENT_TABLE } from '@/lib/constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export interface UserProfile extends User {
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

class ProfileService {
  private cache: Map<string, UserProfile> = new Map();

  // Check if a role has permission to perform an action
  private hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
  }

  private sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private encodeData(data: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );
  }

  async getUser(userId: string): Promise<UserProfile | null> {
    console.log(LOG_MESSAGES.FETCH_ROLE, userId);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user?.email) {
        const sanitizedEmail = this.sanitizeEmail(user.email);
        console.log(LOG_MESSAGES.QUERY_STAFF, sanitizedEmail);
        
        // First try staff lookup
        let { data: staffData, error: staffError } = await supabase
        .schema(SCHEMA)
          .from(STAFF_TABLE)
          .select('*')
          .eq('email', sanitizedEmail);
        console.log(LOG_MESSAGES.STAFF_RESPONSE, { staffData, staffError });
        
        if (staffData && staffData.length > 0) {
          const role = staffData[0].role ? (staffData[0].role as UserRole) : USER_ROLES.TEACHER;
          
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
        .schema(SCHEMA)
          .from(STUDENT_TABLE)
          .select('*')
          .eq('parentEmail', sanitizedEmail);
        console.log(LOG_MESSAGES.STUDENT_RESPONSE, { studentData, studentError });

        // Create student profile if found
        if (studentData && studentData.length > 0) {
          const userProfile: UserProfile = {
            ...user,
            role: USER_ROLES.STUDENT,
            full_name: studentData[0].name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          this.cache.set(userId, userProfile);
          return userProfile;
        }

        // Default profile if no specific role found
        const userProfile: UserProfile = {
          ...user,
          role: DEFAULT_VALUES.ROLE,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || DEFAULT_VALUES.USER_NAME,
          avatar_url: user.user_metadata?.avatar_url,
        };
        this.cache.set(userId, userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_USER, error);
      return null;
    }
  }

  async updateUserRole(userId: string, newRole: UserRole, currentUser: UserProfile): Promise<void> {
    if (!this.hasPermission(currentUser.role, USER_ROLES.ADMIN)) {
      throw new Error(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
    }

    try {
      const { error } = await supabase
        .from('Staff')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      this.cache.delete(userId); // Invalidate cache
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.UPDATE_ROLE} ${error.message}`);
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
      console.error(ERROR_MESSAGES.FETCH_USER, error);
      return null;
    }
  }
}

export const profileService = new ProfileService();

// Utility functions
export const isAdmin = (user?: UserProfile | null): boolean => 
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.ADMIN));

export const isTeacher = (user?: UserProfile | null): boolean => 
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.TEACHER));

export const isStudent = (user?: UserProfile | null): boolean => 
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.STUDENT));

export const isAdminOrTeacher = (user?: UserProfile | null): boolean => 
  Boolean(user?.role && (ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.ADMIN) || 
                        ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.TEACHER)));

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