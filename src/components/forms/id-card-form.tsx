import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, User, Users } from 'lucide-react';
import { idCardService, IDCardFormData, IDCardData } from '@/services/idCardService';
import { studentService } from '@/services/student.service';
import toast from 'react-hot-toast';
import { useProfileAccess } from '@/services/profileService';

interface IDCardFormProps {
  studentId?: string;
  onSuccess: (idCard: IDCardData) => void;
}

export function IDCardForm({ studentId, onSuccess }: IDCardFormProps) {
  const { profile } = useProfileAccess();
  const [loading, setLoading] = useState(false);
  const [existingCard, setExistingCard] = useState<IDCardData | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [formData, setFormData] = useState<IDCardFormData>({
    studentId: '',
    fatherName: '',
    motherName: '',
    fatherMobile: '',
    motherMobile: '',
    address: '',
  });
  const [previewUrls, setPreviewUrls] = useState({
    student: '',
    father: '',
    mother: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId && profile?.role === 'STUDENT') {
        // For student/parent users, fetch their own student ID
        try {
          const student = await studentService.findByEmail(profile.email);
          if (student) {
            setStudentDetails(student);
            setFormData(prev => ({ ...prev, studentId: student.id, address: student.address || '' }));
            
            // Check for existing ID card
            const existingIdCard = await idCardService.getByStudentId(student.id);
            if (existingIdCard) {
              setExistingCard(existingIdCard);
              setFormData({
                studentId: existingIdCard.studentId,
                fatherName: existingIdCard.fatherName,
                motherName: existingIdCard.motherName,
                fatherMobile: existingIdCard.fatherMobile,
                motherMobile: existingIdCard.motherMobile,
                address: existingIdCard.address,
              });
              setPreviewUrls({
                student: existingIdCard.studentPhotoUrl || '',
                father: existingIdCard.fatherPhotoUrl || '',
                mother: existingIdCard.motherPhotoUrl || '',
              });
            }
          }
        } catch (error) {
          console.error('Error fetching student details:', error);
          toast.error('Failed to load student details');
        }
      } else if (studentId) {
        // For admin/teacher users viewing a specific student
        try {
          const student = await studentService.getById(studentId);
          if (student) {
            setStudentDetails(student);
            setFormData(prev => ({ 
              ...prev, 
              studentId: student.id, 
              fatherName: student.parentName || '',
              address: student.address || '',
              fatherMobile: student.parentContact || '',
            }));
            
            // Check for existing ID card
            const existingIdCard = await idCardService.getByStudentId(student.id);
            if (existingIdCard) {
              setExistingCard(existingIdCard);
              setFormData({
                studentId: existingIdCard.studentId,
                fatherName: existingIdCard.fatherName,
                motherName: existingIdCard.motherName,
                fatherMobile: existingIdCard.fatherMobile,
                motherMobile: existingIdCard.motherMobile,
                address: existingIdCard.address,
              });
              setPreviewUrls({
                student: existingIdCard.studentPhotoUrl || '',
                father: existingIdCard.fatherPhotoUrl || '',
                mother: existingIdCard.motherPhotoUrl || '',
              });
            }
          }
        } catch (error) {
          console.error('Error fetching student details:', error);
          toast.error('Failed to load student details');
        }
      }
    };

    fetchData();
  }, [studentId, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'studentPhoto' | 'fatherPhoto' | 'motherPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Update form data
    setFormData(prev => ({ ...prev, [type]: file }));

    // Create preview URL
    const previewType = type === 'studentPhoto' ? 'student' : type === 'fatherPhoto' ? 'father' : 'mother';
    const url = URL.createObjectURL(file);
    setPreviewUrls(prev => ({ ...prev, [previewType]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result: IDCardData;

      if (existingCard) {
        // Update existing ID card
        result = await idCardService.update(existingCard.id!, formData);
        toast.success('ID card updated successfully');
      } else {
        // Create new ID card
        result = await idCardService.create(formData);
        toast.success('ID card created successfully');
      }

      onSuccess(result);
    } catch (error) {
      console.error('Error saving ID card:', error);
      toast.error('Failed to save ID card');
    } finally {
      setLoading(false);
    }
  };

  if (!studentDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading student details...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student ID Card Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information (Read-only) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input 
                  id="studentName" 
                  value={studentDetails.name} 
                  disabled 
                />
              </div>
              <div>
                <Label htmlFor="className">Class</Label>
                <Input 
                  id="className" 
                  value={`${studentDetails.class?.name || 'N/A'} ${studentDetails.class?.section || ''}`} 
                  disabled 
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Parent Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input 
                  id="fatherName" 
                  name="fatherName" 
                  value={formData.fatherName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input 
                  id="motherName" 
                  name="motherName" 
                  value={formData.motherName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherMobile">Father's Mobile</Label>
                <Input 
                  id="fatherMobile" 
                  name="fatherMobile" 
                  value={formData.fatherMobile} 
                  onChange={handleInputChange} 
                  required 
                  type="tel"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>
              <div>
                <Label htmlFor="motherMobile">Mother's Mobile</Label>
                <Input 
                  id="motherMobile" 
                  name="motherMobile" 
                  value={formData.motherMobile} 
                  onChange={handleInputChange} 
                  required 
                  type="tel"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Home Address</Label>
            <Input 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          {/* Photo Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Photo */}
              <div className="space-y-2">
                <Label htmlFor="studentPhoto">Student Photo</Label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 border rounded-md overflow-hidden mb-2 flex items-center justify-center bg-gray-50">
                    {previewUrls.student ? (
                      <img 
                        src={previewUrls.student} 
                        alt="Student" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <Input
                    id="studentPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'studentPhoto')}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Father Photo */}
              <div className="space-y-2">
                <Label htmlFor="fatherPhoto">Father's Photo</Label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 border rounded-md overflow-hidden mb-2 flex items-center justify-center bg-gray-50">
                    {previewUrls.father ? (
                      <img 
                        src={previewUrls.father} 
                        alt="Father" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <Input
                    id="fatherPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Mother Photo */}
              <div className="space-y-2">
                <Label htmlFor="motherPhoto">Mother's Photo</Label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 border rounded-md overflow-hidden mb-2 flex items-center justify-center bg-gray-50">
                    {previewUrls.mother ? (
                      <img 
                        src={previewUrls.mother} 
                        alt="Mother" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <Input
                    id="motherPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingCard ? 'Update ID Card' : 'Generate ID Card'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
