import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { ParentSubmittedFeedback, ParentSubmittedFeedbackFormData } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  User,
  Calendar,
  School
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UpdateParentFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<ParentSubmittedFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ParentSubmittedFeedbackFormData>({
    class_id: '',
    student_name: '',
    parent_name: '',
    month: '',
    feedback: ''
  });
  const [status, setStatus] = useState<'PENDING' | 'REVIEWED' | 'RESPONDED'>('PENDING');

  // Load feedback data on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await parentSubmittedFeedbackService.getFeedbackById(id);
        
        if (data) {
          setFeedback(data);
          setFormData({
            class_id: data.class_id,
            student_name: data.student_name,
            parent_name: data.parent_name,
            month: data.month,
            feedback: data.feedback
          });
          setStatus(data.status as 'PENDING' | 'REVIEWED' | 'RESPONDED');
        }
      } catch (error) {
        console.error('Error fetching parent submitted feedback:', error);
        toast.error('Failed to load feedback details');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value as 'PENDING' | 'REVIEWED' | 'RESPONDED');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    try {
      setSaving(true);
      
      // Update feedback status
      await parentSubmittedFeedbackService.updateFeedbackStatus(id, status);
      
      toast.success('Feedback status updated successfully');
      navigate('/view-all-parent-feedback');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/view-all-parent-feedback')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Feedback
      </Button>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !feedback ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Feedback not found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Update Parent Feedback</CardTitle>
              <CardDescription>
                Review and update the status of feedback submitted by {feedback.parent_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Information - Read-only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_name">Student Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student_name"
                      name="student_name"
                      value={formData.student_name}
                      className="pl-8 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="class">Class</Label>
                  <div className="relative">
                    <School className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="class"
                      value={`${feedback.className || ''} ${feedback.classSection || ''}`}
                      className="pl-8 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_name">Parent Name</Label>
                  <Input
                    id="parent_name"
                    name="parent_name"
                    value={formData.parent_name}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div>
                  <Label htmlFor="month">Month</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="month"
                      name="month"
                      value={formData.month}
                      className="pl-8 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="feedback">Parent's Feedback</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  className="bg-gray-50"
                  rows={5}
                  readOnly
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="RESPONDED">Responded</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {status === 'PENDING' && 'Feedback has not been reviewed yet'}
                  {status === 'REVIEWED' && 'Feedback has been reviewed but not responded to'}
                  {status === 'RESPONDED' && 'Feedback has been reviewed and responded to'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/view-all-parent-feedback')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default UpdateParentFeedback;
