import React, { useState, useEffect } from 'react';
import { classService } from '@/services/classService';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { ClassOption, MONTHS } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Search, User, School, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AdminFeedbackFormProps {
  onSuccess?: () => void;
}

const AdminFeedbackForm: React.FC<AdminFeedbackFormProps> = ({ onSuccess }) => {
  // Form state
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    class_id: '',
    student_name: '',
    month: getCurrentMonth(),
    admin_feedback: ''
  });

  // Get current month
  function getCurrentMonth() {
    const date = new Date();
    const monthIndex = date.getMonth();
    return MONTHS[monthIndex];
  }

  // Load classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const classData = await classService.getAllClasses();
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Load students when class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!formData.class_id) {
        setStudents([]);
        return;
      }

      try {
        setStudentsLoading(true);
        // This would ideally be a service call to get students by class ID
        // For now, we'll simulate it with a delay
        const { data, error } = await parentSubmittedFeedbackService.getStudentsByClassId(formData.class_id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [formData.class_id]);

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

    // Validate form
    if (!formData.class_id || !formData.student_name || !formData.month || !formData.admin_feedback) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Submit admin feedback
      const result = await parentSubmittedFeedbackService.createAdminFeedback({
        class_id: formData.class_id,
        student_name: formData.student_name,
        month: formData.month,
        admin_feedback: formData.admin_feedback
      });

      if (result) {
        toast.success('Feedback submitted successfully');
        
        // Reset form
        setFormData({
          class_id: formData.class_id, // Keep the class selected
          student_name: '', // Reset student
          month: formData.month, // Keep the month selected
          admin_feedback: '' // Reset feedback
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting admin feedback:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Admin Feedback</CardTitle>
        <CardDescription>
          Provide feedback for a student that will be visible to parents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Class Selection */}
            <div>
              <Label htmlFor="class_id">Class</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) => handleSelectChange('class_id', value)}
                disabled={classesLoading}
              >
                <SelectTrigger id="class_id">
                  <SelectValue placeholder={classesLoading ? 'Loading classes...' : 'Select a class'} />
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

            {/* Student Selection */}
            <div>
              <Label htmlFor="student_name">Student</Label>
              <Select
                value={formData.student_name}
                onValueChange={(value) => handleSelectChange('student_name', value)}
                disabled={!formData.class_id || studentsLoading}
              >
                <SelectTrigger id="student_name">
                  <SelectValue placeholder={
                    !formData.class_id 
                      ? 'Select a class first' 
                      : studentsLoading 
                        ? 'Loading students...' 
                        : 'Select a student'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student} value={student}>
                      {student}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selection */}
            <div>
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleSelectChange('month', value)}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Admin Feedback */}
            <div>
              <Label htmlFor="admin_feedback">Your Feedback</Label>
              <Textarea
                id="admin_feedback"
                name="admin_feedback"
                value={formData.admin_feedback}
                onChange={handleInputChange}
                placeholder="Enter your feedback for the student..."
                rows={5}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                This feedback will be visible to the parent
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminFeedbackForm;
