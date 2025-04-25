import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InteractiveAssignmentCard } from '@/components/InteractiveAssignmentCard';
import { Plus, Book, Eye, Trash, Edit, Share2, Search, Filter, X } from 'lucide-react';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useProfileAccess } from '@/services/profileService';

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { toast } from 'react-hot-toast';
import { InteractiveAssignment, InteractiveAssignmentType, InteractiveAssignmentStatus } from '@/types/interactiveAssignment';
import { ROUTES } from '@/constants/app-constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InteractiveAssignments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdminOrTeacher } = useProfileAccess();

  const [assignments, setAssignments] = useState<InteractiveAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<InteractiveAssignment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<InteractiveAssignmentType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<InteractiveAssignmentStatus | ''>('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const { execute: fetchAssignments, loading: fetchLoading } = useAsync(
    async () => {
      const filters = {
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        searchTerm: searchTerm || undefined,
        dateRange: dateRange.from && dateRange.to ? {
          from: dateRange.from,
          to: dateRange.to
        } : undefined
      };

      const data = await interactiveAssignmentService.getAll(
        user?.role || 'STUDENT',
        undefined, // We don't have classId in the user object, so we'll pass undefined
        filters
      );

      setAssignments(data || []);
    }
  );

  useEffect(() => {
    fetchAssignments();
  }, [searchTerm, selectedType, selectedStatus, dateRange]);

  // Filter assignments based on active tab
  const filteredAssignments = React.useMemo(() => {
    if (activeTab === 'all') return assignments;
    return assignments.filter(assignment => {
      switch (activeTab) {
        case 'draft': return assignment.status === 'DRAFT';
        case 'published': return assignment.status === 'PUBLISHED';
        case 'archived': return assignment.status === 'ARCHIVED';
        default: return true;
      }
    });
  }, [assignments, activeTab]);

  const handleCreateAssignment = () => {
    navigate(ROUTES.INTERACTIVE_ASSIGNMENT_CREATE);
  };

  const handleEditAssignment = (assignment: InteractiveAssignment) => {
    navigate(`${ROUTES.INTERACTIVE_ASSIGNMENT_EDIT.replace(':id', assignment.id)}`);
  };

  const handleViewAssignment = (assignment: InteractiveAssignment) => {
    navigate(`${ROUTES.INTERACTIVE_ASSIGNMENT_VIEW.replace(':id', assignment.id)}`);
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await interactiveAssignmentService.delete(selectedAssignment.id);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAssignment(null);
    }
  };

  const handleShareAssignment = async (assignment: InteractiveAssignment) => {
    setSelectedAssignment(assignment);
    try {
      const link = await interactiveAssignmentService.generateShareableLink(assignment.id);
      if (link) {
        setShareableLink(link);
      }
      setIsShareDialogOpen(true);
    } catch (error) {
      toast.error('Failed to generate shareable link');
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success('Link copied to clipboard');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setDateRange({ from: undefined, to: undefined });
  };

  const renderSearchFilters = () => {
    return (
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Assignment Type</label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as InteractiveAssignmentType | '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="MATCHING">Matching</SelectItem>
                      <SelectItem value="COMPLETION">Completion</SelectItem>
                      <SelectItem value="DRAWING">Drawing</SelectItem>
                      <SelectItem value="COLORING">Coloring</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                      <SelectItem value="ORDERING">Ordering</SelectItem>
                      <SelectItem value="TRACING">Tracing</SelectItem>
                      <SelectItem value="AUDIO_READING">Audio Reading</SelectItem>
                      <SelectItem value="COUNTING">Counting</SelectItem>
                      <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                      <SelectItem value="PUZZLE">Puzzle</SelectItem>
                      <SelectItem value="SORTING">Sorting</SelectItem>
                      <SelectItem value="HANDWRITING">Handwriting</SelectItem>
                      <SelectItem value="LETTER_TRACING">Letter Tracing</SelectItem>
                      <SelectItem value="NUMBER_RECOGNITION">Number Recognition</SelectItem>
                      <SelectItem value="PICTURE_WORD_MATCHING">Picture-Word Matching</SelectItem>
                      <SelectItem value="PATTERN_COMPLETION">Pattern Completion</SelectItem>
                      <SelectItem value="CATEGORIZATION">Categorization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as InteractiveAssignmentStatus | '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date Range</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(range) => {
                      if (range) {
                        setDateRange({
                          from: range.from,
                          to: range.to
                        });
                      } else {
                        setDateRange({
                          from: undefined,
                          to: undefined
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={resetFilters} className="mr-2">
                  <X className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
                <Button onClick={() => fetchAssignments()}>
                  <Search className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
            {activeTab !== 'all' && ` (${activeTab})`}
          </div>

          {(selectedType || selectedStatus || dateRange.from || searchTerm) && (
            <div className="flex flex-wrap gap-2">
              {selectedType && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Type: {selectedType}
                  <button onClick={() => setSelectedType('')} className="ml-1">
                    <X size={14} />
                  </button>
                </Badge>
              )}

              {selectedStatus && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('')} className="ml-1">
                    <X size={14} />
                  </button>
                </Badge>
              )}

              {dateRange.from && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Date Range
                  <button onClick={() => setDateRange({ from: undefined, to: undefined })} className="ml-1">
                    <X size={14} />
                  </button>
                </Badge>
              )}

              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1">
                    <X size={14} />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (fetchLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Interactive Assignments"
        subtitle="Create and manage interactive assignments for students"
        icon={<Book className="text-primary-500" />}
        action={
          isAdminOrTeacher ? (
            <Button className="text-sm" onClick={handleCreateAssignment}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          ) : null
        }
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderSearchFilters()}

      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="There are no interactive assignments matching your criteria."
          icon={<Book className="w-12 h-12 text-gray-400" />}
          action={
            isAdminOrTeacher ? (
              <Button onClick={handleCreateAssignment}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredAssignments.map((assignment) => (
            <InteractiveAssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={isAdminOrTeacher ? handleEditAssignment : undefined}
              onDelete={isAdminOrTeacher ? (assignment) => {
                setSelectedAssignment(assignment);
                setIsDeleteDialogOpen(true);
              } : undefined}
              onView={handleViewAssignment}
              onShare={isAdminOrTeacher ? handleShareAssignment : undefined}
              isStudent={user?.role === 'STUDENT'}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment and all associated submissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Share this link with students to complete the assignment:</p>
            <div className="flex items-center space-x-2">
              <Input value={shareableLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


