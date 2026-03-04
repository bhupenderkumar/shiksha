import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from '@/components/HomeworkCard';
import { Plus, Book, Eye, Trash, Edit } from 'lucide-react';
import { homeworkService, HomeworkType } from '@/services/homeworkService';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/lib/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeworkForm } from '@/components/forms/homework-form';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useProfileAccess } from '@/services/profileService';
import { Input } from "@/components/ui/input";
import debounce from 'lodash/debounce';

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

  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    subjectId: '',
    status: '',
    dateRange: null
  });

  const { loading, execute: fetchHomeworks } = useAsync(
    async () => {
      if (!profile) return;
      const data = await homeworkService.getAll(
        profile.role,
        profile.classId,
        {
          searchTerm: searchParams.searchTerm,
          subjectId: searchParams.subjectId || undefined,
          status: searchParams.status as HomeworkStatus || undefined,
          dateRange: searchParams.dateRange
        }
      );
      setHomeworks(data);
    },
    { showErrorToast: true }
  );

  const { execute: createHomework } = useAsync(
    async (data) => {
      await homeworkService.create(data, user?.id);
      await fetchHomeworks();
      handleCloseDialog();
      toast.success('Homework created successfully!');
    },
    { showErrorToast: true }
  );

  const { execute: updateHomework } = useAsync(
    async (data) => {
      if (!selectedHomework) return;
      await homeworkService.update(selectedHomework.id, data, user?.id);
      await fetchHomeworks();
      handleCloseDialog();
      toast.success('Homework updated successfully!');
    },
    { showErrorToast: true }
  );

  const handleDeleteHomework = async (id: string) => {
    try {
      await homeworkService.delete(id);
      await fetchHomeworks();
      setIsDeleteDialogOpen(false);
      setSelectedHomework(null);
      toast.success('Homework deleted successfully!');
    } catch (error) {
      console.error('Error deleting homework:', error);
    }
  };

  // Debounce search to avoid too many requests
  const debouncedSearch = debounce((value) => {
    setSearchParams(prev => ({ ...prev, searchTerm: value }));
  }, 300);

  useEffect(() => {
    if (profile) {
      fetchHomeworks();
    }
  }, [profile, searchParams]);

  const handleEdit = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setDialogState({ isOpen: true, mode: 'edit' });
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

  const renderSearchFilters = () => (
    <div className="mb-4 sm:mb-6">
      <Input
        placeholder="Search homework..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="w-full max-w-md"
      />
    </div>
  );

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Homework"
        subtitle="Manage and track homework assignments"
        icon={<Book className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button size="sm" className="text-xs sm:text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Homework</span>
              <span className="sm:hidden">Add</span>
            </Button>
          ) : null
        }
      />

      {renderSearchFilters()}

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
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {homeworks.map((homework) => (
            <div key={homework.id} className="relative">
              <HomeworkCard
                homework={homework}
                isStudent={profile?.role === 'STUDENT'}
                attachments={homework.attachments}
              />
              {isAdminOrTeacher && (
                <div className="absolute top-2 right-2 flex space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
                  <button className="p-1.5 rounded hover:bg-blue-50 transition-colors" onClick={() => handleEdit(homework)}>
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-red-50 transition-colors" onClick={() => {
                    setSelectedHomework(homework);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" onClick={() => navigate(`/homework/${homework.id}`)}>
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdminOrTeacher && (
        <>
          <Dialog open={dialogState.isOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}>
            <DialogContent className="max-w-4xl w-[98%] sm:w-[95%] h-[95vh] sm:h-[90vh] overflow-y-auto p-3 sm:p-6">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-3 sm:pb-4 border-b">
                <DialogTitle className="text-lg sm:text-xl">
                  {dialogState.mode === 'create' ? 'Create Homework' : 'Edit Homework'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-3 sm:py-4">
                <HomeworkForm
                  onSubmit={dialogState.mode === 'create' ? createHomework : updateHomework}
                  initialData={dialogState.mode === 'edit' ? selectedHomework : undefined}
                  files={selectedHomework?.attachments}
                  onCancel={handleCloseDialog}
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
                <AlertDialogAction onClick={() => handleDeleteHomework(selectedHomework?.id || '')}>
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