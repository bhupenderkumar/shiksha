import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from '@/components/HomeworkCard';
import { Plus, Book, Eye, Trash, Edit } from 'lucide-react';
import { homeworkService, HomeworkType } from '@/services/homeworkService';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeworkForm } from '@/components/forms/homework-form';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useProfileAccess } from '@/services/profileService';
import { fileService } from '@/services/fileService';
import { useMediaQuery } from 'react-responsive';
import { v4 as uuidv4 } from 'uuid';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [selectedHomework, setSelectedHomework] = useState<HomeworkType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    async (data: any) => {
      const { files, existingFiles, ...homeworkData } = data;
      let uploadedFiles = [];
      
      if (files && files.length > 0) {
        uploadedFiles = await Promise.all(
          files.map(async (file: File) => {
            const filePath = await fileService.uploadFile(file, 'homework');
            return {
              name: file.name,
              filePath,
              type: file.type || file.name.split('.').pop() || 'application/octet-stream'
            };
          })
        );
      }

      const homeworkPayload = { 
        ...homeworkData, 
        attachments: [...(existingFiles || []), ...uploadedFiles],
        status: 'PENDING' 
      };

      await homeworkService.create(homeworkPayload);
      await fetchHomeworks();
      handleCloseDialog();
      toast.success('Homework created successfully!');
    },
    { showErrorToast: true }
  );

  const { execute: updateHomework } = useAsync(
    async (data: any) => {
      if (!selectedHomework) return;
      const { files, existingFiles, ...homeworkData } = data;
      let uploadedFiles = [];
      
      if (files && files.length > 0) {
        uploadedFiles = await Promise.all(
          files.map(async (file: File) => {
            const filePath = await fileService.uploadFile(file, 'homework');
            return {
              name: file.name,
              filePath,
              type: file.type || file.name.split('.').pop() || 'application/octet-stream'
            };
          })
        );
      }

      await homeworkService.update(selectedHomework.id, {
        ...homeworkData,
        attachments: [...(existingFiles || []), ...uploadedFiles]
      });
      await fetchHomeworks();
      handleCloseDialog();
      toast.success('Homework updated successfully!');
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
    setDialogState({ isOpen: true, mode: 'edit' });
  };

  const handleDelete = async () => {
    if (!selectedHomework) return;
    try {
      await homeworkService.delete(selectedHomework.id);
      await fetchHomeworks();
      setIsDeleteDialogOpen(false);
      setSelectedHomework(null);
      toast.success('Homework deleted successfully!');
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast.error('Failed to delete homework');
    }
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: 'create' });
    setSelectedHomework(null);
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
        icon={<Book className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
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
          icon={<Book className="w-full h-full" />}
          action={
            isAdminOrTeacher ? (
              <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
                Create Homework
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-auto">
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {homeworks.map((homework) => (
              <div key={homework.id} className="relative">
                <HomeworkCard
                  key={homework.id}
                  homework={homework}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={() => {}}
                  isStudent={profile?.role === 'STUDENT'}
                  attachments={homework.attachments}
                />
                {isAdminOrTeacher && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button onClick={() => handleEdit(homework)}>
                      <Edit className="text-blue-500" />
                    </button>
                    <button onClick={() => {
                      setSelectedHomework(homework);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash className="text-red-500" />
                    </button>
                    <button onClick={() => navigate(`/homework/${homework.id}`)}>
                      <Eye className="text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdminOrTeacher && (
        <>
          <Dialog open={dialogState.isOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}>
            <DialogContent className="max-w-4xl w-[95%] h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle>
                  {dialogState.mode === 'create' ? 'Create Homework' : 'Edit Homework'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <HomeworkForm
                  onSubmit={dialogState.mode === 'create' ? createHomework : updateHomework}
                  initialData={dialogState.mode === 'edit' ? selectedHomework : undefined}
                  files={selectedHomework?.attachments}
                  onCancel={handleCloseDialog}
                  readOnly={false}
                />
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
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
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