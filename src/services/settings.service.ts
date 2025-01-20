import { BaseService } from './base.service';
import { supabase, handleError } from '@/lib/api-client';
import type { SchoolSettings, UserSettings } from '@/types/settings';
import { SCHEMA, SETTINGS_TABLE, STORAGE_BUCKET, USER_SETTINGS_TABLE } from '../lib/constants';
import { toast } from 'react-hot-toast'; // Import toast

// String Constants
const DEFAULT_SCHOOL_NAME = 'Default School';
const DEFAULT_ADDRESS = 'Default Address';
const DEFAULT_PHONE = '000-000-0000';
const DEFAULT_EMAIL = 'default@school.com';
const DEFAULT_WEBSITE = 'http://defaultschool.com';
const DEFAULT_DESCRIPTION = 'Default Description';
const DEFAULT_THEME = 'light';
const SCHOOL_SETTINGS_ID = 'school-settings';
const ERROR_MESSAGES = {
  CREATE_DEFAULT: 'Failed to create default settings',
  FETCH_SETTINGS: 'Failed to fetch school settings',
  UPDATE_SETTINGS: 'Failed to update school settings',
  CREATE_USER_SETTINGS: 'Failed to create user settings',
  FETCH_USER_SETTINGS: 'Failed to fetch user settings',
  UPDATE_USER_SETTINGS: 'Failed to update user settings'
};
const SUCCESS_MESSAGES = {
  CREATE_DEFAULT: 'Default settings created successfully!',
  FETCH_SETTINGS: 'School settings fetched successfully',
  UPDATE_SETTINGS: 'School settings updated successfully',
  CREATE_USER_SETTINGS: 'User settings created successfully!',
  FETCH_USER_SETTINGS: 'User settings fetched successfully',
  UPDATE_USER_SETTINGS: 'User settings updated successfully'
};

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
          school_name: DEFAULT_SCHOOL_NAME,
          address: DEFAULT_ADDRESS,
          phone: DEFAULT_PHONE,
          email: DEFAULT_EMAIL,
          website: DEFAULT_WEBSITE,
          description: DEFAULT_DESCRIPTION,
          logo_url: ''
        };

        const { error: insertError } = await supabase
          .schema('school')
          .from(SETTINGS_TABLE)
          .insert([defaultSettings]);

        if (insertError) {
          toast.error(ERROR_MESSAGES.CREATE_DEFAULT);
          throw insertError;
        } else {
          toast.success(SUCCESS_MESSAGES.CREATE_DEFAULT);
        }
        return defaultSettings;
      }

      if (error) {
        toast.error(ERROR_MESSAGES.FETCH_SETTINGS);
        throw error;
      }
      toast.success(SUCCESS_MESSAGES.FETCH_SETTINGS);
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
        .eq('id', SCHOOL_SETTINGS_ID);

      if (error) {
        toast.error(ERROR_MESSAGES.UPDATE_SETTINGS);
        throw error;
      }
      toast.success(SUCCESS_MESSAGES.UPDATE_SETTINGS);
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

      // If no settings found, create default user settings
      if (!data) {
        const defaultUserSettings = {
          user_id: userId,
          theme: DEFAULT_THEME,
          notifications_enabled: true,
          email_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newData, error: createError } = await supabase
          .schema('school')
          .from(USER_SETTINGS_TABLE)
          .insert([defaultUserSettings])
          .select()
          .single();

        if (createError) {
          toast.error(ERROR_MESSAGES.CREATE_USER_SETTINGS);
          throw createError;
        }
        
        toast.success(SUCCESS_MESSAGES.CREATE_USER_SETTINGS);
        return newData;
      }

      if (error) {
        toast.error(ERROR_MESSAGES.FETCH_USER_SETTINGS);
        throw error;
      }

      toast.success(SUCCESS_MESSAGES.FETCH_USER_SETTINGS);
      return data;
    } catch (error) {
      handleError(error, 'Error fetching user settings');
      return null;
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, data: Partial<UserSettings>) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .schema(SCHEMA)
        .from(USER_SETTINGS_TABLE)
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        toast.error(ERROR_MESSAGES.UPDATE_USER_SETTINGS);
        throw error;
      }

      toast.success(SUCCESS_MESSAGES.UPDATE_USER_SETTINGS);
    } catch (error) {
      handleError(error, 'Error updating user settings');
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
      school_name: DEFAULT_SCHOOL_NAME,
      address: DEFAULT_ADDRESS,
      phone: DEFAULT_PHONE,
      email: DEFAULT_EMAIL,
      website: DEFAULT_WEBSITE,
      description: DEFAULT_DESCRIPTION,
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