import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from '@/components/HomeworkCard';
import { Plus, Book, Eye } from 'lucide-react';
import { homeworkService, HomeworkType } from '@/services/homeworkService';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeworkForm } from '@/components/forms/homework-form';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useProfileAccess } from '@/services/profileService';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { fileService } from '@/services/fileService';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [selectedHomework, setSelectedHomework] = useState<HomeworkType | null>(null);
  const [homeworkToDelete, setHomeworkToDelete] = useState<HomeworkType | null>(null);
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();

  const { loading, execute: fetchHomeworks } = useAsync(
    async () => {
      if (!profile) return;
      const data = await homeworkService.getAll(profile.role, profile.classId);
      setHomeworks(data);
    },
    { showErrorToast: true }
  );

  useEffect(() => {
    if (profile) {
      fetchHomeworks();
    }
  }, [profile]);

  const handleCreateClick = () => {
    setSelectedHomework(null);
    setDialogState({ isOpen: true, mode: 'create' });
  };

  const handleEditClick = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setDialogState({ isOpen: true, mode: 'edit' });
  };

  const handleViewClick = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setDialogState({ isOpen: true, mode: 'view' });
  };

  const handleDeleteClick = (homework: HomeworkType) => {
    setHomeworkToDelete(homework);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const { attachments, ...homeworkData } = data;
      
      // Handle file uploads first if there are any new files
      let uploadedFiles = [];
      if (attachments && attachments.length > 0) {
        uploadedFiles = await Promise.all(
          attachments.map(async (file: File) => {
            const filePath = await fileService.uploadFile(file, 'homework');
            return {
              fileName: file.name,
              filePath,
              fileType: file.type
            };
          })
        );
      }

      // Combine existing and new files
      const allAttachments = [
        ...(selectedHomework?.attachments || []),
        ...uploadedFiles
      ];

      if (selectedHomework) {
        // Update existing homework
        await homeworkService.update(selectedHomework.id, {
          ...homeworkData,
          attachments: allAttachments
        }, user?.id || '');
        toast.success('Homework updated successfully');
      } else {
        // Create new homework
        await homeworkService.create({
          ...homeworkData,
          attachments: uploadedFiles
        }, user?.id || '');
        toast.success('Homework created successfully');
      }
      
      setDialogState({ isOpen: false, mode: 'create' });
      fetchHomeworks();
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to save homework');
    }
  };

  const handleDelete = async () => {
    if (!homeworkToDelete) return;

    try {
      await homeworkService.delete(homeworkToDelete.id);
      toast.success('Homework deleted successfully');
      setHomeworkToDelete(null);
      fetchHomeworks();
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast.error('Failed to delete homework');
    }
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: 'create' });
    setSelectedHomework(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Homework"
        subtitle="Manage and track homework assignments"
        icon={<Book className="w-6 h-6" />}
        action={
          isAdminOrTeacher ? (
            <Button onClick={handleCreateClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Homework
            </Button>
          ) : undefined
        }
      />

      {loading || profileLoading ? (
        <LoadingSpinner />
      ) : homeworks.length === 0 ? (
        <EmptyState
          title="No homework found"
          description="Create your first homework assignment to get started"
          icon={<Book className="w-full h-full" />}
          action={
            isAdminOrTeacher ? (
              <Button onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Create Homework
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworks?.map((homework) => (
            <HomeworkCard
              key={homework.id}
              homework={homework}
              onEdit={isAdminOrTeacher ? handleEditClick : undefined}
              onDelete={isAdminOrTeacher ? handleDeleteClick : undefined}
              onView={handleViewClick}
              isStudent={!isAdminOrTeacher}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === 'create' ? 'Create Homework' : 
               dialogState.mode === 'edit' ? 'Edit Homework' : 'View Homework'}
            </DialogTitle>
          </DialogHeader>
          <HomeworkForm
            onSubmit={handleFormSubmit}
            initialData={selectedHomework}
            files={selectedHomework?.attachments}
            onCancel={handleCloseDialog}
            readOnly={dialogState.mode === 'view'}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!homeworkToDelete} onOpenChange={() => setHomeworkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the homework
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHomeworkToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}