import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { ParentSubmittedFeedback } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Clock, 
  Eye, 
  CheckCircle, 
  User, 
  Calendar, 
  School, 
  Phone, 
  Mail,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const ParentSubmittedFeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<ParentSubmittedFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load feedback data on component mount
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await parentSubmittedFeedbackService.getFeedbackById(id);
        setFeedback(data);
      } catch (error) {
        console.error('Error fetching parent submitted feedback:', error);
        toast.error('Failed to load feedback details');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async (status: 'PENDING' | 'REVIEWED' | 'RESPONDED') => {
    if (!id) return;

    try {
      setUpdating(true);
      const updatedFeedback = await parentSubmittedFeedbackService.updateFeedbackStatus(id, status);
      setFeedback(updatedFeedback);
      toast.success(`Feedback status updated to ${status}`);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    } finally {
      setUpdating(false);
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
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/parent-submitted-feedback-list')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to List
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
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Parent Feedback Details</CardTitle>
                <CardDescription>
                  Feedback submitted by {feedback.parent_name} for {feedback.student_name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(feedback.status)}
                
                {feedback.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('REVIEWED')}
                    disabled={updating}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1" />
                    )}
                    Mark as Reviewed
                  </Button>
                )}
                
                {feedback.status === 'REVIEWED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('RESPONDED')}
                    disabled={updating}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Mark as Responded
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Name:</span>
                        <p>{feedback.student_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Class:</span>
                        <p>{feedback.className} {feedback.classSection}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Month:</span>
                        <p>{feedback.month}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Parent Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Name:</span>
                        <p>{feedback.parent_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Relation:</span>
                        <p>{feedback.parent_relation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{feedback.parent_phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{feedback.parent_email || 'Not provided'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Feedback Content</h3>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Progress Feedback
                    </h4>
                    <p className="text-gray-700">{feedback.progress_feedback}</p>
                  </div>

                  {feedback.improvement_areas && (
                    <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
                      <h4 className="font-medium text-amber-800 mb-2">Areas Needing Improvement</h4>
                      <p className="text-gray-700">{feedback.improvement_areas}</p>
                    </div>
                  )}

                  {feedback.home_activities && (
                    <div className="bg-green-50 border border-green-100 rounded-md p-4">
                      <h4 className="font-medium text-green-800 mb-2">Home Learning Activities</h4>
                      <p className="text-gray-700">{feedback.home_activities}</p>
                    </div>
                  )}

                  {feedback.questions_concerns && (
                    <div className="bg-purple-50 border border-purple-100 rounded-md p-4">
                      <h4 className="font-medium text-purple-800 mb-2">Questions & Concerns</h4>
                      <p className="text-gray-700">{feedback.questions_concerns}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Submitted on {format(new Date(feedback.created_at), 'MMMM d, yyyy')} at {format(new Date(feedback.created_at), 'h:mm a')}
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/parent-submitted-feedback-list')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParentSubmittedFeedbackDetail;
