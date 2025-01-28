import { supabase } from '@/lib/api-client';
import { Notification } from '@/types';
import { profileService } from '@/services/profileService';
import { NOTIFICATION_TABLE } from '../lib/constants';

// String Constants
const ERROR_MESSAGES = {
  FETCH_NOTIFICATIONS: 'Error fetching notifications:',
  FETCH_USER_NOTIFICATIONS: 'Error fetching notifications for user:',
  CREATE_NOTIFICATION: 'Error creating notification:',
  UPDATE_NOTIFICATION: 'Error updating notification:',
  DELETE_NOTIFICATION: 'Error deleting notification:'
};

const SORT_ORDER = {
  CREATED_DESC: { ascending: false }
};

const TABLE_COLUMNS = '*';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .select(TABLE_COLUMNS)
        .order('createdAt', SORT_ORDER.CREATED_DESC);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_NOTIFICATIONS, error);
        return [];
      }

      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_NOTIFICATIONS, error);
      return [];
    }
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    try {
      const userProfile = await profileService.getUser(userId);
      if (!userProfile) {
        return [];
      }

      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .select(TABLE_COLUMNS)
        .or(`studentId.eq.${userProfile.id},classId.eq.${userProfile.classId}`)
        .order('createdAt', SORT_ORDER.CREATED_DESC);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_USER_NOTIFICATIONS, error);
        return [];
      }

      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_USER_NOTIFICATIONS, error);
      return [];
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .insert(notification)
        .select()
        .single();

      if (error) {
        console.error(ERROR_MESSAGES.CREATE_NOTIFICATION, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_NOTIFICATION, error);
      return null;
    }
  }

  async createNotificationForClass(title: string, message: string, type: string, classId: string): Promise<void> {
    try {
      const { error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .insert({ title, message, type, classId, studentId: null });

      if (error) {
        console.error(ERROR_MESSAGES.CREATE_NOTIFICATION, error);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_NOTIFICATION, error);
    }
  }

  async getNotificationsByClassId(classId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .select(TABLE_COLUMNS)
        .eq('classId', classId)
        .order('createdAt', SORT_ORDER.CREATED_DESC);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_NOTIFICATIONS, error);
        return [];
      }

      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_NOTIFICATIONS, error);
      return [];
    }
  }

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
        console.error(ERROR_MESSAGES.UPDATE_NOTIFICATION, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_NOTIFICATION, error);
      return null;
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .schema('school')
        .from(NOTIFICATION_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(ERROR_MESSAGES.DELETE_NOTIFICATION, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_NOTIFICATION, error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();