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

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; mode: 'create' | 'edit' | 'view' }>({ isOpen: false, mode: 'create' });
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
    navigate(`/homework/${homework.id}`);
  };

  const handleDeleteClick = (homework: HomeworkType) => {
    setHomeworkToDelete(homework);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const { files, ...homeworkData } = data;
      let uploadedFiles = [];
      if (files && files.length > 0) {
        uploadedFiles = await Promise.all(
          files.map(async (file: File) => {
            const filePath = await fileService.uploadFile(file, 'homework');
            return { fileName: file.name, filePath, fileType: file.type };
          })
        );
      }

      const homeworkPayload = { ...homeworkData, attachments: uploadedFiles, userId: user?.id, status: 'PENDING' };

      if (selectedHomework) {
        await homeworkService.update(selectedHomework.id, { ...homeworkPayload, attachments: uploadedFiles });
        toast.success('Homework updated successfully');
      } else {
        await homeworkService.create(homeworkPayload);
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
    <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen">
      <PageHeader 
        title="Homework"
        subtitle="Manage and track homework assignments"
        icon={<Book className="w-6 h-6" />}
        action={isAdminOrTeacher ? (
          <Button onClick={handleCreateClick} className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Homework</span>
            <span className="sm:hidden">New</span>
          </Button>
        ) : undefined}
        className="mb-6"
      />

      {loading || profileLoading ? (
        <LoadingSpinner />
      ) : homeworks.length === 0 ? (
        <EmptyState
          title="No homework found"
          description="Create your first homework assignment to get started"
          icon={<Book className="w-16 h-16 sm:w-24 sm:h-24" />}
          action={isAdminOrTeacher ? (
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Homework
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {homeworks.map((homework) => (
            <div key={homework.id} className="relative">
              <HomeworkCard 
                homework={homework} 
                onEdit={isAdminOrTeacher ? handleEditClick : undefined} 
                onView={handleViewClick} 
                isStudent={!isAdminOrTeacher}
                attachments={homework.attachments || []}
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                {isAdminOrTeacher && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(homework)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(homework)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewClick(homework)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <DialogHeader className="sticky top-0 bg-background z-10 py-2">
            <DialogTitle>
              {dialogState.mode === 'create' ? 'Create Homework' : 'Edit Homework'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-1 py-4">
            <HomeworkForm
              onSubmit={handleFormSubmit}
              initialData={selectedHomework}
              files={selectedHomework?.attachments}
              onCancel={handleCloseDialog}
              readOnly={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!homeworkToDelete} onOpenChange={() => setHomeworkToDelete(null)}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the homework
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel className="mb-2 sm:mb-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}