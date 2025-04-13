import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { idCardService } from '@/backend/idCardService';
import { IDCardData, ClassOption, PhotoType } from '@/types/idCard';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { IDCardGenerator } from '@/components/IDCardGenerator';
import { PhotoUploader } from '@/components/PhotoUploader';
import { SCHOOL_INFO } from '@/lib/constants';

// Form validation schema
const formSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  classId: z.string().min(1, 'Please select a class'),
  dateOfBirth: z.string().optional(),
  fatherName: z.string().min(2, 'Father name must be at least 2 characters'),
  motherName: z.string().min(2, 'Mother name must be at least 2 characters'),
  fatherMobile: z.string().min(10, 'Father mobile number must be at least 10 digits'),
  motherMobile: z.string().min(10, 'Mother mobile number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

type FormInput = z.infer<typeof formSchema>;

const IDCardForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [activeTab, setActiveTab] = useState('form');
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [fatherPhoto, setFatherPhoto] = useState<File | null>(null);
  const [motherPhoto, setMotherPhoto] = useState<File | null>(null);
  const [studentPhotoUrl, setStudentPhotoUrl] = useState<string>('');
  const [fatherPhotoUrl, setFatherPhotoUrl] = useState<string>('');
  const [motherPhotoUrl, setMotherPhotoUrl] = useState<string>('');
  const [idCardData, setIdCardData] = useState<IDCardData | null>(null);
  const [idCardId, setIdCardId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Confetti states
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const { width, height } = useWindowSize();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      classId: '',
      dateOfBirth: '',
      fatherName: '',
      motherName: '',
      fatherMobile: '',
      motherMobile: '',
      address: '',
    },
  });
  
  // Confetti effect on component mount
  useEffect(() => {
    // Show confetti for 5 seconds then fade out
    const fadeOutTimer = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        setConfettiOpacity((prevOpacity) => {
          const newOpacity = prevOpacity - 0.05;
          if (newOpacity <= 0) {
            clearInterval(fadeInterval);
            setShowConfetti(false);
            return 0;
          }
          return newOpacity;
        });
      }, 100);
      
      return () => clearInterval(fadeInterval);
    }, 5000);
    
    return () => clearTimeout(fadeOutTimer);
  }, []);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const classData = await idCardService.getClassList();
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Update selected class when classId changes
  useEffect(() => {
    const classId = form.watch('classId');
    if (classId) {
      const selectedClass = classes.find(c => c.id === classId);
      setSelectedClass(selectedClass || null);
    }
  }, [form.watch('classId'), classes]);

  const handlePhotoChange = (photoType: PhotoType, file: File | null) => {
    switch (photoType) {
      case 'student':
        setStudentPhoto(file);
        break;
      case 'father':
        setFatherPhoto(file);
        break;
      case 'mother':
        setMotherPhoto(file);
        break;
    }
  };

  const uploadPhotos = async (idCardId: string): Promise<{
    studentPhotoUrl: string;
    fatherPhotoUrl: string;
    motherPhotoUrl: string;
  }> => {
    let studentUrl = '';
    let fatherUrl = '';
    let motherUrl = '';

    try {
      // Upload student photo
      if (studentPhoto) {
        studentUrl = await idCardService.uploadPhoto(studentPhoto, 'student', idCardId);
      }

      // Upload father photo
      if (fatherPhoto) {
        fatherUrl = await idCardService.uploadPhoto(fatherPhoto, 'father', idCardId);
      }

      // Upload mother photo
      if (motherPhoto) {
        motherUrl = await idCardService.uploadPhoto(motherPhoto, 'mother', idCardId);
      }

      return {
        studentPhotoUrl: studentUrl,
        fatherPhotoUrl: fatherUrl,
        motherPhotoUrl: motherUrl,
      };
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw new Error('Failed to upload photos');
    }
  };

  const onSubmit = async (data: FormInput) => {
    try {
      // Validate photos
      if (!studentPhoto) {
        toast.error('Please upload a student photo');
        return;
      }
      if (!fatherPhoto) {
        toast.error('Please upload a father photo');
        return;
      }
      if (!motherPhoto) {
        toast.error('Please upload a mother photo');
        return;
      }

      setLoading(true);

      // Create ID card record first to get an ID
      const idCardId = await idCardService.saveIDCardData({
        ...data,
        studentPhoto: '',
        fatherPhoto: '',
        motherPhoto: '',
      });

      setIdCardId(idCardId);

      // Upload photos
      const { studentPhotoUrl, fatherPhotoUrl, motherPhotoUrl } = await uploadPhotos(idCardId);

      // Update ID card record with photo URLs
      await idCardService.updateIDCardData(idCardId, {
        studentPhoto: studentPhotoUrl,
        fatherPhoto: fatherPhotoUrl,
        motherPhoto: motherPhotoUrl,
      });

      // Set photo URLs for preview
      setStudentPhotoUrl(studentPhotoUrl);
      setFatherPhotoUrl(fatherPhotoUrl);
      setMotherPhotoUrl(motherPhotoUrl);

      // Prepare ID card data for preview
      const idCardData: IDCardData = {
        id: idCardId,
        ...data,
        className: selectedClass?.name,
        section: selectedClass?.section,
        studentPhoto: studentPhotoUrl,
        fatherPhoto: fatherPhotoUrl,
        motherPhoto: motherPhotoUrl,
      };

      setIdCardData(idCardData);
      setActiveTab('preview');
      setFormSubmitted(true);
      toast.success('ID card created successfully!');
      
      // Open WhatsApp with the specified message
      const whatsappMessage = `hi, Student Name is ${data.studentName}, data has been submitted thanks`;
      const whatsappUrl = `https://wa.me/919311872001?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error creating ID card:', error);
      
      // Display specific error messages for duplicate submissions and storage limits
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          toast.error(error.message);
        } else if (error.message.includes('Storage limit')) {
          toast.error(error.message);
        } else {
          toast.error('Failed to create ID card. Please try again.');
        }
      } else {
        toast.error('Failed to create ID card. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
      {/* Confetti effect */}
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, pointerEvents: 'none', opacity: confettiOpacity }}>
          <ReactConfetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={200}
            gravity={0.3}
            colors={[
              '#FF5252', // Red
              '#FF9800', // Orange
              '#FFEB3B', // Yellow
              '#4CAF50', // Green
              '#2196F3', // Blue
              '#9C27B0', // Purple
              '#E91E63', // Pink
              '#00BCD4', // Cyan
            ]}
            confettiSource={{
              x: width / 2,
              y: 0,
              w: width,
              h: 0
            }}
            tweenDuration={5000}
            drawShape={ctx => {
              // Draw candy-like shapes
              const random = Math.random();
              if (random < 0.33) {
                // Circle candy
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, 2 * Math.PI);
                ctx.fill();
              } else if (random < 0.66) {
                // Square candy
                ctx.fillRect(-5, -5, 10, 10);
              } else {
                // Star candy
                const spikes = 5;
                const outerRadius = 7;
                const innerRadius = 3;
                
                let rot = Math.PI / 2 * 3;
                let x = 0;
                let y = 0;
                let step = Math.PI / spikes;
                
                ctx.beginPath();
                ctx.moveTo(0, -outerRadius);
                
                for (let i = 0; i < spikes; i++) {
                  x = Math.cos(rot) * outerRadius;
                  y = Math.sin(rot) * outerRadius;
                  ctx.lineTo(x, y);
                  rot += step;
                  
                  x = Math.cos(rot) * innerRadius;
                  y = Math.sin(rot) * innerRadius;
                  ctx.lineTo(x, y);
                  rot += step;
                }
                
                ctx.lineTo(0, -outerRadius);
                ctx.closePath();
                ctx.fill();
              }
            }}
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">{SCHOOL_INFO.name} - Student ID Card Generator</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h4 className="text-sm sm:text-base">Physical (Hard copy) will be delivered by April End</h4>
          <a
            href="https://wa.me/919311872001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
            Need Help? Contact on WhatsApp
          </a>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="text-sm sm:text-base py-2">Form</TabsTrigger>
          <TabsTrigger value="preview" disabled={!idCardData} className="text-sm sm:text-base py-2">Preview & Download</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Student & Parent Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Student Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-medium">Student Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-black">Student Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter student name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-black">Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                placeholder="Select date of birth"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-black">Class</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name} {cls.section}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel className="font-bold text-black">Student Photo</FormLabel>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center">
                            <div className="w-16 h-20 bg-white border border-gray-300 rounded-sm overflow-hidden mr-2 flex items-center justify-center">
                              <div className="text-center p-1">
                                <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                    <circle cx="12" cy="8" r="5"></circle>
                                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                                  </svg>
                                </div>
                                <p className="text-[8px] font-medium text-blue-800">Student Photo</p>
                              </div>
                            </div>
                            <div className="text-xs text-blue-800">
                              <p className="font-semibold">Example Photo</p>
                              <ul className="list-disc pl-4 mt-1 text-[10px]">
                                <li>Passport size</li>
                                <li>Clear face</li>
                                <li>Light background</li>
                                <li>Recent photo</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1">
                          <PhotoUploader
                            onPhotoChange={(file) => handlePhotoChange('student', file)}
                            photoType="student"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Parent Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-medium">Parent Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-black">Father's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter father's name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-black">Mother's Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter mother's name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel className="font-bold text-black">Father's Photo</FormLabel>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center">
                            <div className="w-16 h-20 bg-white border border-gray-300 rounded-sm overflow-hidden mr-2 flex items-center justify-center">
                              <div className="text-center p-1">
                                <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                                    <circle cx="12" cy="8" r="5"></circle>
                                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                                  </svg>
                                </div>
                                <p className="text-[8px] font-medium text-blue-800">Father Photo</p>
                              </div>
                            </div>
                            <div className="text-xs text-blue-800">
                              <p className="font-semibold">Example Photo</p>
                              <ul className="list-disc pl-4 mt-1 text-[10px]">
                                <li>Passport size</li>
                                <li>Clear face</li>
                                <li>Light background</li>
                                <li>Recent photo</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1">
                          <PhotoUploader
                            onPhotoChange={(file) => handlePhotoChange('father', file)}
                            photoType="father"
                          />
                        </div>
                      </div>
                      <div>
                        <FormLabel className="font-bold text-black">Mother's Photo</FormLabel>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center">
                            <div className="w-16 h-20 bg-white border border-gray-300 rounded-sm overflow-hidden mr-2 flex items-center justify-center">
                              <div className="text-center p-1">
                                <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                                    <circle cx="12" cy="8" r="5"></circle>
                                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                                  </svg>
                                </div>
                                <p className="text-[8px] font-medium text-blue-800">Mother Photo</p>
                              </div>
                            </div>
                            <div className="text-xs text-blue-800">
                              <p className="font-semibold">Example Photo</p>
                              <ul className="list-disc pl-4 mt-1 text-[10px]">
                                <li>Passport size</li>
                                <li>Clear face</li>
                                <li>Light background</li>
                                <li>Recent photo</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1">
                          <PhotoUploader
                            onPhotoChange={(file) => handlePhotoChange('mother', file)}
                            photoType="mother"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <FormField
                      control={form.control}
                      name="fatherMobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-black">Father's Mobile</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter father's mobile number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherMobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-black">Mother's Mobile</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter mother's mobile number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-black">Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-center sm:justify-end mt-6">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2 text-base"
                      disabled={loading || formSubmitted}
                    >
                      {loading ? <LoadingSpinner /> : formSubmitted ? 'ID Card Generated' : 'Generate ID Card'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {idCardData && (
            <div className="px-0 sm:px-4">
              <IDCardGenerator data={idCardData} idCardId={idCardId} />
              
              <div className="mt-6 flex justify-center">
                <a
                  href={`https://wa.me/919717267473?text=${encodeURIComponent(`Having issues with ID card for ${idCardData.studentName}? Contact us for help.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Having issues with your ID card? Contact us on WhatsApp
                </a>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IDCardForm;