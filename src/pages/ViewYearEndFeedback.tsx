import { useState, useEffect } from 'react';
import { PageAnimation } from '@/components/ui/page-animation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface YearEndFeedback {
  id: string;
  student_id: string;
  academic_year_id: string;
  parent_feedback: string;
  student_feedback: string;
  areas_of_improvement: string;
  strengths: string;
  next_class_recommendation: string;
  student_photo_url: string;
  father_photo_url: string;
  mother_photo_url: string;
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
  feedback_status: string;
  submitted_at: string;
  Student: {
    id: string;
    name: string;
    admissionNumber: string;
    Class: {
      id: string;
      name: string;
    };
  };
}

const ViewYearEndFeedback = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<YearEndFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<YearEndFeedback | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      // Get active academic year
      const { data: academicYear, error: yearError } = await supabase
        .schema(SCHEMA)
        .from('AcademicYear')
        .select('id')
        .eq('status', 'ACTIVE')
        .single();

      if (yearError) throw yearError;

      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('YearEndFeedback')
        .select(`
          *,
          Student:student_id (
            id,
            name,
            admissionNumber,
            Class:classId (
              id,
              name
            )
          )
        `)
        .eq('academic_year_id', academicYear.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (feedback: YearEndFeedback) => {
    setSelectedFeedback(feedback);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageAnimation>
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors duration-150"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Back to Home</span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full">
                  <img 
                    src="/logo.png" 
                    alt="First Step School"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYm9vayI+PHBhdGggZD0iTTQgMTkuNUEyLjUgMi41IDAgMCAxIDYuNSAxN0gyMHYyMEg2LjVBMi41IDIuNSAwIDAgMSA0IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJ6Ij48L3BhdGg+PC9zdmc+';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide">First Step School</h1>
                  <p className="text-sm text-blue-100">Year End Feedback Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Academic Year</p>
                <p className="font-medium">2024-2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Year End Feedbacks</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  Submitted
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  Pending
                </span>
              </div>
            </div>
            <Table>
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submission Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-gray-900">{feedback.Student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{feedback.Student.Class.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(feedback.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${feedback.feedback_status === 'SUBMITTED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}`}
                      >
                        {feedback.feedback_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => handleViewDetails(feedback)}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-150"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        {selectedFeedback && (
          <Dialog
            open={showDetailsDialog}
            onOpenChange={(open) => {
              setShowDetailsDialog(open);
              if (!open) setSelectedFeedback(null);
            }}
          >
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
              <div className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 rounded-lg bg-white shadow-xl sm:inset-x-auto sm:left-[50%] sm:w-full sm:max-w-3xl sm:-translate-x-[50%] overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* Dialog Header */}
                  <div className="flex items-center justify-between px-4 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700">
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => setShowDetailsDialog(false)}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors duration-150"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        <span>Back</span>
                      </Button>
                      <h2 className="text-xl font-semibold text-white">Feedback Details</h2>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${selectedFeedback?.feedback_status === 'SUBMITTED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}`}
                      >
                        {selectedFeedback?.feedback_status}
                      </span>
                    </div>
                  </div>

                  {/* Dialog Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-start mb-6 sticky top-0 bg-white pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedFeedback.Student.name}</h2>
                        <p className="text-blue-600">Class: {selectedFeedback.Student.Class.name}</p>
                        <p className="text-gray-600">Admission No: {selectedFeedback.Student.admissionNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => setShowDetailsDialog(false)}
                      >
                        <span className="sr-only">Close</span>
                        ×
                      </Button>
                    </div>

                    <div className="space-y-8">
                      {/* Student Details */}
                      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-blue-700">Parent Feedback</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.parent_feedback || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-blue-700">Student Feedback</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.student_feedback || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-blue-700">Areas of Improvement</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.areas_of_improvement || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-blue-700">Strengths</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.strengths || 'N/A'}</p>
                          </div>
                        </div>
                      </section>

                      {/* Parent Details */}
                      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h4 className="font-medium text-indigo-700 mb-2">Father's Details</h4>
                            <div className="space-y-2 text-gray-700">
                              <p>Name: {selectedFeedback.father_name || 'N/A'}</p>
                              <p>Occupation: {selectedFeedback.father_occupation || 'N/A'}</p>
                              <p>Contact: {selectedFeedback.father_contact || 'N/A'}</p>
                              <p>Email: {selectedFeedback.father_email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h4 className="font-medium text-indigo-700 mb-2">Mother's Details</h4>
                            <div className="space-y-2 text-gray-700">
                              <p>Name: {selectedFeedback.mother_name || 'N/A'}</p>
                              <p>Occupation: {selectedFeedback.mother_occupation || 'N/A'}</p>
                              <p>Contact: {selectedFeedback.mother_contact || 'N/A'}</p>
                              <p>Email: {selectedFeedback.mother_email || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Additional Info */}
                      <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-purple-700">Address</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.address || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-purple-700">Emergency Contact</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.emergency_contact || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <p className="font-medium text-purple-700">Medical Conditions</p>
                            <p className="text-gray-700 mt-1">{selectedFeedback.medical_conditions || 'N/A'}</p>
                          </div>
                        </div>
                      </section>

                      {/* Photos */}
                      <section className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                        <div className="grid grid-cols-3 gap-6">
                          {selectedFeedback.student_photo_url && (
                            <div className="bg-white p-4 rounded shadow-sm">
                              <p className="font-medium text-pink-700 mb-2">Student Photo</p>
                              <img
                                src={selectedFeedback.student_photo_url}
                                alt="Student"
                                className="w-32 h-32 object-cover rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                          {selectedFeedback.father_photo_url && (
                            <div className="bg-white p-4 rounded shadow-sm">
                              <p className="font-medium text-pink-700 mb-2">Father's Photo</p>
                              <img
                                src={selectedFeedback.father_photo_url}
                                alt="Father"
                                className="w-32 h-32 object-cover rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                          {selectedFeedback.mother_photo_url && (
                            <div className="bg-white p-4 rounded shadow-sm">
                              <p className="font-medium text-pink-700 mb-2">Mother's Photo</p>
                              <img
                                src={selectedFeedback.mother_photo_url}
                                alt="Mother"
                                className="w-32 h-32 object-cover rounded-lg shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Status Footer */}
                      <section className="border-t pt-4">
                        <div className="flex justify-between items-center text-sm">
                          <p className="text-gray-600">
                            Status: 
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${selectedFeedback.feedback_status === 'SUBMITTED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
                              {selectedFeedback.feedback_status}
                            </span>
                          </p>
                          <p className="text-gray-600">
                            Submitted: {new Date(selectedFeedback.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Dialog>
        )}

        {loading && (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </PageAnimation>
  );
};

export default ViewYearEndFeedback;
