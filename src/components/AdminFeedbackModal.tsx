import React, { useState } from 'react';
import { ParentSubmittedFeedback } from '@/types/parentFeedback';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X } from 'lucide-react';

interface AdminFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: ParentSubmittedFeedback | null;
  onSuccess: (updatedFeedback: ParentSubmittedFeedback) => void;
}

const AdminFeedbackModal: React.FC<AdminFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onSuccess,
}) => {
  const [adminFeedback, setAdminFeedback] = useState(feedback?.admin_feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal is opened with new feedback
  React.useEffect(() => {
    if (isOpen && feedback) {
      setAdminFeedback(feedback.admin_feedback || '');
    }
  }, [isOpen, feedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback) return;

    try {
      setIsSubmitting(true);

      // Validate input
      if (!adminFeedback.trim()) {
        toast.error('Please enter your feedback');
        return;
      }

      // Submit admin feedback
      const result = await parentSubmittedFeedbackService.addAdminFeedback(
        feedback.id,
        adminFeedback
      );

      if (result) {
        toast.success('Feedback submitted successfully');
        onSuccess(result);
        onClose();
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting admin feedback:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {!feedback ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Admin Feedback</DialogTitle>
              <DialogDescription>
                Provide feedback for {feedback.student_name}'s submission from {feedback.month}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Parent's Feedback (Read-only) */}
              <div>
                <Label htmlFor="parent-feedback" className="text-sm font-medium">
                  Parent's Feedback
                </Label>
                <Textarea
                  id="parent-feedback"
                  value={feedback.feedback}
                  className="mt-1 bg-gray-50"
                  rows={3}
                  readOnly
                />
              </div>

              {/* Parent's Progress Rating (Read-only) */}
              <div>
                <Label htmlFor="progress-feedback" className="text-sm font-medium">
                  Parent's Progress Rating
                </Label>
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {feedback.progress_feedback}
                </div>
              </div>

              {/* Admin Feedback */}
              <div>
                <Label htmlFor="admin-feedback" className="text-sm font-medium">
                  Your Feedback
                </Label>
                <Textarea
                  id="admin-feedback"
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your feedback for the student..."
                  rows={5}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This feedback will be visible to the parent and will mark the status as "Responded"
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminFeedbackModal;
