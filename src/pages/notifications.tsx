import { useEffect, useState } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { isAdminOrTeacher, profileService } from '@/services/profileService';
import { useProfileAccess } from '@/services/profileService';
import { useAuth } from '@/lib/auth';
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
import { BellIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import  MultiSelect  from '@/components/ui/multi-select';
import { UserProfile } from '@/services/profileService';

const NotificationCard = ({ notification, onUpdate, onDelete }) => {
  const typeColors = {
    GENERAL: 'bg-gray-100 dark:bg-gray-800',
    HOMEWORK: 'bg-blue-100 dark:bg-blue-900/40',
    ATTENDANCE: 'bg-green-100 dark:bg-green-900/40',
    FEE: 'bg-yellow-100 dark:bg-yellow-900/40',
    EXAM: 'bg-purple-100 dark:bg-purple-900/40',
    EMERGENCY: 'bg-red-100 dark:bg-red-900/40',
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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (classId) {
        const fetchedNotifications = await notificationService.getNotificationsByClassId(classId);
        setNotifications(fetchedNotifications);
      }
    };
    fetchNotifications();
  }, [classId]);

  useEffect(() => {
    const fetchClassesAndStudents = async () => {
      try {
        const classData = await classService.getAll(); 
        setClasses(classData);
        const studentData = await studentService.findMany();
        setStudents(studentData);
      } catch (error) {
        console.error('Error fetching classes and students:', error);
        toast.error('Failed to load classes and students');
      }
    };

    fetchClassesAndStudents();
  }, []);

  const handleCreate = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student.');
      return;
    }

    const createdNotifications = await Promise.all(
      selectedStudents.map(async (studentId) => {
        return await notificationService.createNotification({
          ...newNotification,
          studentId, // Use single studentId for each notification
          isRead: false,
        });
      })
    );

    if (createdNotifications) {
      toast.success('Notifications created successfully!');
      setNewNotification({
        title: '',
        message: '',
        type: 'GENERAL',
        classId: '',
      });
      setSelectedStudents([]);
      // Refresh notifications after creating new ones
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="view" className={activeTab === 'view' ? 'font-bold' : ''}>View Notifications</TabsTrigger>
          {isAdminOrTeacher && (
            <TabsTrigger value="create" className={activeTab === 'create' ? 'font-bold' : ''}>Create Notification</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="view">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <EmptyState message="No notifications available" />
          )}
        </TabsContent>
        {isAdminOrTeacher && (
          <TabsContent value="create">
            <div>
              <h2>Create Notification</h2>
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
