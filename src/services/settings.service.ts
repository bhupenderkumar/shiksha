import { BaseService } from './base.service';
import { queryBuilder, handleError } from '@/lib/api-client';
import type { SchoolSettings } from '@/types/settings';

export class SettingsService extends BaseService {
  constructor() {
    super('Settings');
  }

  async getSchoolSettings() {
    try {
      const { data, error } = await queryBuilder
        .from('Settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as SchoolSettings;
    } catch (error) {
      handleError(error, 'Error fetching school settings');
    }
  }

  async updateSchoolSettings(settings: Partial<SchoolSettings>) {
    try {
      const { data, error } = await queryBuilder
        .from('Settings')
        .update(settings)
        .eq('id', 'school-settings')
        .select()
        .single();

      if (error) throw error;
      return data as SchoolSettings;
    } catch (error) {
      handleError(error, 'Error updating school settings');
    }
  }

  async updateLogo(file: File) {
    try {
      const filePath = `school/logo.${file.name.split('.').pop()}`;
      const { error: uploadError } = await queryBuilder.storage
        .from('settings')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await this.updateSchoolSettings({ logoUrl: filePath });
      return filePath;
    } catch (error) {
      handleError(error, 'Error updating school logo');
    }
  }
}

export const settingsService = new SettingsService(); 