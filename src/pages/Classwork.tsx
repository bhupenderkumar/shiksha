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
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useProfileAccess } from '@/services/profileService';

export default function ClassworkPage() {
  const { user } = useAuth(); // Retrieve user from Auth context

  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();

  const [classworks, setClassworks] = useState<ClassworkType[]>([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    loading: boolean;
  }>({
    isOpen: false,
    mode: 'create',
    loading: false
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClasswork, setSelectedClasswork] = useState<ClassworkType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { loading, execute: fetchClassworks } = useAsync(
    async () => {
      if (!profile) return;
      try {
        const data = await classworkService.getAll(profile.role);
        setClassworks(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch classworks');
        throw err;
      }
    },
    { showErrorToast: true }
  );

  const { execute: createClasswork } = useAsync(
    async (data: CreateClassworkData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setDialogState(prev => ({ ...prev, loading: true }));
      try {
        await classworkService.create(data, user.id);
        await fetchClassworks();
        handleCloseDialog();
        toast.success('Classwork created successfully!');
      } finally {
        setDialogState(prev => ({ ...prev, loading: false }));
      }
    },
    { showErrorToast: true }
  );

  const { execute: updateClasswork } = useAsync(
    async (data: UpdateClassworkData) => {
      if (!selectedClasswork || !user?.id) return;
      
      setDialogState(prev => ({ ...prev, loading: true }));
      try {
        await classworkService.update(selectedClasswork.id, data, user.id);
        await fetchClassworks();
        handleCloseDialog();
        toast.success('Classwork updated successfully!');
      } finally {
        setDialogState(prev => ({ ...prev, loading: false }));
      }
    },
    { showErrorToast: true }
  );

  const handleDeleteClasswork = async (id: string) => {
    try {
      await classworkService.delete(id);
      await fetchClassworks();
      setIsDeleteDialogOpen(false);
      setSelectedClasswork(null);
      toast.success('Classwork deleted successfully!');
    } catch (error) {
      console.error('Error deleting classwork:', error);
      toast.error('Failed to delete classwork');
    }
  };

  useEffect(() => {
    if (profile && !profileLoading) {
      fetchClassworks().catch(console.error);
    }
  }, [profile, profileLoading]);

  const handleEdit = (classwork: ClassworkType) => {
    setSelectedClasswork(classwork);
    setDialogState({ isOpen: true, mode: 'edit', loading: false });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: 'create', loading: false });
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
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Classwork"
        subtitle="Manage and track class activities"
        icon={<Book className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button size="sm" className="text-xs sm:text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create', loading: false })}>
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Classwork</span>
              <span className="sm:hidden">Add</span>
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
              <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create', loading: false })}>
                Create Classwork
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classworks.map((classwork) => (
            <div key={classwork.id} className="relative">
              <ClassworkCard
                classwork={classwork}
                isStudent={!isAdminOrTeacher}
                attachments={classwork.attachments}
              />
              {isAdminOrTeacher && (
                <div className="absolute top-2 right-2 flex space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
                  <button className="p-1.5 rounded hover:bg-blue-50 transition-colors" onClick={() => handleEdit(classwork)}>
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-red-50 transition-colors" onClick={() => handleDelete(classwork)}>
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors" onClick={() => navigate(`/classwork/${classwork.id}`)}>
                    <EyeIcon className="w-4 h-4 text-gray-600" />
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
                  {dialogState.mode === 'create' ? 'Create Classwork' : 'Edit Classwork'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-3 sm:py-4">
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
