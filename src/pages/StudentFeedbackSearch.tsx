import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studentFeedbackService } from '@/services/studentFeedbackService';
import { StudentFeedback, FeedbackSearchParams } from '@/types/feedback';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { Search, Download, FileDown } from 'lucide-react';
import { SCHOOL_INFO } from '@/lib/constants';
import { classService } from '@/services/classService';
import { StudentFeedbackCertificate } from '@/components/StudentFeedbackCertificate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StudentFeedbackSearch: React.FC = () => {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchResults, setSearchResults] = useState<StudentFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<StudentFeedback | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Months array for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const classData = await classService.getAll();
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

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass && !studentName && !selectedMonth) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    try {
      setSearching(true);
      setSelectedFeedback(null);
      setShowCertificate(false);

      const searchParams: FeedbackSearchParams = {};
      if (selectedClass) searchParams.class_id = selectedClass;
      if (studentName) searchParams.student_name = studentName;
      if (selectedMonth) searchParams.month = selectedMonth;

      const results = await studentFeedbackService.searchFeedback(searchParams);
      setSearchResults(results);

      if (results.length === 0) {
        toast.error('No feedback found for the given criteria');
      }
    } catch (error) {
      console.error('Error searching feedback:', error);
      toast.error('Failed to search feedback');
    } finally {
      setSearching(false);
    }
  };

  // Handle feedback selection
  const handleSelectFeedback = (feedback: StudentFeedback) => {
    setSelectedFeedback(feedback);
    setShowCertificate(false);
  };

  // Handle certificate view
  const handleViewCertificate = () => {
    setShowCertificate(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{SCHOOL_INFO.name}</CardTitle>
          <CardDescription>Student Feedback Search</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      placeholder="Enter student name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Months</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button type="submit" disabled={searching} className="w-full md:w-auto">
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
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedFeedback && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                  <div className="space-y-3">
                    {searchResults.map((feedback) => (
                      <Card key={feedback.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSelectFeedback(feedback)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{feedback.student_name}</h4>
                              <p className="text-sm text-gray-500">
                                Class: {feedback.className} | Month: {feedback.month}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Feedback Details */}
              {selectedFeedback && !showCertificate && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Feedback Details</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                        Back to Results
                      </Button>
                      <Button onClick={handleViewCertificate}>
                        <FileDown className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-2">{selectedFeedback.student_name}</h4>
                          <p className="text-sm text-gray-500 mb-4">
                            Class: {selectedFeedback.className} | Month: {selectedFeedback.month}
                          </p>

                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-blue-700">Good Things</h5>
                              <p className="mt-1">{selectedFeedback.good_things}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-amber-700">Need to Improve</h5>
                              <p className="mt-1">{selectedFeedback.need_to_improve}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-green-700">Best Can Do</h5>
                              <p className="mt-1">{selectedFeedback.best_can_do}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-purple-700">Attendance</h5>
                              <p className="mt-1">{selectedFeedback.attendance_percentage}%</p>
                            </div>
                          </div>
                        </div>

                        {selectedFeedback.student_photo_url && (
                          <div className="flex justify-center">
                            <div className="border-2 border-blue-300 p-1 rounded-md shadow-sm bg-white">
                              <img
                                src={selectedFeedback.student_photo_url}
                                alt={selectedFeedback.student_name}
                                className="w-32 h-40 object-cover rounded-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x160?text=No+Photo';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Certificate View */}
              {selectedFeedback && showCertificate && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Certificate</h3>
                    <Button variant="outline" onClick={() => setShowCertificate(false)}>
                      Back to Feedback
                    </Button>
                  </div>

                  <StudentFeedbackCertificate feedback={selectedFeedback} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFeedbackSearch;
