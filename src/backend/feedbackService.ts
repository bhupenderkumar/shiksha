import { supabase } from "@/lib/api-client";
import { FEEDBACK_TABLE, SCHEMA } from '../lib/constants';
import { profileService, type UserProfile } from "@/services/profileService";

export interface FeedbackReply {
  id: number;
  feedback_id: number;
  user_id: number;
  reply: string;
  created_at: string;
  user?: UserProfile;
}

export interface Feedback {
  id: number;
  user_id: number;
  title: string;
  description: string;
  note?: string;
  status: 'RAISED' | 'RESOLVED';
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  replies?: FeedbackReply[];
}

export const feedbackService = {
  async create(userId: number, title: string, description: string, note?: string) {
    const { data, error } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .insert([
        {
          user_id: userId,
          title,
          description,
          note,
          status: 'RAISED'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const userProfile = await profileService.getUser(userId.toString());
    return { ...data, user: userProfile } as Feedback;
  },

  async getAll() {
    const { data: feedbacks, error } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userIds = [...new Set(feedbacks.map(f => f.user_id))];
    const userProfiles = await Promise.all(
      userIds.map(id => profileService.getUser(id.toString()))
    );

    const userMap = new Map(
      userProfiles
        .filter((profile): profile is UserProfile => profile !== null)
        .map(profile => [profile.id, profile])
    );

    const feedbackIds = feedbacks.map(f => f.id);
    const { data: replies, error: repliesError } = await supabase.schema(SCHEMA)
      .from('feedback_replies')
      .select()
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    const replyUserIds = [...new Set(replies.map(r => r.user_id))];
    const replyUserProfiles = await Promise.all(
      replyUserIds.map(id => profileService.getUser(id.toString()))
    );

    const replyUserMap = new Map(
      replyUserProfiles
        .filter((profile): profile is UserProfile => profile !== null)
        .map(profile => [profile.id, profile])
    );

    const repliesMap = new Map();
    replies.forEach(reply => {
      const feedbackId = reply.feedback_id;
      if (!repliesMap.has(feedbackId)) {
        repliesMap.set(feedbackId, []);
      }
      repliesMap.get(feedbackId).push({
        ...reply,
        user: replyUserMap.get(reply.user_id)
      });
    });

    const enrichedFeedbacks = feedbacks.map(feedback => ({
      ...feedback,
      user: userMap.get(feedback.user_id),
      replies: repliesMap.get(feedback.id) || []
    }));

    return enrichedFeedbacks as Feedback[];
  },

  async getByUserId(userId: number) {
    const { data: feedbacks, error } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userProfile = await profileService.getUser(userId.toString());
    const feedbackIds = feedbacks.map(f => f.id);
    const { data: replies, error: repliesError } = await supabase.schema(SCHEMA)
      .from('feedback_replies')
      .select()
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    const replyUserIds = [...new Set(replies.map(r => r.user_id))];
    const replyUserProfiles = await Promise.all(
      replyUserIds.map(id => profileService.getUser(id.toString()))
    );

    const replyUserMap = new Map(
      replyUserProfiles
        .filter((profile): profile is UserProfile => profile !== null)
        .map(profile => [profile.id, profile])
    );

    const repliesMap = new Map();
    replies.forEach(reply => {
      const feedbackId = reply.feedback_id;
      if (!repliesMap.has(feedbackId)) {
        repliesMap.set(feedbackId, []);
      }
      repliesMap.get(feedbackId).push({
        ...reply,
        user: replyUserMap.get(reply.user_id)
      });
    });

    const enrichedFeedbacks = feedbacks.map(feedback => ({
      ...feedback,
      user: userProfile,
      replies: repliesMap.get(feedback.id) || []
    }));

    return enrichedFeedbacks as Feedback[];
  },

  async getById(id: number) {
    const { data: feedback, error } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;

    const userProfile = await profileService.getUser(feedback.user_id.toString());
    const { data: replies, error: repliesError } = await supabase.schema(SCHEMA)
      .from('feedback_replies')
      .select()
      .eq('feedback_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    const replyUserIds = [...new Set(replies.map(r => r.user_id))];
    const replyUserProfiles = await Promise.all(
      replyUserIds.map(id => profileService.getUser(id.toString()))
    );

    const replyUserMap = new Map(
      replyUserProfiles
        .filter((profile): profile is UserProfile => profile !== null)
        .map(profile => [profile.id, profile])
    );

    const enrichedReplies = replies.map(reply => ({
      ...reply,
      user: replyUserMap.get(reply.user_id)
    }));

    return {
      ...feedback,
      user: userProfile,
      replies: enrichedReplies
    } as Feedback;
  },

  async updateStatus(id: number, status: 'RAISED' | 'RESOLVED') {
    const { data, error } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.getById(id);
  },

  async addReply(feedbackId: number, userId: number, reply: string) {
    const { data: replyData, error: replyError } = await supabase.schema(SCHEMA)
      .from('feedback_replies')
      .insert([
        {
          feedback_id: feedbackId,
          user_id: userId,
          reply
        }
      ])
      .select()
      .single();

    if (replyError) throw replyError;

    const { error: statusError } = await supabase.schema(SCHEMA)
      .from(FEEDBACK_TABLE)
      .update({ status: 'RESOLVED' })
      .eq('id', feedbackId);

    if (statusError) throw statusError;

    const userProfile = await profileService.getUser(userId.toString());
    return {
      ...replyData,
      user: userProfile
    } as FeedbackReply;
  }
};