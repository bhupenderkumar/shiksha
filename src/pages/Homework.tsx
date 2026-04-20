import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HomeworkCard } from '@/components/HomeworkCard';
import { Plus, Book, Eye, Trash, Edit, Brain, Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { homeworkService, HomeworkType, HomeworkStatus } from '@/services/homeworkService';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';

type StatusFilter = 'all' | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SUBMITTED' | 'ai_planned';

export default function HomeworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
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

  const [searchTerm, setSearchTerm] = useState('');

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
      toast.error('Failed to delete homework');
    }
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    if (profile) {
      fetchHomeworks();
    }
  }, [profile]);

  const handleEdit = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setDialogState({ isOpen: true, mode: 'edit' });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: 'create' });
    setSelectedHomework(null);
  };

  // Stats + filtering
  const stats = useMemo(() => {
    const pending = homeworks.filter(h => h.status === 'PENDING').length;
    const completed = homeworks.filter(h => h.status === 'COMPLETED').length;
    const overdue = homeworks.filter(h => h.status === 'OVERDUE').length;
    const submitted = homeworks.filter(h => h.status === 'SUBMITTED').length;
    const aiPlanned = homeworks.filter(h => !!h.sourcePlanItemId).length;
    return { pending, completed, overdue, submitted, aiPlanned, total: homeworks.length };
  }, [homeworks]);

  const filteredHomeworks = useMemo(() => {
    let result = homeworks;

    // Tab filter
    if (activeTab === 'ai_planned') {
      result = result.filter(h => !!h.sourcePlanItemId);
    } else if (activeTab !== 'all') {
      result = result.filter(h => h.status === activeTab);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(h =>
        h.title.toLowerCase().includes(term) ||
        h.description?.toLowerCase().includes(term) ||
        h.subject?.name?.toLowerCase().includes(term) ||
        h.chapterName?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [homeworks, activeTab, searchTerm]);

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

      {/* Stats bar */}
      {homeworks.length > 0 && (
        <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-medium text-foreground">{stats.total}</span> total
          </div>
          {stats.pending > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
              <Clock className="w-3 h-3" /> {stats.pending} Pending
            </Badge>
          )}
          {stats.overdue > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" /> {stats.overdue} Overdue
            </Badge>
          )}
          {stats.completed > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3" /> {stats.completed} Done
            </Badge>
          )}
          {stats.aiPlanned > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
              <Brain className="w-3 h-3" /> {stats.aiPlanned} AI
            </Badge>
          )}
        </div>
      )}

      {/* Search + Filter tabs */}
      {homeworks.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search homework..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="all" className="text-xs h-7 px-3">All</TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs h-7 px-3 gap-1">
                <Clock className="w-3 h-3" /> Pending
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="text-xs h-7 px-3 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </TabsTrigger>
              <TabsTrigger value="OVERDUE" className="text-xs h-7 px-3 gap-1">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </TabsTrigger>
              <TabsTrigger value="ai_planned" className="text-xs h-7 px-3 gap-1">
                <Brain className="w-3 h-3" /> AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {filteredHomeworks.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' && !searchTerm ? "No homework yet!" : "No matching homework"}
          description={
            activeTab === 'all' && !searchTerm
              ? (isAdminOrTeacher ? "Start by creating a new homework" : "No homework has been assigned yet")
              : "Try adjusting your search or filter"
          }
          icon={<Book className="w-full h-full" />}
          action={
            isAdminOrTeacher && activeTab === 'all' && !searchTerm ? (
              <Button className="text-sm" onClick={() => setDialogState({ isOpen: true, mode: 'create' })}>
                Create Homework
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredHomeworks.map((homework) => (
            <div key={homework.id} className="relative group">
              <HomeworkCard
                homework={homework}
                isStudent={profile?.role === 'STUDENT'}
                attachments={homework.attachments}
              />
              {isAdminOrTeacher && (
                <div className="absolute top-2 right-2 flex space-x-1 bg-white/90 backdrop-blur-sm rounded-lg p-0.5 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button className="p-1.5 rounded-md hover:bg-blue-50 transition-colors" onClick={() => handleEdit(homework)}>
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-red-50 transition-colors" onClick={() => {
                    setSelectedHomework(homework);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash className="w-3.5 h-3.5 text-red-500" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" onClick={() => navigate(`/homework/${homework.id}`)}>
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
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
            <DialogContent className="max-w-4xl w-[98%] sm:w-[95%] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6" aria-describedby={undefined}>
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