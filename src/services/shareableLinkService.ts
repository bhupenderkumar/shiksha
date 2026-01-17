import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

// Table names
const SHAREABLE_LINK_TABLE = 'ShareableLink';
const CONTENT_QUERY_TABLE = 'ContentQuery';
const QUERY_REPLY_TABLE = 'QueryReply';

export interface ShareableLink {
  id: string;
  token: string;
  content_type: 'homework' | 'classwork';
  content_id: string;
  created_by: string;
  created_at: string;
  expires_at?: string | null;
  is_active: boolean;
  view_count: number;
  last_viewed_at?: string | null;
}

export interface ContentQuery {
  id: string;
  shareable_link_id: string;
  parent_name: string;
  parent_phone?: string | null;
  question_text: string;
  created_at: string;
  is_resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  replies?: QueryReply[];
}

export interface QueryReply {
  id: string;
  query_id: string;
  reply_text: string;
  replied_by: string;
  replied_at: string;
  replier?: {
    name?: string;
    email?: string;
  };
}

export interface CreateShareableLinkData {
  content_type: 'homework' | 'classwork';
  content_id: string;
  expires_at?: string;
}

export interface CreateQueryData {
  shareable_link_id: string;
  parent_name: string;
  parent_phone?: string;
  question_text: string;
}

export interface CreateReplyData {
  query_id: string;
  reply_text: string;
}

// Generate a unique shareable token
const generateToken = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const shareableLinkService = {
  /**
   * Create a new shareable link for homework or classwork
   */
  async createShareableLink(data: CreateShareableLinkData, userId: string): Promise<ShareableLink> {
    const token = generateToken();
    
    // Using 'as any' to bypass TypeScript until database types are regenerated
    // Run: npm run supabase:generate-types after migration is applied
    const { data: link, error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .insert({
        id: uuidv4(),
        token,
        content_type: data.content_type,
        content_id: data.content_id,
        created_by: userId,
        created_at: new Date().toISOString(),
        expires_at: data.expires_at || null,
        is_active: true,
        view_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shareable link:', error);
      throw new Error(`Failed to create shareable link: ${error.message}`);
    }

    return link as unknown as ShareableLink;
  },

  /**
   * Get a shareable link by token (for public access)
   */
  async getByToken(token: string): Promise<ShareableLink | null> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching shareable link:', error);
      throw new Error(`Failed to fetch shareable link: ${error.message}`);
    }

    // Check if expired
    const linkData = data as unknown as ShareableLink;
    if (linkData?.expires_at && new Date(linkData.expires_at) < new Date()) {
      return null;
    }

    return linkData;
  },

  /**
   * Get all shareable links for a specific content item
   */
  async getLinksForContent(contentType: 'homework' | 'classwork', contentId: string): Promise<ShareableLink[]> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shareable links:', error);
      throw new Error(`Failed to fetch shareable links: ${error.message}`);
    }

    return (data || []) as unknown as ShareableLink[];
  },

  /**
   * Increment view count when someone accesses a shared link
   */
  async incrementViewCount(token: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .update({
        view_count: supabase.rpc('increment_view_count'),
        last_viewed_at: new Date().toISOString()
      })
      .eq('token', token);

    // Fallback: Do a simple increment if RPC doesn't exist
    if (error) {
      const { data: currentLink } = await supabase
        .schema(SCHEMA)
        .from(SHAREABLE_LINK_TABLE as any)
        .select('view_count')
        .eq('token', token)
        .single();

      if (currentLink) {
        await supabase
          .schema(SCHEMA)
          .from(SHAREABLE_LINK_TABLE as any)
          .update({
            view_count: ((currentLink as any).view_count || 0) + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('token', token);
      }
    }
  },

  /**
   * Deactivate a shareable link
   */
  async deactivateLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .update({ is_active: false })
      .eq('id', linkId);

    if (error) {
      console.error('Error deactivating shareable link:', error);
      throw new Error(`Failed to deactivate shareable link: ${error.message}`);
    }
  },

  /**
   * Delete a shareable link
   */
  async deleteLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(SHAREABLE_LINK_TABLE as any)
      .delete()
      .eq('id', linkId);

    if (error) {
      console.error('Error deleting shareable link:', error);
      throw new Error(`Failed to delete shareable link: ${error.message}`);
    }
  }
};

