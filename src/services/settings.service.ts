import { BaseService } from './base.service';
import { supabase, handleError } from '@/lib/api-client';
import type { SchoolSettings, UserSettings } from '@/types/settings';

export class SettingsService extends BaseService {
  constructor() {
    super('Settings');
  }

  // Fetch school settings
  async getSchoolSettings() {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Settings')
        .select('*')
        .single();

      if (error) throw error;
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
        .from('Settings')
        .update(data)
        .eq('id', 'school-settings'); // Assuming 'school-settings' is the ID for the school settings

      if (error) throw error;
    } catch (error) {
      handleError(error, 'Error updating school settings');
    }
  }

  // Fetch user settings
  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('UserSettings')
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
    alert("TEST CREATE")
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
    console.log("UPDATEd");
    alert("TEST");
    try {
      // Attempt to update existing user settings
      const { data, error } = await supabase
        .schema('school')
        .from('UserSettings')
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
            .from('UserSettings')
            .insert(newSettings);

          if (createError) throw createError;
          return newData as UserSettings;
        }
        throw error; // Re-throw if it's a different error
      }

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
        .from('settings')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await this.updateSchoolSettings({ logo_url: filePath });
      return filePath;
    } catch (error) {
      handleError(error, 'Error updating school logo');
    }
  }
} 

export const settingsService = new SettingsService();