import { useEffect, useState } from 'react';
import { useAsync } from '@/hooks/use-async';
import { homeworkService, type HomeworkType } from '@/services/homeworkService';
import { PageHeader } from '@/components/ui/page-header';
import { HomeworkCard } from '@/components/HomeworkCard';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeworkForm } from '@/components/forms/homework-form';
import { BookOpen, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useProfileAccess } from '@/services/profileService';
import toast from 'react-hot-toast';
import { useMediaQuery } from 'react-responsive';

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkType | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });

  const { loading, execute: fetchHomeworks } = useAsync(
    async () => {
      if (!profile) return;
      const data = await homeworkService.getAll(profile.role, profile.classId);
      setHomeworks(data);
    },
    { showErrorToast: true }
  );

  const { execute: createHomework } = useAsync(
    async (data) => {
      await homeworkService.create(data);
      await fetchHomeworks();
      setIsCreateDialogOpen(false);
      toast.success('Homework created successfully!');
    },
    { showErrorToast: true }
  );

  const { execute: updateHomework } = useAsync(
    async (data) => {
      if (!selectedHomework) return;
      await homeworkService.update(selectedHomework.id, data);
      await fetchHomeworks();
      setIsEditDialogOpen(false);
      setSelectedHomework(null);
      toast.success('Homework updated successfully!');
    },
    { showErrorToast: true }
  );

  const { execute: deleteHomework } = useAsync(
    async () => {
      if (!selectedHomework) return;
      await homeworkService.delete(selectedHomework.id);
      await fetchHomeworks();
      setIsDeleteDialogOpen(false);
      setSelectedHomework(null);
      toast.success('Homework deleted successfully!');
    },
    { showErrorToast: true }
  );

  useEffect(() => {
    if (profile) {
      fetchHomeworks();
    }
  }, [profile]);

  const handleEdit = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setIsEditDialogOpen(true);
    setFiles(homework.files || []);
  };

  const handleDelete = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setIsDeleteDialogOpen(true);
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Homework"
        subtitle="Manage and track homework assignments"
        icon={<BookOpen className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Homework
            </Button>
          ) : null
        }
      />

      {homeworks.length === 0 ? (
        <EmptyState
          title="No homework yet!"
          description={isAdminOrTeacher ? "Start by creating a new homework" : "No homework has been assigned yet"}
          icon={<BookOpen className="w-full h-full" />}
          action={
            isAdminOrTeacher ? (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Homework
              </Button>
            ) : null
          }
        />
      ) : (
        <div className={`grid gap-6 ${
          isMobile ? 'grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {homeworks.map((homework) => (
            <HomeworkCard
              key={homework.id}
              homework={homework}
              onEdit={isAdminOrTeacher ? () => handleEdit(homework) : undefined}
              onDelete={isAdminOrTeacher ? () => handleDelete(homework) : undefined}
              isStudent={!isAdminOrTeacher}
            />
          ))}
        </div>
      )}

      {isAdminOrTeacher && (
        <>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-4xl w-[95%] h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle>Create Homework</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <HomeworkForm onSubmit={createHomework} />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          >
            <DialogContent className="max-w-4xl w-[95%] h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle>Edit Homework</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {selectedHomework && (
                  <HomeworkForm
                    onSubmit={updateHomework}
                    initialData={selectedHomework}
                    files={selectedHomework.attachments}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Homework</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this homework? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={deleteHomework}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}