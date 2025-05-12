import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parentFeedbackService } from '@/services/parentFeedbackService';
import { classService } from '@/services/classService';
import { idCardService } from '@/services/idCardService';
import { ParentFeedback, ClassOption, MONTHS } from '@/types/parentFeedback';
import { ParentFeedbackCertificate } from '@/components/ParentFeedbackCertificate';
import ParentFeedbackSubmissionModal from '@/components/ParentFeedbackSubmissionModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Search, AlertCircle, Loader2, User, MessageSquare, PenSquare } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ParentFeedbackSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<ParentFeedback | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<{id: string, name: string, photo_url: string | null}[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<{id: string, name: string, photo_url: string | null}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get previous month name
  const getPreviousMonth = (): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  // Form state
  const [classId, setClassId] = useState<string>(searchParams.get('classId') || '');
  const [studentName, setStudentName] = useState<string>(searchParams.get('studentName') || '');
  const [month, setMonth] = useState<string>(searchParams.get('month') || getPreviousMonth());

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const classData = await classService.getAllClasses();
        setClasses(classData as ClassOption[]);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Handle class change - fetch students for the selected class
  const handleClassChange = async (value: string) => {
    setClassId(value);

    if (value) {
      try {
        setLoading(true);
        // Use parentFeedbackService instead of idCardService to get students
        const studentsData = await parentFeedbackService.getStudentsByClass(value);
        setStudents(studentsData);
        setFilteredStudents(studentsData);

        // Reset student name when class changes
        setStudentName('');
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students for this class');
      } finally {
        setLoading(false);
      }
    }
  };

  // Update filtered students whenever studentName changes
  useEffect(() => {
    if (!students.length) return;

    if (studentName.trim() === '') {
      // Only show dropdown when user is typing
      setFilteredStudents([]);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(studentName.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [studentName, students]);

  // Check if we have search params on mount and perform search
  useEffect(() => {
    const classIdParam = searchParams.get('classId');
    const studentNameParam = searchParams.get('studentName');
    const monthParam = searchParams.get('month');

    if (classIdParam && studentNameParam) {
      setClassId(classIdParam);
      setStudentName(studentNameParam);
      if (monthParam) setMonth(monthParam);

      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!classId || !studentName) {
      toast.error('Please select a class and enter student name');
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setFeedback(null);
      setCertificateId(null);

      // Update search params
      setSearchParams({
        classId,
        studentName,
        ...(month ? { month } : {})
      });

      // First search without month filter to check if student has any feedback
      const baseSearchParams = {
        class_id: classId,
        student_name: studentName
      };

      const allResults = await parentFeedbackService.searchFeedback(baseSearchParams);

      if (allResults.length === 0) {
        setError(`We couldn't find any feedback for ${studentName} in this class. The feedback may not have been entered yet.`);
        return;
      }

      // Get photos from ID card to ensure we have them
      console.log('Fetching photos from ID card for certificate');
      const { studentPhotoUrl, fatherPhotoUrl, motherPhotoUrl } =
        await parentFeedbackService.getPhotosFromIDCard(studentName, classId);

      console.log('Photos from ID card:', {
        studentPhotoUrl: studentPhotoUrl ? 'Found' : 'Not found',
        fatherPhotoUrl: fatherPhotoUrl ? 'Found' : 'Not found',
        motherPhotoUrl: motherPhotoUrl ? 'Found' : 'Not found'
      });

      // If month is specified, filter by month
      if (month && month !== 'all') {
        const monthResults = allResults.filter(f => f.month === month);

        if (monthResults.length === 0) {
          setError(`We have feedback for ${studentName}, but none for the month of ${month}. Please select a different month to view available feedback.`);
          return;
        }

        // Use the feedback for the specified month and add photos
        const feedbackWithPhotos = {
          ...monthResults[0],
          student_photo_url: studentPhotoUrl || monthResults[0].student_photo_url,
          father_photo_url: fatherPhotoUrl || monthResults[0].father_photo_url,
          mother_photo_url: motherPhotoUrl || monthResults[0].mother_photo_url
        };

        setFeedback(feedbackWithPhotos);
        console.log('Setting feedback with photos:', {
          studentPhoto: feedbackWithPhotos.student_photo_url ? 'Found' : 'Not found',
          fatherPhoto: feedbackWithPhotos.father_photo_url ? 'Found' : 'Not found',
          motherPhoto: feedbackWithPhotos.mother_photo_url ? 'Found' : 'Not found'
        });

        // Check if certificate exists
        const certificate = await parentFeedbackService.getCertificateByFeedbackId(monthResults[0].id);
        if (certificate) {
          setCertificateId(certificate.id);
        }
      } else {
        // Use the most recent feedback and add photos
        const feedbackWithPhotos = {
          ...allResults[0],
          student_photo_url: studentPhotoUrl || allResults[0].student_photo_url,
          father_photo_url: fatherPhotoUrl || allResults[0].father_photo_url,
          mother_photo_url: motherPhotoUrl || allResults[0].mother_photo_url
        };

        setFeedback(feedbackWithPhotos);
        console.log('Setting feedback with photos:', {
          studentPhoto: feedbackWithPhotos.student_photo_url ? 'Found' : 'Not found',
          fatherPhoto: feedbackWithPhotos.father_photo_url ? 'Found' : 'Not found',
          motherPhoto: feedbackWithPhotos.mother_photo_url ? 'Found' : 'Not found'
        });

        // Check if certificate exists
        const certificate = await parentFeedbackService.getCertificateByFeedbackId(allResults[0].id);
        if (certificate) {
          setCertificateId(certificate.id);
        }
      }
    } catch (error) {
      console.error('Error searching for feedback:', error);
      setError('An error occurred while searching for feedback. Please try again.');
      toast.error('Failed to search for feedback');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{SCHOOL_INFO?.name || 'School'}</CardTitle>
          <CardDescription>Student Feedback & Certificate Portal</CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Submit Your Feedback About Your Child
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select
                value={classId}
                onValueChange={handleClassChange}
                disabled={loading}
              >
                <SelectTrigger id="class">
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
              <Label htmlFor="student_name">Student Name</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="student_name"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="pl-8"
                  disabled={loading || !classId}
                />
              </div>
              {classId && students.length > 0 && studentName.trim() !== '' && (
                <div className="mt-2 border rounded-md max-h-[200px] overflow-y-auto shadow-md">
                  {filteredStudents.length > 0 ? (
                    <div className="p-1">
                      {filteredStudents.slice(0, 10).map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => setStudentName(student.name)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2 ${
                            studentName === student.name ? 'bg-gray-100 font-medium' : ''
                          }`}
                        >
                          {student.photo_url ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={student.photo_url}
                                alt={student.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // If image fails to load, replace with placeholder
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                      </svg>
                                    </div>
                                  `;
                                }}
                                crossOrigin="anonymous"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <span>{student.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No matching students found
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {!classId ? (
                  'Please select a class first to see available students'
                ) : students.length === 0 ? (
                  'No students found for this class'
                ) : studentName.trim() !== '' ? (
                  studentName // Just show the selected student name
                ) : (
                  `Type to search for a student...`
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="month">Month (Optional)</Label>
              <Select
                value={month}
                onValueChange={setMonth}
                disabled={loading || !classId || !studentName}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!classId || !studentName ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Please select a class and student first
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Select a specific month or "All Months" to see the most recent feedback
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleSearch}
              disabled={searching || !classId || !studentName}
              className="w-full md:w-auto"
              size="lg"
            >
              {searching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search Feedback
                </>
              )}
            </Button>
            {!classId || !studentName ? (
              <p className="text-sm text-muted-foreground">
                Please select both class and student name to search
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="max-w-4xl mx-auto mb-8 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">No Feedback Found</span>
            </div>
            <p>{error}</p>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-medium mb-2">What you can do:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Check if you've selected the correct class</li>
                <li>Verify the student name is spelled correctly</li>
                <li>Try selecting a different month</li>
                <li>Contact the school administrator if you believe this is an error</li>
              </ul>
            </div>

            {classId && studentName && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                <h3 className="text-lg font-medium mb-2 text-blue-700">Share Your Feedback</h3>
                <p className="mb-4">
                  Even if there's no teacher feedback available yet, you can still share your thoughts about your child's progress.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Your Feedback
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {feedback && (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Student Feedback</CardTitle>
              <CardDescription>
                Feedback for {feedback.student_name} - {feedback.className} {feedback.classSection} ({feedback.month})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-700">Good Things</h3>
                  <p className="p-3 bg-green-50 border border-green-200 rounded">{feedback.good_things}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-amber-700">Areas to Improve</h3>
                  <p className="p-3 bg-amber-50 border border-amber-200 rounded">{feedback.need_to_improve}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Best Can Do</h3>
                <p className="p-3 bg-blue-50 border border-blue-200 rounded">{feedback.best_can_do}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Attendance</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${Math.min(100, feedback.attendance_percentage)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 font-semibold">{feedback.attendance_percentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Certificate</CardTitle>
              <CardDescription>
                Download or print the certificate for {feedback.student_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ParentFeedbackCertificate feedback={feedback} certificateId={certificateId || undefined} />
            </CardContent>
          </Card>

          {/* Submit Your Feedback Card */}
          <Card className="mb-8 border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-700 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Share Your Feedback
              </CardTitle>
              <CardDescription>
                We'd love to hear your thoughts about your child's progress
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p>Your feedback helps us better understand your child's needs and improve our teaching methods.</p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Your Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Floating Action Button for Mobile - Only show when no feedback is displayed */}
      {!feedback && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <PenSquare className="h-6 w-6" />
            <span className="sr-only">Submit Feedback</span>
          </Button>
        </div>
      )}

      {/* Parent Feedback Submission Modal */}
      <ParentFeedbackSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          toast.success('Thank you for your feedback!');
        }}
        prefillData={{
          class_id: classId,
          student_name: studentName,
          month: month !== 'all' ? month : undefined
        }}
      />
    </div>
  );
};

export default ParentFeedbackSearch;
