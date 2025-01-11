import { supabase } from '@/lib/api-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'HOMEWORK' | 'ATTENDANCE' | 'FEE' | 'GENERAL' | 'EXAM' | 'EMERGENCY';
  studentId: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const notificationService = {
  async getNotifications(userId: string) {
    const { data: profile } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data, error } = await supabase
      .from('Notification')
      .select('*')
      .eq(profile?.role === 'STUDENT' ? 'studentId' : 'id', profile?.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('Notification')
      .update({ isRead: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { data: profile } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { error } = await supabase
      .from('Notification')
      .update({ isRead: true })
      .eq(profile?.role === 'STUDENT' ? 'studentId' : 'id', profile?.id);

    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { data: profile } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data, error } = await supabase
      .from('Notification')
      .select('id', { count: 'exact' })
      .eq(profile?.role === 'STUDENT' ? 'studentId' : 'id', profile?.id)
      .eq('isRead', false);

    if (error) throw error;
    return data?.length || 0;
  }
};
