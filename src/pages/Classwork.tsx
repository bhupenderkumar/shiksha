import { useEffect, useState } from 'react';
import { useAsync } from '@/hooks/use-async';
import { classworkService, type ClassworkType } from '@/services/classworkService';
import { PageHeader } from '@/components/ui/page-header';
import { ClassworkCard } from '@/components/ClassworkCard';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClassworkForm } from '@/components/forms/classwork-form';
import { Book, Plus, Edit, Trash, EyeIcon } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useProfileAccess } from '@/services/profileService';
import toast from 'react-hot-toast';
import { useMediaQuery } from 'react-responsive';
import { Link, useNavigate } from 'react-router-dom';

export default function ClassworkPage() {
  const [classworks, setClassworks] = useState<ClassworkType[]>([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
  }>({
    isOpen: false,
    mode: 'create'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClasswork, setSelectedClasswork] = useState<ClassworkType | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();

  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });

  const navigate = useNavigate();

  const { loading, execute: fetchClassworks } = useAsync(
    async () => {
      if (!profile) return;
      const data = await classworkService.getAll(profile.role, profile.classId);
      setClassworks(data);
    },
    { showErrorToast: true }
  );

  const { execute: createClasswork } = useAsync(
    async (data) => {
      await classworkService.create(data);
      await fetchClassworks();
      handleCloseDialog();
      toast.success('Classwork created successfully!');
    },
    { showErrorToast: true }
  );

  const { execute: updateClasswork } = useAsync(
    async (data) => {
      if (!selectedClasswork) return;
      await classworkService.update(selectedClasswork.id, data);
      await fetchClassworks();
      handleCloseDialog();
      toast.success('Classwork updated successfully!');
    },
    { showErrorToast: true }
  );

  const handleDeleteClasswork = async (id: string) => {
    try {
      await classworkService.delete(id); // Ensure this uses the updated delete method
      await fetchClassworks();
      setIsDeleteDialogOpen(false);
      setSelectedClasswork(null);
      toast.success('Classwork deleted successfully!');
    } catch (error) {
      console.error('Error deleting classwork:', error);
      // Handle error, e.g., show a notification
    }
  };

  useEffect(() => {
    if (profile) {
      fetchClassworks();
    }
  }, [profile]);

  const handleEdit = (classwork: ClassworkType) => {
    setSelectedClasswork(classwork);
    setDialogState({ isOpen: true, mode: 'edit' }); // Open dialog for editing
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: 'create' });
    setSelectedClasswork(null);
  };

  const handleDelete = (classwork: ClassworkType) => {
    setSelectedClasswork(classwork);
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
        title="Classwork"
        subtitle="Manage and track class activities"
        icon={<Book className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
              <Plus className="w-4 h-4 mr-2" />
              Add Classwork
            </Button>
          ) : null
        }
      />

      {classworks.length === 0 ? (
        <EmptyState
          title="No classwork yet!"
          description={isAdminOrTeacher ? "Start by creating a new classwork" : "No classwork has been assigned yet"}
          icon={<Book className="w-full h-full" />}
          action={
            isAdminOrTeacher ? (
              <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
                Create Classwork
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-auto"> {/* Added overflow-auto for scrollbar */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}> {/* Modified grid classes for responsiveness */}
            {classworks.map((classwork) => (
              <div key={classwork.id} className="relative">
                  <ClassworkCard
                    classwork={classwork}
                    isStudent={!isAdminOrTeacher}
                  />
                {isAdminOrTeacher && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button onClick={() => handleEdit(classwork)}>
                      <Edit className="text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(classwork)}>
                      <Trash className="text-red-500" />
                    </button>
                    <button>
                      <EyeIcon className="text-red-500"  onClick={() => navigate(`/classwork/${classwork.id}`)}/>
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
                  {dialogState.mode === 'create' ? 'Create Classwork' : 'Edit Classwork'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ClassworkForm
                  onSubmit={dialogState.mode === 'create' ? createClasswork : updateClasswork}
                  initialData={dialogState.mode === 'edit' ? selectedClasswork : undefined}
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
                <AlertDialogTitle>Delete Classwork</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this classwork? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDeleteClasswork(selectedClasswork?.id || '')}
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
