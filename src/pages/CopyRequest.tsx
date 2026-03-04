import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { copyRequestService, ALL_SUBJECTS } from '@/services/unitTestMarksService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, Send, CheckCircle, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { SCHOOL_INFO } from '@/constants/schoolInfo';

interface ClassInfo {
  id: string;
  name: string;
  section: string;
}

interface StudentInfo {
  id: string;
  name: string;
  admissionNumber: string;
}

export default function CopyRequestPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('Class')
        .select('id, name, section')
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }
      setClasses(data || []);
    };
    fetchClasses();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .schema(SCHEMA)
          .from('Student')
          .select('id, name, admissionNumber')
          .eq('classId', selectedClassId)
          .order('name');

        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId || !selectedStudentId || !parentName || !parentContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await copyRequestService.submitRequest({
        student_id: selectedStudentId,
        class_id: selectedClassId,
        parent_name: parentName,
        parent_contact: parentContact,
        subject: selectedSubject || undefined,
        reason: reason || undefined,
      });

      setSubmitted(true);
      toast.success('Copy request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId('');
    setSelectedStudentId('');
    setParentName('');
    setParentContact('');
    setSelectedSubject('');
    setReason('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700">Request Submitted!</h2>
            <p className="text-gray-600">
              Your request to view the Unit Test 4 copy has been submitted successfully. 
              The school administration will review your request.
            </p>
            <p className="text-sm text-gray-500">
              You will be contacted at <strong>{parentContact}</strong> regarding your request.
            </p>
            <div className="flex gap-3 pt-4 justify-center">
              <Button onClick={resetForm} variant="outline">
                Submit Another Request
              </Button>
              <Button asChild>
                <a
                  href={`https://wa.me/919717267473?text=Hello! I have submitted a copy request for Unit Test 4.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp School
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <FileText className="h-4 w-4" />
            Unit Test 4 Copy Request
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Request Unit Test Copy
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Parents can request to view their child's Unit Test 4 answer copy. 
            Fill in the details below.
          </p>
        </div>

        {/* School Info */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{SCHOOL_INFO.name}</p>
                <p className="text-sm text-white/80">Unit Test 4 - February 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Copy Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class">
                  Class <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">
                  Student <span className="text-red-500">*</span>
                </Label>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LoadingSpinner /> Loading students...
                  </div>
                ) : (
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                    disabled={!selectedClassId}
                  >
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Select student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Parent Name */}
              <div className="space-y-2">
                <Label htmlFor="parentName">
                  <User className="h-4 w-4 inline mr-1" />
                  Parent/Guardian Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Parent Contact */}
              <div className="space-y-2">
                <Label htmlFor="parentContact">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentContact"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                />
              </div>

              {/* Subject (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="All subjects or select specific..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {ALL_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please mention if you have any specific concern..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <Send className="h-5 w-5 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Copy Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4 pb-4 text-sm text-yellow-800 space-y-1">
            <p className="font-semibold">📋 Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Copy viewing is subject to school administration approval.</li>
              <li>You will be notified once your request is processed.</li>
              <li>Please carry a valid ID when visiting the school.</li>
              <li>Total marks: 20 (Writing: 15, Oral: 5)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
