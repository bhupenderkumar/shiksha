import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  // add other profile fields as needed
}

// Cache for profile data
let profileCache = null;
let profilePromise = null;

// Clear cache when needed (e.g., after updates)
export const clearProfileCache = () => {
  profileCache = null;
  profilePromise = null;
};

export const isAdmin = (profile?: Profile | null) => profile?.role === 'ADMIN';
export const isTeacher = (profile?: Profile | null) => profile?.role === 'TEACHER';
export const isAdminOrTeacher = (profile?: Profile | null) => 
  isAdmin(profile) || isTeacher(profile);

// Utility hook for role-based access control
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

async function getProfile() {
    const user = useAuth().user;
    if (!user) {
        console.log("No user found!");
        return null;
    }

    // Return cached profile if available
    if (profileCache) {
        return profileCache;
    }

    // If there's an ongoing request, return its promise
    if (profilePromise) {
        return profilePromise;
    }

    // Create new promise for profile fetch
    profilePromise = (async () => {
        try {
            const { data, error } = await supabase
                .schema("school")
                .from("Profile")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error.message);
                return null;
            }

            // Cache the result
            profileCache = data;
            return data;
        } catch (err) {
            console.error("Unexpected error:", err);
            return null;
        } finally {
            profilePromise = null;
        }
    })();

    return profilePromise;
}

export async function getOrCreateProfile(user?: User) {
    // Use cache if available
    if (profileCache) {
        return profileCache;
    }

    try {
        const { data: profile, error } = await supabase
        .schema("school")
          .from('Profile')
          .select('*')
          .single();
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        if (!profile) {
          const { data: newProfile, error: insertError } = await supabase
          .schema('school')  
          .from('Profile')
            .insert({
              user_id: user?.id,
              email: user?.email,
              role: 'STUDENT', // Default role
            })
            .single();
    
          if (insertError) throw insertError;
    
          profileCache = newProfile; // Cache the result
          return newProfile;
        }
    
        profileCache = profile; // Cache the result
        return profile;
      } catch (err) {
        console.error('Error fetching or creating profile:', err);
        throw err;
      }
}

export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .schema("school")
      .from('Profile')
      .select('id, full_name, role')
      .order('full_name');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching all profiles:', err);
    throw err;
  }
}

// You could also add a hook if needed
export function useAllProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllProfiles()
      .then(setProfiles)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { profiles, loading, error };
}

// Custom hook for profile management
export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(profileCache);
    const [loading, setLoading] = useState(!profileCache);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            try {
                const data = await getOrCreateProfile(user);
                setProfile(data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    return { profile, loading, error, refetch: () => {
        clearProfileCache();
        setLoading(true);
        getOrCreateProfile(user).then(setProfile).catch(setError).finally(() => setLoading(false));
    }};
}

export async function getAllStudents() {
  try {
    const { data, error } = await supabase
      .schema("school")
      .from('Student')
      .select('id, name, admissionNumber');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching students:', err);
    throw err;
  }
}

export function useAllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllStudents()
      .then(setStudents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { students, loading, error };
}
