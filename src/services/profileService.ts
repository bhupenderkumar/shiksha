// Constants for user roles, error messages, and log messages
const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
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

const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: ['ADMIN', 'TEACHER', 'STUDENT'],
  [USER_ROLES.TEACHER]: ['TEACHER', 'STUDENT'],
  [USER_ROLES.STUDENT]: ['STUDENT']
} as const;

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

/**
 * ProfileService class handles user profile management.
 */
class ProfileService {
  private cache: Map<string, UserProfile> = new Map();

  /**
   * Check if a role has permission to perform an action.
   * @param userRole The role of the user.
   * @param requiredRole The required role for the action.
   * @returns True if the user has permission, false otherwise.
   */
  private hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole]?.includes(requiredRole) || false;
  }

  /**
   * Sanitize an email address by converting it to lowercase and trimming whitespace.
   * @param email The email address to sanitize.
   * @returns The sanitized email address.
   */
  private sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Get a user's profile information.
   * @param userId The ID of the user.
   * @returns The user's profile information, or null if not found.
   */
  async getUser(userId: string): Promise<UserProfile | null> {
    // Check if the user profile is already cached
    if (this.cache.has(userId)) {
      return this.cache.get(userId) || null;
    }

    console.log(LOG_MESSAGES.FETCH_ROLE, userId);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting auth user:', error);
        // Instead of throwing an error, return a default user profile
        const defaultProfile: UserProfile = {
          id: userId,
          role: USER_ROLES.TEACHER, // Default to teacher role
          full_name: 'User',
          avatar_url: '',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '',
        };
        this.cache.set(userId, defaultProfile);
        return defaultProfile;
      }

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
          this.cache.set(userId, userProfile); // Cache the user profile
          return userProfile;
        }

        // Try student lookup using parent's email
        let { data: studentData, error: studentError } = await supabase
          .schema(SCHEMA)
          .from(STUDENT_TABLE)
          .select('*')
          .eq('parentEmail', sanitizedEmail);

        console.log(LOG_MESSAGES.STUDENT_RESPONSE, { studentData, studentError });

        if (studentData && studentData.length > 0) {
          const userProfile: UserProfile = {
            ...user,
            role: USER_ROLES.STUDENT,
            full_name: studentData[0].name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          this.cache.set(userId, userProfile); // Cache the user profile
          return userProfile;
        }

        // Default profile if no specific role found
        const userProfile: UserProfile = {
          ...user,
          role: USER_ROLES.TEACHER, // Default to TEACHER instead of STUDENT
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || DEFAULT_VALUES.USER_NAME,
          avatar_url: user.user_metadata?.avatar_url,
        };
        this.cache.set(userId, userProfile);
        return userProfile;
      }

      // If we get here, create a default profile
      const defaultProfile: UserProfile = {
        id: userId,
        role: USER_ROLES.TEACHER, // Default to teacher role
        full_name: 'User',
        avatar_url: '',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '',
      };
      this.cache.set(userId, defaultProfile);
      return defaultProfile;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_USER, error);
      // Instead of throwing an error, return a default user profile
      const defaultProfile: UserProfile = {
        id: userId,
        role: USER_ROLES.TEACHER, // Default to teacher role
        full_name: 'User',
        avatar_url: '',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '',
      };
      this.cache.set(userId, defaultProfile);
      return defaultProfile;
    }
  }

  /**
   * Update a user's role.
   * @param userId The ID of the user.
   * @param newRole The new role for the user.
   * @param currentUser The current user.
   */
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

  /**
   * Get the current user's profile information.
   * @returns The current user's profile information, or null if not found.
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        // Create a default user profile with a random ID
        const defaultId = 'default-' + Math.random().toString(36).substring(2, 15);
        return this.getUser(defaultId);
      }

      if (user) {
        return this.getUser(user.id);
      }

      // Create a default user profile with a random ID
      const defaultId = 'default-' + Math.random().toString(36).substring(2, 15);
      return this.getUser(defaultId);
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_USER, error);
      // Create a default user profile with a random ID
      const defaultId = 'default-' + Math.random().toString(36).substring(2, 15);
      return this.getUser(defaultId);
    }
  }
}

export const profileService = new ProfileService();

/**
 * Check if a user is an admin.
 * @param user The user to check.
 * @returns True if the user is an admin, false otherwise.
 */
export const isAdmin = (user?: UserProfile | null): boolean =>
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.ADMIN));

/**
 * Check if a user is a teacher.
 * @param user The user to check.
 * @returns True if the user is a teacher, false otherwise.
 */
export const isTeacher = (user?: UserProfile | null): boolean =>
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.TEACHER));

/**
 * Check if a user is a student.
 * @param user The user to check.
 * @returns True if the user is a student, false otherwise.
 */
export const isStudent = (user?: UserProfile | null): boolean =>
  Boolean(user?.role && ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.STUDENT));

/**
 * Check if a user is an admin or teacher.
 * @param user The user to check.
 * @returns True if the user is an admin or teacher, false otherwise.
 */
export const isAdminOrTeacher = (user?: UserProfile | null): boolean =>
  Boolean(user?.role && (ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.ADMIN) ||
                        ROLE_HIERARCHY[user.role]?.includes(USER_ROLES.TEACHER)));

/**
 * React Hook for user profile.
 */
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

/**
 * Hook for role-based access control.
 */
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