import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-provider';
import { NOTIFICATION_TABLE } from '@/lib/constants';

const SCHEMA = 'school';

/**
 * Shows a browser notification if permission is granted.
 */
function showBrowserNotification(title: string, body: string, tag?: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: tag || `shiksha-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
  };

  // Use service worker notification if available (works when app is in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        ...options,
        data: { url: '/notifications' },
      });
    });
  } else {
    // Fallback to regular notification (only works when tab is active)
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      window.location.href = '/notifications';
      notification.close();
    };
  }
}

/**
 * Requests browser notification permission.
 * Returns the permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Returns current notification permission state.
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/**
 * Hook that subscribes to Supabase Realtime on the Notification table
 * and shows browser notifications for new inserts.
 */
export function useNotificationListener() {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleInsert = useCallback((payload: { new: Record<string, unknown> }) => {
    const notification = payload.new;
    if (!notification) return;

    const title = (notification.title as string) || 'New Notification';
    const message = (notification.message as string) || '';
    const id = notification.id as string;

    showBrowserNotification(title, message, `notification-${id}`);

    // Update badge count if Badging API is available
    if ('setAppBadge' in navigator) {
      (navigator as unknown as { setAppBadge: (count: number) => void }).setAppBadge(1);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to INSERT events on the Notification table
    const channel = supabase
      .channel('notification-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: SCHEMA,
          table: NOTIFICATION_TABLE,
        },
        handleInsert
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, handleInsert]);
}

/**
 * Clears the app badge (call when user views notifications).
 */
export function clearNotificationBadge() {
  if ('clearAppBadge' in navigator) {
    (navigator as unknown as { clearAppBadge: () => void }).clearAppBadge();
  }
}
