import { BaseService } from './base.service';
import { supabase, handleError } from '@/lib/api-client';
import type { SchoolSettings, UserSettings } from '@/types/settings';
import { SETTINGS_TABLE, STORAGE_BUCKET, USER_SETTINGS_TABLE } from '../lib/constants';
import { toast } from 'react-hot-toast'; // Import toast

export class SettingsService extends BaseService {
  constructor() {
    super('Settings');
  }

  // Fetch school settings
  async getSchoolSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(SETTINGS_TABLE)
        .select('*')
        .single();

      // If no settings found, create a new record
      if (!data) {
        const defaultSettings = {
          school_name: 'Default School',
          address: 'Default Address',
          phone: '000-000-0000',
          email: 'default@school.com',
          website: 'http://defaultschool.com',
          description: 'Default Description',
          logo_url: ''
        };

        const { error: insertError } = await supabase
          .schema('school')
          .from(SETTINGS_TABLE)
          .insert([defaultSettings]);

        if (insertError) {
          toast.error('Failed to create default settings'); // Show error toast
          throw insertError;
        } else {
          toast.success('Default settings created successfully!'); // Show success toast
        }
        return defaultSettings;
      }

      if (error) {
        toast.error('Failed to fetch school settings'); // Show error toast
        throw error;
      }
      toast.success('School settings fetched successfully'); // Show success toast
      return data as SchoolSettings;
    } catch (error) {
      handleError(error, 'Error fetching school settings');
    }
  }

  // Update school settings
  async updateSchoolSettings(data: Partial<SchoolSettings>) {
    try {
      const { error } = await supabase
        .schema('school')
        .from(SETTINGS_TABLE)
        .update(data)
        .eq('id', 'school-settings'); // Assuming 'school-settings' is the ID for the school settings

     
        if (error) {
          toast.error('Failed to update school settings'); // Show error toast
          throw error;
      }
      toast.success('School settings updated successfully'); // Show success toast
  } catch (error) {
      handleError(error, 'Error updating school settings');
  }
  }

  // Fetch user settings
  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(USER_SETTINGS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no user settings exist, create default settings
        if (error.code === 'PGRST116') {
          const defaultSettings: UserSettings = {
            user_id: userId,
            notifications: { emailNotifications: true, pushNotifications: true, reminderFrequency: 'daily' },
            theme: { theme: 'light', colorScheme: 'blue', fontSize: 'medium' },
            security: { twoFactorAuth: false, sessionTimeout: '30' }
          };
          await this.createUserSettings(defaultSettings);
          return defaultSettings;
        }
        throw error;
      }
      return data as UserSettings;
    } catch (error) {
      handleError(error, 'Error fetching user settings');
    }
  }

  // Create user settings if they do not exist
  async createUserSettings(settings: UserSettings) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('UserSettings')
        .insert(settings);

      if (error) throw error;
      return data as UserSettings;
    } catch (error) {
      handleError(error, 'Error creating user settings');
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      // Attempt to update existing user settings
      const { data, error } = await supabase
        .schema('school')
        .from(USER_SETTINGS_TABLE)
        .update(settings)
        .eq('user_id', userId) // Update by user_id
        .select()
        .single();

      // If the update fails because the record does not exist, create a new entry
      if (error) {
        if (error.code === 'PGRST116') { // No record found
          const newSettings: UserSettings = {
            user_id: userId,
            notifications: settings.notifications || { emailNotifications: true, pushNotifications: true, reminderFrequency: 'daily' },
            theme: settings.theme || { theme: 'light', colorScheme: 'blue', fontSize: 'medium' },
            security: settings.security || { twoFactorAuth: false, sessionTimeout: '30' }
          };
          const { data: newData, error: createError } = await supabase
            .schema('school')
            .from(USER_SETTINGS_TABLE)
            .insert(newSettings);

          if (createError) throw createError;
          return newData as UserSettings;
        }
        toast.error('Failed to update user settings'); // Show error toast
        throw error; // Re-throw if it's a different error
      }

      toast.success('User settings updated successfully'); // Show success toast
      return data as UserSettings;
    } catch (error) {
      handleError(error, 'Error updating user settings');
    }
  }

  // Update school logo
  async updateLogo(file: File) {
    try {
      const filePath = `school/logo.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await this.updateSchoolSettings({ logo_url: filePath });
      return filePath;
    } catch (error) {
      handleError(error, 'Error updating school logo');
    }
  }

  // Add a new method to create settings
  async createSettings(userId: string) {
    const defaultSettings = {
      school_name: 'Default School',
      address: 'Default Address',
      phone: '000-000-0000',
      email: 'default@school.com',
      website: 'http://defaultschool.com',
      description: 'Default Description',
      logo_url: '',
      user_id: userId
    };

    const { error } = await supabase
      .schema('school')
      .from(SETTINGS_TABLE)
      .insert([defaultSettings]);

    if (error) throw error;
    return defaultSettings;
  }
} 

export const settingsService = new SettingsService();