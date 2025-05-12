import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { ParentSubmittedFeedback } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ParentSubmittedFeedbackList: React.FC = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<ParentSubmittedFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<ParentSubmittedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load feedback data on component mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await parentSubmittedFeedbackService.getAllFeedback();
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      } catch (error) {
        console.error('Error fetching parent submitted feedback:', error);
        toast.error('Failed to load parent submitted feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Filter feedbacks when search term or status filter changes
  useEffect(() => {
    let filtered = feedbacks;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        feedback =>
          feedback.student_name.toLowerCase().includes(term) ||
          feedback.parent_name.toLowerCase().includes(term) ||
          (feedback.className && feedback.className.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === statusFilter);
    }

    setFilteredFeedbacks(filtered);
  }, [searchTerm, statusFilter, feedbacks]);

  // Handle status update
  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'REVIEWED' | 'RESPONDED') => {
    try {
      await parentSubmittedFeedbackService.updateFeedbackStatus(id, status);
      
      // Update local state
      setFeedbacks(prev => 
        prev.map(feedback => 
          feedback.id === id ? { ...feedback, status } : feedback
        )
      );
      
      toast.success(`Feedback status updated to ${status}`);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'REVIEWED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
        );
      case 'RESPONDED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Responded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Parent Submitted Feedback</CardTitle>
            <CardDescription>
              View and manage feedback submitted by parents
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by student or parent name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status Filter</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="RESPONDED">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Feedback Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No feedback entries found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">{feedback.student_name}</TableCell>
                      <TableCell>{feedback.className} {feedback.classSection}</TableCell>
                      <TableCell>
                        {feedback.parent_name}
                        <div className="text-xs text-muted-foreground">
                          {feedback.parent_relation}
                        </div>
                      </TableCell>
                      <TableCell>{feedback.month}</TableCell>
                      <TableCell>
                        {feedback.created_at
                          ? format(new Date(feedback.created_at), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{renderStatusBadge(feedback.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/parent-submitted-feedback/${feedback.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {feedback.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(feedback.id, 'REVIEWED')}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}

                          {feedback.status === 'REVIEWED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(feedback.id, 'RESPONDED')}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
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

export default ParentSubmittedFeedbackList;
