import { BaseService } from './base.service';
import { supabase, handleError } from '@/lib/api-client';
import type { Database } from '@/database.types';

// Define types based on the database schema
export type SchoolSettings = Database['school']['Tables']['Settings']['Row'];
export type UserSettings = Database['school']['Tables']['UserSettings']['Row'];
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
const SCHOOL_SETTINGS_ROW_ID = 1; // The settings table should only have one row
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
  async getSchoolSettings(): Promise<SchoolSettings | null> {
    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .eq('id', SCHOOL_SETTINGS_ROW_ID)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No settings found, not an error
        }
        toast.error(ERROR_MESSAGES.FETCH_SETTINGS);
        throw error;
      }
      
      toast.success(SUCCESS_MESSAGES.FETCH_SETTINGS);
      return data;
    } catch (error) {
      handleError(error, 'Error fetching school settings');
      return null;
    }
  }

  // Update school settings
  async updateSchoolSettings(data: Partial<SchoolSettings>) {
    try {
      const { error } = await supabase
        .schema('school')
        .from(SETTINGS_TABLE)
        .update(data)
        .eq('id', SCHOOL_SETTINGS_ROW_ID);

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
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from(USER_SETTINGS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No settings found, not an error
        }
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
  async createUserSettings(settings: UserSettings): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(USER_SETTINGS_TABLE)
        .insert(settings)
        .select()
        .single();

      if (error) {
        toast.error(ERROR_MESSAGES.CREATE_USER_SETTINGS);
        throw error;
      }
      
      toast.success(SUCCESS_MESSAGES.CREATE_USER_SETTINGS);
      return data;
    } catch (error) {
      handleError(error, 'Error creating user settings');
      return null;
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