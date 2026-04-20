import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission, getNotificationPermission } from '@/hooks/use-notifications';
import toast from 'react-hot-toast';

export function NotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session or if not supported
    if (sessionStorage.getItem('notification-banner-dismissed')) {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('Notifications enabled! You\'ll receive alerts for homework, attendance & announcements.');
      setDismissed(true);
    } else if (result === 'denied') {
      toast.error('Notifications blocked. You can enable them in your browser settings.');
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('notification-banner-dismissed', '1');
  };

  // Don't show if: already granted, denied, dismissed, or not supported
  if (permission !== 'default' || dismissed || !('Notification' in window)) {
    return null;
  }

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Enable Notifications</p>
          <p className="text-xs text-gray-600 mt-0.5">
            Get alerts for homework, fee reminders, attendance & announcements
          </p>
          <div className="flex gap-2 mt-2.5">
            <Button
              size="sm"
              onClick={handleEnable}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-3"
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              Enable
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-gray-500 text-xs h-8 px-3"
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-violet-100 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

/**
 * Small icon button to show notification status in the header.
 */
export function NotificationStatusIcon() {
  const permission = getNotificationPermission();

  if (permission === 'granted') return null; // No indicator needed when enabled

  return (
    <button
      onClick={async () => {
        if (permission === 'denied') {
          toast.error('Notifications are blocked. Enable in browser settings.');
        } else {
          const result = await requestNotificationPermission();
          if (result === 'granted') {
            toast.success('Notifications enabled!');
          }
        }
      }}
      className="relative"
      title={permission === 'denied' ? 'Notifications blocked' : 'Enable notifications'}
    >
      <BellOff className="w-4 h-4 text-amber-500" />
    </button>
  );
}
