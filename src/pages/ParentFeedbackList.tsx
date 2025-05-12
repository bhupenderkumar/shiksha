import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentFeedbackService } from '@/services/parentFeedbackService';
import { ParentFeedback } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash,
  FileDown,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

const ParentFeedbackList: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [feedbacks, setFeedbacks] = useState<ParentFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<ParentFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState<{id: string, name: string, section: string}[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all feedback entries
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await parentFeedbackService.getAllFeedback();
      setFeedbacks(data);
      setFilteredFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique classes from feedbacks
  useEffect(() => {
    const uniqueClasses = feedbacks.reduce((acc, feedback) => {
      if (feedback.className && feedback.classSection && feedback.class_id) {
        const exists = acc.some(c => c.id === feedback.class_id);
        if (!exists) {
          acc.push({
            id: feedback.class_id,
            name: feedback.className,
            section: feedback.classSection
          });
        }
      }
      return acc;
    }, [] as {id: string, name: string, section: string}[]);

    setClasses(uniqueClasses);
  }, [feedbacks]);

  // Initial data fetch
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...feedbacks];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.student_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply month filter
    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter(feedback => feedback.month === selectedMonth);
    }

    // Apply class filter
    if (selectedClass && selectedClass !== 'all') {
      filtered = filtered.filter(feedback => feedback.class_id === selectedClass);
    }

    setFilteredFeedbacks(filtered);
  }, [searchTerm, selectedMonth, selectedClass, feedbacks]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await parentFeedbackService.deleteFeedback(deleteId);
      toast.success('Feedback deleted successfully');
      fetchFeedbacks();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle certificate generation
  const handleGenerateCertificate = async (feedbackId: string) => {
    try {
      toast.loading('Generating certificate...', { id: 'generate-certificate' });
      const certificate = await parentFeedbackService.generateCertificate(feedbackId);
      toast.success('Certificate generated successfully', { id: 'generate-certificate' });
      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate', { id: 'generate-certificate' });
      return null;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMonth('all');
    setSelectedClass('all');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Parent Feedback Management</CardTitle>
            <CardDescription>
              Create, edit, and manage feedback for parents to view
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/parent-feedback-form')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Feedback
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search by Student Name</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="month-filter">Filter by Month</Label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger id="month-filter">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger id="class-filter">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Feedback Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No feedback found</h3>
              <p className="text-muted-foreground">
                {feedbacks.length === 0
                  ? 'No feedback has been created yet. Create your first feedback entry.'
                  : 'No feedback matches your filters. Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">{feedback.student_name}</TableCell>
                      <TableCell>{feedback.className} {feedback.classSection}</TableCell>
                      <TableCell>{feedback.month}</TableCell>
                      <TableCell>{feedback.attendance_percentage}%</TableCell>
                      <TableCell>
                        {feedback.created_at
                          ? format(new Date(feedback.created_at), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/parent-feedback-form/${feedback.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const certificate = await handleGenerateCertificate(feedback.id);
                              if (certificate) {
                                navigate(`/parent-feedback-search?classId=${feedback.class_id}&studentName=${feedback.student_name}`);
                              }
                            }}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteId(feedback.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the feedback for {feedback.student_name}?
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={handleDelete}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeedbackList;
