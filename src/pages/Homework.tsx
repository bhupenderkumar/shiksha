import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from '@/components/HomeworkCard';
import { Plus, Book, Eye, Share2 } from 'lucide-react';
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
import { fileService } from '@/services/fileService';
import { supabase } from '@/lib/api-client';
import { Attachment } from '@/components/Attachment';
import { useProfileAccess } from '@/services/profileService';

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
  const [shareUrl, setShareUrl] = useState<string>('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

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

  const generateShareableUrl = (homeworkId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/homework/view/${homeworkId}`;
  };

  const handleViewClick = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setShareUrl(generateShareableUrl(homework.id));
    setViewDialogOpen(true);
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
            return {
              fileName: file.name,
              filePath,
              fileType: file.type
            };
          })
        );
      }

      const homeworkPayload = {
        ...homeworkData,
        attachments: uploadedFiles,
        status: 'PENDING'
      };

      if (selectedHomework) {
        await homeworkService.update(selectedHomework.id, {
          ...homeworkPayload,
          attachments: [...(selectedHomework.attachments || []), ...uploadedFiles]
        });
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleFileDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('homework')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen">
      <PageHeader 
        title="Homework"
        subtitle="Manage and track homework assignments"
        icon={<Book className="w-6 h-6" />}
        action={
          isAdminOrTeacher ? (
            <Button onClick={handleCreateClick} className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Homework</span>
              <span className="sm:hidden">New</span>
            </Button>
          ) : undefined
        }
        className="mb-6"
      />

      {loading || profileLoading ? (
        <LoadingSpinner />
      ) : homeworks.length === 0 ? (
        <EmptyState
          title="No homework found"
          description="Create your first homework assignment to get started"
          icon={<Book className="w-16 h-16 sm:w-24 sm:h-24" />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {homeworks?.map((homework) => (
            <HomeworkCard
              key={homework.id}
              homework={homework}
              onEdit={isAdminOrTeacher ? handleEditClick : undefined}
              onDelete={isAdminOrTeacher ? handleDeleteClick : undefined}
              onView={handleViewClick}
              isStudent={!isAdminOrTeacher}
            >
              {homework.attachments && homework.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Attachments:</h4>
                  <div className="space-y-2">
                    {homework.attachments.map((attachment, index) => (
                      <Attachment
                        key={index}
                        fileName={attachment.fileName}
                        fileType={attachment.fileType}
                        onDownload={() => handleFileDownload(attachment.filePath, attachment.fileName)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </HomeworkCard>
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={() => setViewDialogOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <DialogHeader className="sticky top-0 bg-background z-10 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle>View Homework</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 mt-2 sm:mt-0"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DialogHeader>
          <div className="px-1 py-4">
            <HomeworkForm
              initialData={selectedHomework}
              files={selectedHomework?.attachments}
              onCancel={() => setViewDialogOpen(false)}
              readOnly={true}
            />
            {selectedHomework?.attachments && selectedHomework.attachments.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                <div className="space-y-2">
                  {selectedHomework.attachments.map((attachment, index) => (
                    <Attachment
                      key={index}
                      fileName={attachment.fileName}
                      fileType={attachment.fileType}
                      onDownload={() => handleFileDownload(attachment.filePath, attachment.fileName)}
                    />
                  ))}
                </div>
              </div>
            )}
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