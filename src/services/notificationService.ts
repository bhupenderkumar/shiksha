import { supabase } from '@/lib/api-client';
import { Notification } from '@/types';
import { profileService } from '@/services/profileService';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .schema('school')
      .from('Notification')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    const userProfile = await profileService.getUser(userId);
    if (!userProfile) {
      return [];
    }

    const { data, error } = await supabase
      .schema('school')
      .from('Notification')
      .select('*')
      .or(`studentId.eq.${userProfile.id},classId.eq.${userProfile.classId}`)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching notifications for user:', error);
      return [];
    }

    return data;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification | null> {
    const { data, error } = await supabase
      .schema('school')
      .from('Notification')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  async updateNotification(id: string, notification: Partial<Notification>): Promise<Notification | null> {
    const { data, error } = await supabase
      .schema('school')
      .from('Notification')
      .update(notification)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification:', error);
      return null;
    }

    return data;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase
      .schema('school')
      .from('Notification')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  }
}

export const notificationService = new NotificationService();