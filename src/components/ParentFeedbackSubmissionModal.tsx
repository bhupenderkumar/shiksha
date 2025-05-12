import React, { useState, useEffect } from 'react';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { classService } from '@/services/classService';
import { ParentSubmittedFeedbackFormData, ClassOption } from '@/types/parentFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Loader2, Send, User, Phone, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// List of months
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Parent relation options
const PARENT_RELATIONS = ['Father', 'Mother', 'Guardian', 'Other'];

// Get current month
const getCurrentMonth = () => {
  const date = new Date();
  return MONTHS[date.getMonth()];
};

interface ParentFeedbackSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefillData?: {
    class_id?: string;
    student_name?: string;
    className?: string;
    classSection?: string;
    month?: string;
  };
}

const ParentFeedbackSubmissionModal: React.FC<ParentFeedbackSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillData
}) => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ParentSubmittedFeedbackFormData>({
    class_id: prefillData?.class_id || '',
    student_name: prefillData?.student_name || '',
    parent_name: '',
    parent_relation: 'Father', // Default to Father
    month: prefillData?.month || getCurrentMonth(),
    feedback: '',
    progress_feedback: 'Good progress' // Default progress feedback
  });

  // Update form data when prefillData changes
  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        class_id: prefillData.class_id || prev.class_id,
        student_name: prefillData.student_name || prev.student_name,
        month: prefillData.month || prev.month
      }));

      // We're skipping the check for existing feedback due to permission issues
      // Just update the form with the prefilled data
    }
  }, [prefillData]);

  // Load classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const classList = await classService.getAllClasses();
        setClasses(classList);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // State to track if this is an update or new submission
  const [isUpdate, setIsUpdate] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Check if all required fields are filled
      if (!formData.class_id || !formData.student_name || !formData.parent_name || !formData.feedback || !formData.month) {
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('Submitting parent feedback:', formData);

      // First check if this is an update or new submission
      const existingFeedback = await parentSubmittedFeedbackService.checkExistingFeedback(
        formData.class_id,
        formData.student_name,
        formData.month
      );

      setIsUpdate(!!existingFeedback);
      console.log('Is update?', !!existingFeedback);

      // Submit feedback
      const result = await parentSubmittedFeedbackService.submitFeedback(formData);

      if (result) {
        // Show success message
        const message = existingFeedback
          ? 'Your feedback has been updated successfully!'
          : 'Thank you for your feedback!';
        toast.success(message);
        setSubmitted(true);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Handle the case when the service returns null (error occurred)
        toast.error('Unable to save feedback at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData({
      class_id: prefillData?.class_id || '',
      student_name: prefillData?.student_name || '',
      parent_name: '',
      parent_relation: 'Father', // Default to Father
      month: prefillData?.month || getCurrentMonth(),
      feedback: '',
      progress_feedback: 'Good progress' // Default progress feedback
    });
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-green-600">
                {isUpdate ? 'Feedback Updated Successfully' : 'Feedback Submitted Successfully'}
              </DialogTitle>
              <DialogDescription className="text-center">
                Thank you for sharing your feedback about your child's progress.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 my-4">
              <p className="text-center">
                {isUpdate
                  ? 'Your feedback has been updated and will be reviewed by our teachers. Thank you for helping us improve our teaching methods.'
                  : 'Your feedback has been received and will be reviewed by our teachers. This helps us better understand your child\'s needs and improve our teaching methods.'
                }
              </p>
            </div>
            <DialogFooter className="flex justify-center gap-4 sm:justify-center">
              <Button onClick={handleClose}>Close</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    class_id: prefillData?.class_id || '',
                    student_name: prefillData?.student_name || '',
                    parent_name: '',
                    parent_relation: 'Father', // Default to Father
                    month: prefillData?.month || getCurrentMonth(),
                    feedback: '',
                    progress_feedback: 'Good progress' // Default progress feedback
                  });
                  setSubmitted(false);
                }}
              >
                Submit Another Feedback
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Parent Feedback Submission</DialogTitle>
              <DialogDescription>
                Share your feedback about your child's progress
              </DialogDescription>
            </DialogHeader>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Student Information - Read-only if prefilled */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class_id">Class</Label>
                      {prefillData?.class_id ? (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {classes.find(cls => cls.id === formData.class_id)?.name} {classes.find(cls => cls.id === formData.class_id)?.section}
                        </div>
                      ) : (
                        <Select
                          value={formData.class_id}
                          onValueChange={(value) => handleSelectChange('class_id', value)}
                          required
                        >
                          <SelectTrigger id="class_id">
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} {cls.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="month">Month</Label>
                      {prefillData?.month ? (
                        <div className="p-2 border rounded-md bg-gray-50">
                          {formData.month}
                        </div>
                      ) : (
                        <Select
                          value={formData.month}
                          onValueChange={(value) => handleSelectChange('month', value)}
                          required
                        >
                          <SelectTrigger id="month">
                            <SelectValue placeholder="Select Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="student_name">Student Name</Label>
                    {prefillData?.student_name ? (
                      <div className="p-2 border rounded-md bg-gray-50">
                        {formData.student_name}
                      </div>
                    ) : (
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="student_name"
                          name="student_name"
                          value={formData.student_name}
                          onChange={handleInputChange}
                          placeholder="Enter student's full name"
                          className="pl-8"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parent_name">Your Name</Label>
                      <Input
                        id="parent_name"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="parent_relation">Relation to Student</Label>
                      <Select
                        value={formData.parent_relation}
                        onValueChange={(value) => handleSelectChange('parent_relation', value)}
                        required
                      >
                        <SelectTrigger id="parent_relation">
                          <SelectValue placeholder="Select Relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARENT_RELATIONS.map((relation) => (
                            <SelectItem key={relation} value={relation}>
                              {relation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback">
                      Your Feedback About Your Child's Progress
                    </Label>
                    <Textarea
                      id="feedback"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      placeholder="Share your thoughts about your child's progress, any concerns, or questions you may have..."
                      rows={5}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="progress_feedback">
                      How would you rate your child's progress?
                    </Label>
                    <Select
                      value={formData.progress_feedback}
                      onValueChange={(value) => handleSelectChange('progress_feedback', value)}
                      required
                    >
                      <SelectTrigger id="progress_feedback">
                        <SelectValue placeholder="Select Progress Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent progress">Excellent progress</SelectItem>
                        <SelectItem value="Good progress">Good progress</SelectItem>
                        <SelectItem value="Satisfactory progress">Satisfactory progress</SelectItem>
                        <SelectItem value="Needs improvement">Needs improvement</SelectItem>
                        <SelectItem value="Concerned about progress">Concerned about progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ParentFeedbackSubmissionModal;
