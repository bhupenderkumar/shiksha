import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parentFeedbackService } from '@/services/parentFeedbackService';
import { classService } from '@/services/classService';
import { ParentFeedback, ClassOption } from '@/types/parentFeedback';
import { ParentFeedbackCertificate } from '@/components/ParentFeedbackCertificate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { Search, AlertCircle, Download, Printer, Calendar } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ParentFeedbackPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<ParentFeedback | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [classId, setClassId] = useState<string>(searchParams.get('classId') || '');
  const [studentName, setStudentName] = useState<string>(searchParams.get('studentName') || '');
  const [month, setMonth] = useState<string>(searchParams.get('month') || '');

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

  // Auto-search if params are present
  useEffect(() => {
    if (classId && studentName) {
      handleSearch();
    }
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!classId || !studentName) {
      setError('Please select a class and enter student name');
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

      // Search for feedback
      const searchParams = {
        class_id: classId,
        student_name: studentName,
        ...(month && month !== 'latest' ? { month } : {})
      };

      const results = await parentFeedbackService.searchFeedback(searchParams);

      if (results.length === 0) {
        setError('No feedback found for this student. Please check the class and student name.');
        return;
      }

      // Get the most recent feedback or the one matching the month
      const selectedFeedback = month && month !== 'latest'
        ? results.find(f => f.month === month) || results[0]
        : results[0];

      setFeedback(selectedFeedback);

      // Check if certificate exists
      if (selectedFeedback) {
        const certificate = await parentFeedbackService.getCertificateByFeedbackId(selectedFeedback.id);
        if (certificate) {
          setCertificateId(certificate.id);
        } else {
          // Generate certificate if it doesn't exist
          const newCertificate = await parentFeedbackService.generateCertificate(selectedFeedback.id);
          if (newCertificate) {
            setCertificateId(newCertificate.id);
          }
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select
                value={classId}
                onValueChange={setClassId}
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
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="month">Month (Optional)</Label>
              <Select
                value={month}
                onValueChange={setMonth}
                disabled={loading}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Feedback</SelectItem>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={searching || !classId || !studentName}
              className="w-full md:w-auto"
            >
              {searching ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Feedback
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="max-w-4xl mx-auto mb-8 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Error</span>
            </div>
            <p>{error}</p>
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
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Student Photo */}
                {feedback.student_photo_url && (
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 border-2 border-blue-300 rounded-md overflow-hidden">
                      <img
                        src={feedback.student_photo_url}
                        alt={feedback.student_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Student Info */}
                <div className="flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                      <p className="text-lg font-semibold">{feedback.student_name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Class</h3>
                      <p className="text-lg font-semibold">{feedback.className} {feedback.classSection}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Month</h3>
                      <p className="text-lg font-semibold flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {feedback.month}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${Math.min(100, feedback.attendance_percentage)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{feedback.attendance_percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
        </div>
      )}
    </div>
  );
};

export default ParentFeedbackPortal;
