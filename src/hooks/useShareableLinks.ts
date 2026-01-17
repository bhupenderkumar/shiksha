import { useState, useEffect, useCallback } from 'react';
import { 
  shareableLinkService, 
  ShareableLink, 
  CreateShareableLinkData 
} from '@/services/shareableLinkService';
import toast from 'react-hot-toast';

export type ContentType = 'homework' | 'classwork';

interface UseShareableLinksOptions {
  /** Whether to fetch links on mount */
  autoFetch?: boolean;
  /** Whether to show toast notifications */
  showNotifications?: boolean;
}

interface UseShareableLinksResult {
  /** List of shareable links */
  links: ShareableLink[];
  /** Whether links are being loaded */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Create a new shareable link */
  createLink: (expiresAt?: string) => Promise<ShareableLink | null>;
  /** Delete/deactivate a shareable link */
  deleteLink: (linkId: string) => Promise<boolean>;
  /** Toggle link active status */
  toggleLinkStatus: (linkId: string, isActive: boolean) => Promise<boolean>;
  /** Refresh the links list */
  refresh: () => Promise<void>;
  /** Get the full share URL for a link */
  getShareUrl: (link: ShareableLink) => string;
}

/**
 * useShareableLinks - Hook for managing shareable links for homework/classwork
 * 
 * @param contentType - Type of content ('homework' | 'classwork')
 * @param contentId - ID of the content item
 * @param userId - ID of the current user (required for creating links)
 * @param options - Additional options
 */
export function useShareableLinks(
  contentType: ContentType,
  contentId: string | undefined,
  userId: string | undefined,
  options: UseShareableLinksOptions = {}
): UseShareableLinksResult {
  const { autoFetch = true, showNotifications = true } = options;
  
  const [links, setLinks] = useState<ShareableLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all shareable links for the content
   */
  const fetchLinks = useCallback(async () => {
    if (!contentId) {
      setLinks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedLinks = await shareableLinkService.getLinksForContent(contentType, contentId);
      setLinks(fetchedLinks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shareable links';
      setError(message);
      console.error('Error fetching shareable links:', err);
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId]);

  /**
   * Create a new shareable link
   */
  const createLink = useCallback(async (expiresAt?: string): Promise<ShareableLink | null> => {
    if (!contentId || !userId) {
      const message = 'Content ID and User ID are required to create a shareable link';
      setError(message);
      if (showNotifications) toast.error(message);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateShareableLinkData = {
        content_type: contentType,
        content_id: contentId,
        expires_at: expiresAt,
      };

      const newLink = await shareableLinkService.createShareableLink(data, userId);
      setLinks((prev) => [newLink, ...prev]);
      
      if (showNotifications) {
        toast.success('Shareable link created successfully!');
      }
      
      return newLink;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create shareable link';
      setError(message);
      if (showNotifications) toast.error(message);
      console.error('Error creating shareable link:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId, userId, showNotifications]);

  /**
   * Delete/deactivate a shareable link
   */
  const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await shareableLinkService.deactivateLink(linkId);
      setLinks((prev) => prev.filter((link) => link.id !== linkId));
      
      if (showNotifications) {
        toast.success('Shareable link deleted successfully!');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete shareable link';
      setError(message);
      if (showNotifications) toast.error(message);
      console.error('Error deleting shareable link:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotifications]);

  /**
   * Toggle the active status of a link
   */
  const toggleLinkStatus = useCallback(async (linkId: string, isActive: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (isActive) {
        // Reactivate - we'd need to add this method to the service
        // For now, this is a placeholder
        console.warn('Reactivating links is not yet implemented');
        return false;
      } else {
        await shareableLinkService.deactivateLink(linkId);
        setLinks((prev) => 
          prev.map((link) => 
            link.id === linkId ? { ...link, is_active: false } : link
          )
        );
      }
      
      if (showNotifications) {
        toast.success(isActive ? 'Link activated!' : 'Link deactivated!');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update link status';
      setError(message);
      if (showNotifications) toast.error(message);
      console.error('Error toggling link status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showNotifications]);

  /**
   * Get the full shareable URL for a link
   */
  const getShareUrl = useCallback((link: ShareableLink): string => {
    const baseUrl = window.location.origin;
    const path = contentType === 'homework' ? 'share/homework' : 'share/classwork';
    return `${baseUrl}/${path}/${link.token}`;
  }, [contentType]);

  // Auto-fetch links on mount if enabled
  useEffect(() => {
    if (autoFetch && contentId) {
      fetchLinks();
    }
  }, [autoFetch, contentId, fetchLinks]);

  return {
    links,
    loading,
    error,
    createLink,
    deleteLink,
    toggleLinkStatus,
    refresh: fetchLinks,
    getShareUrl,
  };
}

export default useShareableLinks;
