import { supabase } from '@/lib/api-client';
import { Notification } from '@/types/notification';
import { profileService } from '@/services/profileService';
import { NOTIFICATION_TABLE } from '../lib/constants';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    try {
      const userProfile = await profileService.getUser(userId);
      if (!userProfile) {
        return [];
      }

      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .select('*')
        .or(`studentId.eq.${userProfile.id},classId.eq.${userProfile.classId}`)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching notifications for user:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching notifications for user:', error);
      return [];
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .insert(notification)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  async updateNotification(id: string, notification: Partial<Notification>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .update(notification)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating notification:', error);
      return null;
    }
  },

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
};