export const contentQueryService = {
  /**
   * Create a new query/question (from parent - public access)
   */
  async createQuery(data: CreateQueryData): Promise<ContentQuery> {
    const { data: query, error } = await supabase
      .schema(SCHEMA)
      .from(CONTENT_QUERY_TABLE as any)
      .insert({
        id: uuidv4(),
        shareable_link_id: data.shareable_link_id,
        parent_name: data.parent_name,
        parent_phone: data.parent_phone || null,
        question_text: data.question_text,
        created_at: new Date().toISOString(),
        is_resolved: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating query:', error);
      throw new Error(`Failed to submit question: ${error.message}`);
    }

    return query as unknown as ContentQuery;
  },

  /**
   * Get all queries for a shareable link (with replies)
   */
  async getQueriesForLink(shareableLinkId: string): Promise<ContentQuery[]> {
    const { data: queries, error } = await supabase
      .schema(SCHEMA)
      .from(CONTENT_QUERY_TABLE as any)
      .select('*')
      .eq('shareable_link_id', shareableLinkId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching queries:', error);
      throw new Error(`Failed to fetch queries: ${error.message}`);
    }

    // Get replies for each query
    const typedQueries = (queries || []) as unknown as ContentQuery[];
    const queriesWithReplies = await Promise.all(
      typedQueries.map(async (query) => {
        const replies = await queryReplyService.getRepliesForQuery(query.id);
        return { ...query, replies } as ContentQuery;
      })
    );

    return queriesWithReplies;
  },

  /**
   * Mark a query as resolved
   */
  async resolveQuery(queryId: string, resolvedBy: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(CONTENT_QUERY_TABLE as any)
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', queryId);

    if (error) {
      console.error('Error resolving query:', error);
      throw new Error(`Failed to resolve query: ${error.message}`);
    }
  },

  /**
   * Delete a query
   */
  async deleteQuery(queryId: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(CONTENT_QUERY_TABLE as any)
      .delete()
      .eq('id', queryId);

    if (error) {
      console.error('Error deleting query:', error);
      throw new Error(`Failed to delete query: ${error.message}`);
    }
  }
};

export const queryReplyService = {
  /**
   * Create a reply to a query (from teacher - authenticated)
   */
  async createReply(data: CreateReplyData, repliedBy: string): Promise<QueryReply> {
    const { data: reply, error } = await supabase
      .schema(SCHEMA)
      .from(QUERY_REPLY_TABLE as any)
      .insert({
        id: uuidv4(),
        query_id: data.query_id,
        reply_text: data.reply_text,
        replied_by: repliedBy,
        replied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reply:', error);
      throw new Error(`Failed to submit reply: ${error.message}`);
    }

    return reply as unknown as QueryReply;
  },

  /**
   * Get all replies for a query
   */
  async getRepliesForQuery(queryId: string): Promise<QueryReply[]> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(QUERY_REPLY_TABLE as any)
      .select(`
        *,
        replier:replied_by(
          name,
          email
        )
      `)
      .eq('query_id', queryId)
      .order('replied_at', { ascending: true });

    if (error) {
      // Fallback without join if profile table doesn't exist
      const { data: repliesOnly, error: repliesError } = await supabase
        .schema(SCHEMA)
        .from(QUERY_REPLY_TABLE as any)
        .select('*')
        .eq('query_id', queryId)
        .order('replied_at', { ascending: true });

      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        return [];
      }

      return (repliesOnly || []) as unknown as QueryReply[];
    }

    return (data || []) as unknown as QueryReply[];
  },

  /**
   * Delete a reply
   */
  async deleteReply(replyId: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(QUERY_REPLY_TABLE as any)
      .delete()
      .eq('id', replyId);

    if (error) {
      console.error('Error deleting reply:', error);
      throw new Error(`Failed to delete reply: ${error.message}`);
    }
  }
};

// Utility function to generate share URL
export const generateShareUrl = (token: string, contentType: 'homework' | 'classwork'): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${contentType}/${token}`;
};

// Utility function to generate WhatsApp share message
export const generateWhatsAppShareUrl = (
  shareUrl: string,
  title: string,
  date: string,
  className?: string,
  subjectName?: string
): string => {
  let message = `📚 *${title}*\n`;
  if (className) message += `🎓 Class: ${className}\n`;
  if (subjectName) message += `📖 Subject: ${subjectName}\n`;
  message += `📅 Date: ${date}\n\n`;
  message += `View details and images here:\n${shareUrl}`;
  
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
