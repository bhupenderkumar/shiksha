import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileUploader } from '@/components/ui/file-uploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/ui/page-header';
import { PageAnimation } from '@/components/ui/page-animation';
import { yearEndFeedbackService } from '@/services/yearEndFeedbackService';
import { studentService } from '@/services/student.service';
import { classService } from '@/services/classService';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import PublicLayout from '@/components/PublicLayout';

interface Student {
  id: string;
  name: string;
  Class: {
    id: string;
    name: string;
  };
}

interface FeedbackForm {
  student_id: string;
  class_id: string;
  parent_feedback: string;
  student_feedback: string;
  areas_of_improvement: string;
  strengths: string;
  next_class_recommendation: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  father_contact: string;
  mother_contact: string;
  father_email: string;
  mother_email: string;
  address: string;
  emergency_contact: string;
  medical_conditions: string;
  extracurricular_activities: string;
  achievements: string;
}

// Form validation schema
const formSchema = z.object({
  class_id: z.string({
    required_error: "Please select a class",
  }),
  student_id: z.string({
    required_error: "Please select a student",
  }),
  next_class_recommendation: z.string({
    required_error: "Please select next class recommendation",
  }),
  father_name: z.string().min(1, "Father's name is required"),
  mother_name: z.string().min(1, "Mother's name is required"),
  father_occupation: z.string().min(1, "Father's occupation is required"),
  mother_occupation: z.string().min(1, "Mother's occupation is required"),
  father_contact: z.string()
    .min(10, "Contact number must be 10 digits")
    .max(10, "Contact number must be 10 digits")
    .regex(/^[0-9]+$/, "Must be a valid phone number"),
  mother_contact: z.string()
    .min(10, "Contact number must be 10 digits")
    .max(10, "Contact number must be 10 digits")
    .regex(/^[0-9]+$/, "Must be a valid phone number"),
  father_email: z.string().email("Must be a valid email address"),
  mother_email: z.string().email("Must be a valid email address"),
  address: z.string().min(1, "Address is required"),
  emergency_contact: z.string()
    .min(10, "Contact number must be 10 digits")
    .max(10, "Contact number must be 10 digits")
    .regex(/^[0-9]+$/, "Must be a valid phone number"),
  medical_conditions: z.string().optional(),
  strengths: z.string().min(1, "Please enter student's strengths"),
  areas_of_improvement: z.string().min(1, "Please enter areas of improvement"),
  parent_feedback: z.string().min(1, "Parent's feedback is required"),
  student_feedback: z.string().min(1, "Student's feedback is required"),
  extracurricular_activities: z.string().optional(),
  achievements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const YearEndFeedback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; }[]>([]);
  const [nextClassOptions, setNextClassOptions] = useState<{ id: string; name: string; }[]>([]);
  const [photos, setPhotos] = useState({
    student: null as File | null,
    father: null as File | null,
    mother: null as File | null,
  });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class_id: "",
      student_id: "",
      next_class_recommendation: "",
      father_name: "",
      mother_name: "",
      father_occupation: "",
      mother_occupation: "",
      father_contact: "",
      mother_contact: "",
      father_email: "",
      mother_email: "",
      address: "",
      emergency_contact: "",
      medical_conditions: "",
      strengths: "",
      areas_of_improvement: "",
      parent_feedback: "",
      student_feedback: "",
      extracurricular_activities: "",
      achievements: "",
    },
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      // Sort classes in a logical order: Pre Nursery -> Nursery -> KG -> Class I -> Class II etc.
      const sortedClasses = data.sort((a, b) => {
        const classOrder = {
          'Pre Nursery': 1,
          'Nursery': 2,
          'KG': 3
        };
        
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Handle special class names
        if (classOrder[a.name] && classOrder[b.name]) {
          return classOrder[a.name] - classOrder[b.name];
        } else if (classOrder[a.name]) {
          return -1;
        } else if (classOrder[b.name]) {
          return 1;
        }
        
        // Handle numbered classes (Class I, Class II, etc.)
        const aMatch = aName.match(/class\s+(\d+|[ivx]+)/i);
        const bMatch = bName.match(/class\s+(\d+|[ivx]+)/i);
        
        if (aMatch && bMatch) {
          const aNum = aMatch[1];
          const bNum = bMatch[1];
          
          // Convert Roman numerals if present
          const toNumber = (str: string) => {
            const roman = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10 };
            return roman[str.toLowerCase()] || parseInt(str);
          };
          
          return toNumber(aNum) - toNumber(bNum);
        }
        
        // Fallback to alphabetical sorting
        return aName.localeCompare(bName);
      });
      
      setClasses(sortedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    }
  };

  const handleClassChange = async (classId: string) => {
    console.log('Selected class ID:', classId); // Debug log
    form.setValue('class_id', classId);
    form.setValue('student_id', '');
    
    try {
      const data = await studentService.getStudentsByClass(classId);
      console.log('Fetched students:', data); // Debug log
      setStudents(data || []);

      // Find the selected class to get its name for next class options
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass) {
        await fetchNextClassOptions(selectedClass.name);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleStudentChange = async (studentId: string) => {
    form.setValue('student_id', studentId);
  };

  const fetchNextClassOptions = async (currentClassName: string) => {
    try {
      const allClasses = await classService.getAllClasses();
      let nextClasses = [];
      
      // Normalize the current class name
      const normalizedClassName = currentClassName.toLowerCase().trim();
      
      // Define the class progression map
      const classMap: { [key: string]: string } = {
        'pre nursery': 'Nursery',
        'nursery': 'KG',
        'kg': 'Class I',
        'class i': 'Class II',
        'class ii': 'Class III',
        'class iii': 'Class IV',
        'class iv': 'Class V',
        'class v': 'Class VI',
        'class vi': 'Class VII',
        'class vii': 'Class VIII',
        'class viii': 'Class IX',
        'class ix': 'Class X',
        'class x': 'Class XI',
        'class xi': 'Class XII'
      };

      // Try to find the next class from the map
      const nextClassName = classMap[normalizedClassName];
      
      if (nextClassName) {
        // Find the class with exact name match (case-insensitive)
        nextClasses = allClasses.filter(c => 
          c.name.toLowerCase() === nextClassName.toLowerCase()
        );
      }

      // If no next class found and it's a numbered class, try numeric progression
      if (nextClasses.length === 0) {
        // Try to extract class number (supports both roman and regular numbers)
        const classMatch = normalizedClassName.match(/class\s+(\d+|[ivx]+)/i);
        if (classMatch) {
          const currentNumber = classMatch[1];
          // Convert roman numeral to number if needed
          const romanToNumber: { [key: string]: number } = {
            'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
            'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10,
            'xi': 11, 'xii': 12
          };
          
          const currentNum = romanToNumber[currentNumber.toLowerCase()] || parseInt(currentNumber);
          const nextNum = currentNum + 1;
          
          // Try to find the next class with either roman or regular number
          nextClasses = allClasses.filter(c => {
            const match = c.name.toLowerCase().match(/class\s+(\d+|[ivx]+)/i);
            if (match) {
              const num = romanToNumber[match[1].toLowerCase()] || parseInt(match[1]);
              return num === nextNum;
            }
            return false;
          });
        }
      }

      console.log('Current class:', currentClassName);
      console.log('Next classes found:', nextClasses);
      setNextClassOptions(nextClasses);
    } catch (error) {
      console.error('Error fetching next class options:', error);
      toast.error('Failed to fetch next class options');
    }
  };

  const handlePhotoUpload = async (files: File[], type: 'student' | 'father' | 'mother') => {
    if (files.length > 0) {
      setPhotos(prev => ({ ...prev, [type]: files[0] }));
    }
  };

  const uploadPhoto = async (file: File, type: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await yearEndFeedbackService.uploadPhoto(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = yearEndFeedbackService.getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Get current academic year
      const { id: academicYearId } = await yearEndFeedbackService.getActiveAcademicYear();
      
      // Handle photo uploads first
      const [studentPhotoUrl, fatherPhotoUrl, motherPhotoUrl] = await Promise.all([
        photos.student ? uploadPhoto(photos.student, 'student') : null,
        photos.father ? uploadPhoto(photos.father, 'father') : null,
        photos.mother ? uploadPhoto(photos.mother, 'mother') : null,
      ]);
      
      // Submit feedback with form data and photo URLs
      const feedbackData = {
        student_id: data.student_id,
        academic_year_id: academicYearId,
        parent_feedback: data.parent_feedback,
        student_feedback: data.student_feedback,
        areas_of_improvement: data.areas_of_improvement,
        strengths: data.strengths,
        next_class_recommendation: data.next_class_recommendation,
        student_photo_url: studentPhotoUrl || '',
        father_photo_url: fatherPhotoUrl || '',
        mother_photo_url: motherPhotoUrl || '',
        father_name: data.father_name,
        mother_name: data.mother_name,
        father_occupation: data.father_occupation,
        mother_occupation: data.mother_occupation,
        father_contact: data.father_contact,
        mother_contact: data.mother_contact,
        father_email: data.father_email,
        mother_email: data.mother_email,
        address: data.address,
        emergency_contact: data.emergency_contact,
        medical_conditions: data.medical_conditions || '',
        extracurricular_activities: data.extracurricular_activities || '',
        achievements: data.achievements || '',
        attendance_record: {},
        feedback_status: 'PENDING',
      };

      await yearEndFeedbackService.submitFeedback(feedbackData);

      toast.success('Feedback submitted successfully');
      navigate('/view-year-end-feedback');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <PageAnimation>
        <div className="container mx-auto px-4 py-8">
          <PageHeader 
            title="Year-End Feedback"
            description="Submit year-end feedback for student evaluation and progression"
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="p-6 space-y-8">
                {/* Class and Student Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Selection</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleClassChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map(classItem => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Selection</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!form.getValues("class_id")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue 
                                placeholder={form.getValues("class_id") 
                                  ? "Select a student" 
                                  : "Please select a class first"
                                } 
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="next_class_recommendation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Class Recommendation</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!form.getValues("class_id")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select next class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nextClassOptions.map(classOption => (
                              <SelectItem key={classOption.id} value={classOption.id}>
                                {classOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Father's Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Father's Details</h4>
                      <FormField
                        control={form.control}
                        name="father_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter father's name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="father_occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter father's occupation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="father_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter 10-digit mobile number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="father_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter father's email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Mother's Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Mother's Details</h4>
                      <FormField
                        control={form.control}
                        name="mother_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter mother's name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mother_occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Occupation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter mother's occupation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mother_contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter 10-digit mobile number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mother_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter mother's email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter complete address" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emergency_contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter emergency contact number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medical Information</h3>
                  <FormField
                    control={form.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter any medical conditions or allergies" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="strengths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strengths</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter student's strengths" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="areas_of_improvement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Improvement</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter areas needing improvement" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Feedback</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="parent_feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent's Feedback</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter parent's feedback" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="student_feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student's Feedback</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter student's feedback" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Extracurricular Activities and Achievements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="extracurricular_activities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extracurricular Activities</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter extracurricular activities" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Achievements</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Enter student's achievements" rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Photos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Student Photo</Label>
                      <FileUploader
                        accept="image/*"
                        onChange={(file) => setPhotos(prev => ({ ...prev, student: file }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Father's Photo</Label>
                      <FileUploader
                        accept="image/*"
                        onChange={(file) => setPhotos(prev => ({ ...prev, father: file }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mother's Photo</Label>
                      <FileUploader
                        accept="image/*"
                        onChange={(file) => setPhotos(prev => ({ ...prev, mother: file }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </Button>
                </div>
              </Card>
            </form>
          </Form>
        </div>
      </PageAnimation>
    </PublicLayout>
  );
};

export default YearEndFeedback;
