import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification, notificationService } from '@/services/notificationService';
import { useProfileAccess } from '@/services/profileService';
import { cn } from '@/lib/utils';

export function Notifications() {
  const { profile } = useProfileAccess();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    if (!profile?.id) return;
    try {
      const data = await notificationService.getNotifications(profile.id);
      setNotifications(data);
      const count = await notificationService.getUnreadCount(profile.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [profile?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile?.id) return;
    try {
      await notificationService.markAllAsRead(profile.id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'HOMEWORK':
        return '📚';
      case 'ATTENDANCE':
        return '📋';
      case 'FEE':
        return '💰';
      case 'EXAM':
        return '📝';
      case 'EMERGENCY':
        return '🚨';
      default:
        return '📢';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            <div className="flex justify-between items-center">
              <span>Your recent notifications</span>
              {notifications.some(n => !n.isRead) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start space-x-4 p-4 rounded-lg transition-colors',
                  !notification.isRead && 'bg-muted',
                  notification.isRead && 'opacity-70'
                )}
              >
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
