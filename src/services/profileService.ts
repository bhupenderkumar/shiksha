import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { BaseService } from './base.service';
import { ROLES } from '@/lib/constants';
import { useAuth } from '@/lib/auth';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: keyof typeof ROLES;
}

class ProfileService extends BaseService {
  private cache: Map<string, Profile> = new Map();

  constructor() {
    super('Profile');
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      // Check cache first
      if (this.cache.has(userId)) {
        return this.cache.get(userId) || null;
      }

      const { data, error } = await this.query
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Cache the result
      if (data) {
        this.cache.set(userId, data);
      }

      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching profile');
      return null;
    }
  }

  async getOrCreateProfile(user: User): Promise<Profile> {
    try {
      const existingProfile = await this.getProfile(user.id);
      if (existingProfile) return existingProfile;

      const { data, error } = await this.query
        .insert({
          user_id: user.id,
          email: user.email,
          role: ROLES.STUDENT,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'Error creating profile');
      throw error;
    }
  }

  async getAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await this.query
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching all profiles');
      throw error;
    }
  }

  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

export const profileService = new ProfileService();

// Export utility functions
export const isAdmin = (profile?: Profile | null) => profile?.role === ROLES.ADMIN;
export const isTeacher = (profile?: Profile | null) => profile?.role === ROLES.TEACHER;
export const isAdminOrTeacher = (profile?: Profile | null) => 
  isAdmin(profile) || isTeacher(profile);

// Add the useProfile hook
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const data = await profileService.getOrCreateProfile(user);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const refetch = async () => {
    setLoading(true);
    profileService.clearCache(user?.id);
    try {
      if (user) {
        const data = await profileService.getOrCreateProfile(user);
        setProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reload profile'));
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refetch
  };
}

// Add useProfileAccess hook for role-based access control
export function useProfileAccess() {
  const { profile, loading, error } = useProfile();
  
  return {
    profile,
    loading,
    error,
    isAdmin: isAdmin(profile),
    isTeacher: isTeacher(profile),
    isAdminOrTeacher: isAdminOrTeacher(profile)
  };
}