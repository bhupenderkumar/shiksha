import React, { useState } from 'react';
import AdminFeedbackForm from '@/components/AdminFeedbackForm';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { ParentSubmittedFeedback } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, Loader2, MessageCircle, Calendar, User, School } from 'lucide-react';
import { format } from 'date-fns';

const AdminFeedbackPage: React.FC = () => {
  const [recentFeedback, setRecentFeedback] = useState<ParentSubmittedFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent admin feedback
  const loadRecentFeedback = async () => {
    try {
      setLoading(true);
      const feedback = await parentSubmittedFeedbackService.getRecentAdminFeedback();
      setRecentFeedback(feedback);
    } catch (error) {
      console.error('Error loading recent feedback:', error);
      toast.error('Failed to load recent feedback');
    } finally {
      setLoading(false);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    // Reload recent feedback
    loadRecentFeedback();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Feedback Form */}
        <div className="lg:col-span-2">
          <AdminFeedbackForm onSuccess={handleFormSuccess} />
        </div>

        {/* Recent Feedback */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>
                  Recently submitted admin feedback
                </CardDescription>
              </div>
              <Button onClick={loadRecentFeedback} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentFeedback.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent feedback</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={loadRecentFeedback}
                  >
                    Load Recent Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <Card key={feedback.id} className="overflow-hidden">
                      <div className="bg-primary/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{feedback.student_name}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{feedback.month}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <School className="h-3 w-3 mr-1" />
                          <span>{feedback.className} {feedback.classSection}</span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{feedback.admin_feedback}</p>
                        {feedback.admin_feedback_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted on: {format(new Date(feedback.admin_feedback_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
