import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { parentFeedbackService } from '@/services/parentFeedbackService';
import { classService } from '@/services/classService';
import { idCardService } from '@/services/idCardService';
import { ParentFeedback, ParentFeedbackFormData, ClassOption } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Trash, Image, Search, User, Calendar, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ParentFeedbackForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<ParentFeedbackFormData>({
    class_id: '',
    student_name: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    good_things: '',
    need_to_improve: '',
    best_can_do: '',
    attendance_percentage: 0,
    student_photo_url: ''
  });

  // UI state
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [students, setStudents] = useState<{id: string, name: string, photo_url: string}[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<{id: string, name: string, photo_url: string}[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const studentInputRef = useRef<HTMLInputElement>(null);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const classData = await classService.getAllClasses();
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Load feedback data if in edit mode
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const feedback = await parentFeedbackService.getFeedbackById(id);
        if (feedback) {
          setFormData({
            class_id: feedback.class_id,
            student_name: feedback.student_name,
            month: feedback.month,
            good_things: feedback.good_things,
            need_to_improve: feedback.need_to_improve,
            best_can_do: feedback.best_can_do,
            attendance_percentage: feedback.attendance_percentage,
            student_photo_url: feedback.student_photo_url
          });
          setStudentPhoto(feedback.student_photo_url || null);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = async (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // If class is changed, fetch students for that class
    if (name === 'class_id' && value) {
      try {
        setLoading(true);
        const studentsData = await idCardService.getStudentsByClass(value);
        setStudents(studentsData.map(student => ({
          id: student.id,
          name: student.student_name,
          photo_url: student.student_photo_url
        })));
        setFilteredStudents(studentsData.map(student => ({
          id: student.id,
          name: student.student_name,
          photo_url: student.student_photo_url
        })));

        // Reset student name if class changes
        if (formData.class_id !== value) {
          setFormData(prev => ({
            ...prev,
            student_name: '',
            student_photo_url: ''
          }));
          setStudentPhoto(null);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students for this class');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle attendance percentage change
  const handleAttendanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, attendance_percentage: isNaN(value) ? 0 : Math.min(100, Math.max(0, value)) }));
  };

  // Handle student search
  const handleStudentSearch = (value: string) => {
    setStudentSearchTerm(value);
    setFormData(prev => ({ ...prev, student_name: value }));

    if (value.trim() === '') {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);

    // Open the popover if we have results and the input has content
    if (filtered.length > 0 && value.trim() !== '') {
      setStudentPopoverOpen(true);
    } else {
      setStudentPopoverOpen(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (student: {id: string, name: string, photo_url: string}) => {
    setFormData(prev => ({
      ...prev,
      student_name: student.name,
      student_photo_url: student.photo_url || ''
    }));
    setStudentPhoto(student.photo_url);
    setStudentPopoverOpen(false);
    setStudentSearchTerm('');

    // Focus on the next field
    if (studentInputRef.current) {
      studentInputRef.current.blur();
    }

    toast.success('Student selected and photo loaded');
  };

  // Fetch student photo from ID card
  const fetchStudentPhoto = async () => {
    if (!formData.class_id || !formData.student_name) {
      toast.error('Please select a class and enter student name first');
      return;
    }

    try {
      setLoading(true);
      const photoUrl = await parentFeedbackService.getStudentPhotoFromIDCard(formData.student_name, formData.class_id);

      if (photoUrl) {
        setStudentPhoto(photoUrl);
        setFormData(prev => ({ ...prev, student_photo_url: photoUrl }));
        toast.success('Student photo found and loaded');
      } else {
        toast.error('No photo found for this student in the ID card system');
      }
    } catch (error) {
      console.error('Error fetching student photo:', error);
      toast.error('Failed to fetch student photo');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isEditMode && id) {
        await parentFeedbackService.updateFeedback(id, formData);
        toast.success('Feedback updated successfully');
      } else {
        await parentFeedbackService.createFeedback(formData);
        toast.success('Feedback created successfully');
      }

      navigate('/parent-feedback-list');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/parent-feedback-list')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Parent Feedback' : 'Create Parent Feedback'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update feedback information for the student'
              : 'Create new feedback for a student that parents can view'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.month}
                      onValueChange={(value) => handleSelectChange('month', value)}
                      required
                    >
                      <SelectTrigger id="month" className="pl-8">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Current month: {new Date().toLocaleString('default', { month: 'long' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <Label htmlFor="student_name">Student Name</Label>
                  <div className="relative">
                    <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="flex">
                          <div className="relative flex-grow">
                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              ref={studentInputRef}
                              id="student_name"
                              name="student_name"
                              value={formData.student_name}
                              onChange={(e) => handleStudentSearch(e.target.value)}
                              placeholder="Start typing student name..."
                              className="pl-8"
                              required
                              disabled={!formData.class_id || loading}
                            />
                          </div>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5} style={{ width: '300px' }}>
                        <Command>
                          <CommandInput placeholder="Search students..." value={studentSearchTerm} onValueChange={handleStudentSearch} />
                          <CommandList>
                            <CommandEmpty>No students found</CommandEmpty>
                            <CommandGroup>
                              {filteredStudents.slice(0, 10).map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={student.name}
                                  onSelect={() => handleStudentSelect(student)}
                                  className="flex items-center gap-2"
                                >
                                  {student.photo_url && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                      <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <span>{student.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formData.class_id ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {students.length > 0
                          ? `${students.length} students available. Start typing to search.`
                          : 'No students found for this class.'}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Please select a class first</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="attendance_percentage">Attendance (%)</Label>
                  <Input
                    id="attendance_percentage"
                    name="attendance_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendance_percentage}
                    onChange={handleAttendanceChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <Label>Student Photo</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {studentPhoto ? (
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 border rounded overflow-hidden">
                          <img
                            src={studentPhoto}
                            alt={formData.student_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formData.student_name}</p>
                          <p className="text-xs text-muted-foreground">Photo loaded from ID card</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={fetchStudentPhoto}
                          disabled={!formData.class_id || !formData.student_name}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Fetch Photo Manually
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {formData.student_name
                            ? 'No photo loaded yet. Try fetching manually.'
                            : 'Select a student to load their photo automatically.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="good_things">Good Things</Label>
                <Textarea
                  id="good_things"
                  name="good_things"
                  value={formData.good_things}
                  onChange={handleInputChange}
                  placeholder="Enter positive feedback about the student"
                  rows={3}
                  required
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="need_to_improve">Need to Improve</Label>
                <Textarea
                  id="need_to_improve"
                  name="need_to_improve"
                  value={formData.need_to_improve}
                  onChange={handleInputChange}
                  placeholder="Enter areas where the student needs improvement"
                  rows={3}
                  required
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="best_can_do">Best Can Do</Label>
                <Textarea
                  id="best_can_do"
                  name="best_can_do"
                  value={formData.best_can_do}
                  onChange={handleInputChange}
                  placeholder="Enter recommendations or potential for the student"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/parent-feedback-list')}
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
                      {isEditMode ? 'Update Feedback' : 'Create Feedback'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeedbackForm;
