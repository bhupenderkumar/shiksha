import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { isAdminOrTeacher, profileService } from '@/services/profileService';
import { useProfileAccess } from '@/services/profileService';
import { useAuth } from '@/lib/auth';
import { clearNotificationBadge } from '@/hooks/use-notifications';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { classService } from '@/services/classService';
import { studentService } from '@/services/student.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BellIcon, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import  MultiSelect  from '@/components/ui/multi-select';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserProfile } from '@/services/profileService';

const NotificationCard = ({ notification, onUpdate, onDelete }) => {
  const typeColors = {
    GENERAL: 'bg-gray-100',
    HOMEWORK: 'bg-blue-100',
    ATTENDANCE: 'bg-green-100',
    FEE: 'bg-yellow-100',
    EXAM: 'bg-purple-100',
    EMERGENCY: 'bg-red-100',
  };

  return (
    <Card className={`${typeColors[notification.type]} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{notification.title}</CardTitle>
          <Badge variant="secondary">{notification.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-2">{notification.message}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {isAdminOrTeacher() && (
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => onUpdate(notification.id)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(notification.id)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSkeleton = () => (
  <Card className="animate-pulse bg-gray-100">
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-2/3 bg-gray-300" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2 bg-gray-300" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-24 bg-gray-300" />
        <div className="space-x-2">
          <Skeleton className="h-8 w-16 inline-block bg-gray-300" />
          <Skeleton className="h-8 w-16 inline-block bg-gray-300" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    studentId: '',
    classId: '',
  });
  const [activeTab, setActiveTab] = useState('view');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { isAdminOrTeacher, profile } = useProfileAccess();
  const { user } = useAuth();
  const classId = user?.classId; // Assuming user has classId property
  const [deleteDialog, setDeleteDialog] = useState({ open: false, notificationId: null });

  // Deduplicate notifications that have the same title+message+type
  // (from old per-student creation). Keeps the newest one from each group.
  const deduplicateNotifications = (list: Notification[]): Notification[] => {
    const seen = new Map<string, Notification>();
    for (const n of list) {
      const key = `${n.title}||${n.message}||${n.type}`;
      const existing = seen.get(key);
      if (!existing || new Date(n.createdAt || 0) > new Date(existing.createdAt || 0)) {
        seen.set(key, n);
      }
    }
    return Array.from(seen.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        let fetchedNotifications: Notification[];
        if (isAdminOrTeacher) {
          // Teachers/admins see all notifications
          fetchedNotifications = await notificationService.getNotifications();
        } else if (classId) {
          fetchedNotifications = await notificationService.getNotificationsByClassId(classId);
        } else {
          fetchedNotifications = await notificationService.getNotifications();
        }
        setNotifications(deduplicateNotifications(fetchedNotifications));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    // Clear app badge when viewing notifications
    clearNotificationBadge();
  }, [classId, isAdminOrTeacher]);

  useEffect(() => {
    const fetchClassesAndStudents = async () => {
      try {
        const classData = await classService.getAll(); 
        setClasses(classData);
        const studentData = await studentService.findMany();
        setStudents(studentData);
        // Auto-select all students by default (matches "All Classes" default)
        setSelectedStudents(studentData.map((s: any) => s.id));
      } catch (error) {
        console.error('Error fetching classes and students:', error);
        toast.error('Failed to load classes and students');
      }
    };

    fetchClassesAndStudents();
  }, []);

  const handleCreate = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error('Please enter title and message.');
      return;
    }

    let success = false;

    if (newNotification.classId) {
      // Send to a specific class
      const result = await notificationService.createNotification({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        classId: newNotification.classId,
        studentId: null,
        isRead: false,
      });
      success = !!result;
    } else {
      // Send to all classes — create one notification per class
      const uniqueClassIds = [...new Set(classes.map((c: any) => c.id))];
      const results = await Promise.all(
        uniqueClassIds.map((cId) =>
          notificationService.createNotification({
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            classId: cId,
            studentId: null,
            isRead: false,
          })
        )
      );
      success = results.some((r) => !!r);
    }

    if (success) {
      toast.success('Notifications sent!');
      setNewNotification({
        title: '',
        message: '',
        type: 'GENERAL',
        classId: '',
      });
      setSelectedStudents(students.map((s: any) => s.id));
      // Refresh notifications and switch to view tab
      const refreshed = await notificationService.getNotifications();
      setNotifications(deduplicateNotifications(refreshed));
      setActiveTab('view');
    } else {
      toast.error('Failed to create notification.');
    }
  };

  const handleUpdate = async (id: string) => {
    const updated = await notificationService.updateNotification(id, { message: 'Updated message' });
    if (updated) {
      setNotifications(notifications.map(n => n.id === id ? updated : n));
    }
  };

  const handleDelete = async (id: string) => {
    const deleted = await notificationService.deleteNotification(id);
    if (deleted) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleSelectStudent = (value: string) => {
    setNewNotification({ ...newNotification, studentId: value });
  };

  const handleSelectClass = (value: string) => {
    setNewNotification({ ...newNotification, classId: value });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, notificationId: id });
  };

  const confirmDelete = async () => {
    if (deleteDialog.notificationId) {
      await handleDelete(deleteDialog.notificationId);
      setDeleteDialog({ open: false, notificationId: null });
    }
  };

  const renderNotificationsList = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!notifications || notifications.length === 0) {
      return (
        <EmptyState
          icon={<BellIcon className="w-full h-full" />}
          title="No notifications yet"
          description={
            isAdminOrTeacher
              ? "Start by creating a new notification for your students or class"
              : "You don't have any notifications at the moment"
          }
          action={
            isAdminOrTeacher  && (
              <Button onClick={() => setActiveTab('create')} size="lg">
                Create First Notification
              </Button>
            )
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onUpdate={handleUpdate}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>
    );
};

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Notifications"
        subtitle="View and manage notifications"
        icon={<BellIcon className="text-primary-500" />}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="view" className={activeTab === 'view' ? 'font-bold' : ''}>View Notifications</TabsTrigger>
          {isAdminOrTeacher && (
            <TabsTrigger value="create" className={activeTab === 'create' ? 'font-bold' : ''}>Create Notification</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="view">
          {loading ? (
            <div className="space-y-4">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} onUpdate={handleUpdate} onDelete={handleDeleteClick} />
              ))}
            </div>
          ) : (
            <EmptyState message="No notifications available" />
          )}
        </TabsContent>
        {isAdminOrTeacher && (
          <TabsContent value="create">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Create Notification</h2>
              <Input
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Title"
              />
              <Textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                placeholder="Message"
              />
              <Select
                value={newNotification.type}
                onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="HOMEWORK">Homework</SelectItem>
                  <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                  <SelectItem value="FEE">Fee</SelectItem>
                  <SelectItem value="EXAM">Exam</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newNotification.classId || 'all'}
                onValueChange={(value) => {
                  const classId = value === 'all' ? '' : value;
                  setNewNotification({ ...newNotification, classId });
                  if (classId) {
                    const classStudents = students.filter((s: any) => s.classId === classId);
                    setSelectedStudents(classStudents.map((s: any) => s.id));
                  } else {
                    setSelectedStudents(students.map((s: any) => s.id));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <MultiSelect
                options={
                  (newNotification.classId
                    ? students.filter((s: any) => s.classId === newNotification.classId)
                    : students
                  ).map((s: any) => ({ value: s.id, label: s.name }))
                }
                selectedValues={selectedStudents}
                onChange={setSelectedStudents}
                placeholder="Select Students"
              />
              {selectedStudents.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                </p>
              )}
              <Button onClick={handleCreate}>Create Notification</Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, notificationId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This notification will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsPage;
