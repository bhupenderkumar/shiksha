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
import { useMediaQuery } from 'react-responsive';
import { Attachment } from '@/components/Attachment'; // Import Attachment component
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });

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
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search homework..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full"
        />
        
        {isAdminOrTeacher && (
          <Select
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
            options={[
              { label: 'All Status', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Overdue', value: 'OVERDUE' }
            ]}
            className="w-full"
          />
        )}

        <Select
          value={searchParams.subjectId}
          onChange={(value) => setSearchParams(prev => ({ ...prev, subjectId: value }))}
          options={[
            { label: 'All Subjects', value: '' },
            // Add subject options based on your data
          ]}
          className="w-full"
        />

        <DateRangePicker
          value={searchParams.dateRange}
          onChange={(range) => setSearchParams(prev => ({ ...prev, dateRange: range }))}
          className="w-full"
        />
      </div>
    </div>
  );

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
        <div className="overflow-auto">
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {homeworks.map((homework) => (
              <div key={homework.id} className="relative">
                <HomeworkCard
                  key={homework.id}
                  homework={homework}
                  onEdit={handleEdit}
                  onDelete={handleDeleteHomework}
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