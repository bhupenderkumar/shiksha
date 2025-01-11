import { supabase } from '@/lib/api-client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  email: string;
  avatar_url?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'HOMEWORK' | 'ATTENDANCE' | 'FEE' | 'GENERAL' | 'EXAM' | 'EMERGENCY';
  studentId: string;
  isRead: boolean;
  created_at: string;
  updated_at: string;
}

export async function useProfileAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  const getProfile = async () => {
    try {
      if (!user) return null;

      // First try to get the staff profile
      const { data: staffData, error: staffError } = await supabase
        .schema('school')
        .from('Staff')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (staffData) {
        return {
          ...user,
          ...staffData,
          user_metadata: {
            ...user.user_metadata,
            full_name: staffData.name,
            phone: staffData.contactNumber,
            address: staffData.address,
            avatar_url: user.user_metadata?.avatar_url
          }
        };
      }

      // If not staff, try to get student profile
      const { data: studentData, error: studentError } = await supabase
        .schema('school')
        .from('Student')
        .select('*')
        .eq('parentEmail', user.email)
        .single();

      if (studentData) {
        return {
          ...user,
          ...studentData,
          user_metadata: {
            ...user.user_metadata,
            full_name: studentData.name,
            phone: studentData.contactNumber,
            address: studentData.address,
            avatar_url: user.user_metadata?.avatar_url
          }
        };
      }

      // If no profile exists, create a new staff profile
      // if (!staffData && !studentData) {
      //   const newStaffProfile = {
      //     id: crypto.randomUUID(),
      //     user_id: user.id,
      //     name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
      //     role: 'ADMIN',
      //     qualification: '',
      //     experience: 0,
      //     email: user.email,
      //     contactNumber: user.user_metadata?.phone || '',
      //     address: user.user_metadata?.address || '',
      //     joiningDate: new Date().toISOString(),
      //     schoolId: '1', // Default school ID
      //     createdAt: new Date().toISOString(),
      //     updatedAt: new Date().toISOString()
      //   };

      //   const { data: newStaff, error: createError } = await supabase
      //     .schema('school')
      //     .from('Staff')
      //     .insert([newStaffProfile])
      //     .select()
      //     .single();

      //   if (createError) throw createError;

      //   return {
      //     ...user,
      //     ...newStaff,
      //     user_metadata: {
      //       ...user.user_metadata,
      //       full_name: newStaff.name,
      //       phone: newStaff.contactNumber,
      //       address: newStaff.address,
      //       avatar_url: user.user_metadata?.avatar_url
      //     }
      //   };
      // }

      return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  return {
    user,
    profile: getProfile(),
    loading: !user
  };
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // First try to get the staff profile
    const { data: staffData, error: staffError } = await supabase
      .schema('school')
      .from('Staff')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (staffData) {
      return {
        id: staffData.id,
        user_id: staffData.user_id,
        full_name: staffData.name,
        phone: staffData.contactNumber,
        address: staffData.address,
        email: staffData.email,
        created_at: staffData.createdAt,
        updated_at: staffData.updatedAt
      };
    }

    // If not staff, try to get student profile
    const { data: studentData, error: studentError } = await supabase
      .schema('school')
      .from('Student')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (studentData) {
      return {
        id: studentData.id,
        user_id: studentData.user_id,
        full_name: studentData.name,
        phone: studentData.contactNumber,
        address: studentData.address,
        email: studentData.parentEmail,
        created_at: studentData.createdAt,
        updated_at: studentData.updatedAt
      };
    }

    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    // First try to update staff profile
    const { data: staffData, error: staffError } = await supabase
      .schema('school')
      .from('Staff')
      .update({
        name: profile.full_name,
        contactNumber: profile.phone,
        address: profile.address,
        updatedAt: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (staffData) {
      // Also update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address
        }
      });

      if (metadataError) throw metadataError;
      return staffData;
    }

    // If not staff, try to update student profile
    const { data: studentData, error: studentError } = await supabase
      .schema('school')
      .from('Student')
      .update({
        name: profile.full_name,
        contactNumber: profile.phone,
        address: profile.address,
        updatedAt: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (studentData) {
      // Also update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address
        }
      });

      if (metadataError) throw metadataError;
      return studentData;
    }

    throw new Error('Profile not found');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    // Get the user's profile to determine if they are staff or student
    const { data: staffData } = await supabase
      .schema('school')
      .from('Staff')
      .select('id')
      .eq('user_id', userId)
      .single();

    const { data: studentData } = await supabase
      .schema('school')
      .from('Student')
      .select('id')
      .eq('user_id', userId)
      .single();

    const profileId = staffData?.id || studentData?.id;
    if (!profileId) return [];

    const { data, error } = await supabase
      .schema('school')
      .from('Notification')
      .select('*')
      .eq('studentId', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .schema('school')
      .from('Notification')
      .update({ isRead: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    // Get the user's profile ID
    const { data: staffData } = await supabase
      .schema('school')
      .from('Staff')
      .select('id')
      .eq('user_id', userId)
      .single();

    const { data: studentData } = await supabase
      .schema('school')
      .from('Student')
      .select('id')
      .eq('user_id', userId)
      .single();

    const profileId = staffData?.id || studentData?.id;
    if (!profileId) return;

    const { error } = await supabase
      .schema('school')
      .from('Notification')
      .update({ isRead: true, updated_at: new Date().toISOString() })
      .eq('studentId', profileId);

    if (error) throw error;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
