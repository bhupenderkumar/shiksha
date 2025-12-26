import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { classService } from '@/services/classService';
import { idCardService } from '@/services/idCardService';
import { ParentSubmittedFeedbackFormData, ClassOption } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Send, User, Phone, Mail, Calendar } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';

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

const ParentFeedbackSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ParentSubmittedFeedbackFormData>({
    class_id: '',
    student_name: '',
    parent_name: '',
    parent_relation: 'Father',
    parent_email: '',
    parent_phone: '',
    month: getCurrentMonth(),
    progress_feedback: '',
    improvement_areas: '',
    home_activities: '',
    questions_concerns: ''
  });

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

    fetchClasses();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await parentSubmittedFeedbackService.submitFeedback(formData);
      toast.success('Feedback submitted successfully');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // If feedback was submitted successfully, show a success message
  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Feedback Submitted Successfully</CardTitle>
            <CardDescription className="text-center">
              Thank you for sharing your feedback about your child's progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Alert variant="success" className="mb-6 w-full">
              <p className="text-center">
                Your feedback has been received and will be reviewed by our teachers. This helps us better understand your child's needs and improve our teaching methods.
              </p>
            </Alert>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/parent-feedback-search')}
              >
                View Teacher Feedback
              </Button>
              <Button
                onClick={() => {
                  setFormData({
                    class_id: '',
                    student_name: '',
                    parent_name: '',
                    parent_relation: 'Father',
                    parent_email: '',
                    parent_phone: '',
                    month: getCurrentMonth(),
                    progress_feedback: '',
                    improvement_areas: '',
                    home_activities: '',
                    questions_concerns: ''
                  });
                  setSubmitted(false);
                }}
              >
                Submit Another Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/parent-feedback-search')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feedback Search
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{SCHOOL_INFO?.name || 'School'}</CardTitle>
          <CardDescription className="text-center">
            Parent Feedback Submission Form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class_id">Class</Label>
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
                  </div>

                  <div>
                    <Label htmlFor="month">Month</Label>
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="student_name">Student Name</Label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_name">Parent/Guardian Name</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parent_phone"
                        name="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="parent_email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parent_email"
                        name="parent_email"
                        type="email"
                        value={formData.parent_email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="progress_feedback">
                    How is your child progressing at school? What improvements have you noticed?
                  </Label>
                  <Textarea
                    id="progress_feedback"
                    name="progress_feedback"
                    value={formData.progress_feedback}
                    onChange={handleInputChange}
                    placeholder="Share your observations about your child's progress..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="improvement_areas">
                    Are there any areas where you feel your child needs more support?
                  </Label>
                  <Textarea
                    id="improvement_areas"
                    name="improvement_areas"
                    value={formData.improvement_areas}
                    onChange={handleInputChange}
                    placeholder="Share any concerns or areas for improvement..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="home_activities">
                    What activities are you doing at home to support your child's learning?
                  </Label>
                  <Textarea
                    id="home_activities"
                    name="home_activities"
                    value={formData.home_activities}
                    onChange={handleInputChange}
                    placeholder="Describe any learning activities you do at home..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="questions_concerns">
                    Do you have any questions or concerns you'd like to discuss?
                  </Label>
                  <Textarea
                    id="questions_concerns"
                    name="questions_concerns"
                    value={formData.questions_concerns}
                    onChange={handleInputChange}
                    placeholder="Share any questions or concerns..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
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
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeedbackSubmission;
