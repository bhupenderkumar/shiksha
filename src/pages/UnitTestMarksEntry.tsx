import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { studentService } from '@/services/student.service';
import {
  unitTestMarksService,
  SUBJECTS_BY_CLASS,
  type CreateUnitTestMark,
} from '@/services/unitTestMarksService';
import { useProfileAccess } from '@/services/profileService';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save, RefreshCw, BookOpen, PenTool, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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

interface MarksEntry {
  student_id: string;
  writing_marks: number;
  oral_marks: number;
}

export default function UnitTestMarksEntry() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, MarksEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingMarks, setExistingMarks] = useState<any[]>([]);
  const [selectedClassName, setSelectedClassName] = useState('');

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

  // When class changes, update subjects and fetch students
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAvailableSubjects([]);
      return;
    }

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const className = selectedClass?.name || '';
    setSelectedClassName(className);

    // Map class name to subject list
    const matchedKey = Object.keys(SUBJECTS_BY_CLASS).find((key) =>
      className.toLowerCase().includes(key.toLowerCase())
    );
    setAvailableSubjects(matchedKey ? SUBJECTS_BY_CLASS[matchedKey] : SUBJECTS_BY_CLASS['Class V']);
    setSelectedSubject('');

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await studentService.findMany({ classId: selectedClassId });
        setStudents(
          (data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            admissionNumber: s.admissionNumber,
          }))
        );
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId, classes]);

  // When subject changes, load existing marks
  const loadExistingMarks = useCallback(async () => {
    if (!selectedClassId || !selectedSubject) return;

    setLoading(true);
    try {
      const marks = await unitTestMarksService.getMarksByClass(selectedClassId);
      const subjectMarks = marks.filter((m) => m.subject === selectedSubject);
      setExistingMarks(subjectMarks);

      // Populate marks map
      const newMap: Record<string, MarksEntry> = {};
      for (const student of students) {
        const existing = subjectMarks.find((m) => m.student_id === student.id);
        newMap[student.id] = {
          student_id: student.id,
          writing_marks: existing?.writing_marks ?? 0,
          oral_marks: existing?.oral_marks ?? 0,
        };
      }
      setMarksMap(newMap);
    } catch (error) {
      console.error('Error loading marks:', error);
      toast.error('Failed to load existing marks');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSubject, students]);

  useEffect(() => {
    if (selectedSubject && students.length > 0) {
      loadExistingMarks();
    }
  }, [selectedSubject, students, loadExistingMarks]);

  // Handle marks change
  const handleMarksChange = (
    studentId: string,
    field: 'writing_marks' | 'oral_marks',
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const maxValue = field === 'writing_marks' ? 15 : 5;
    const clampedValue = Math.min(Math.max(0, numValue), maxValue);

    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        [field]: clampedValue,
      },
    }));
  };

  // Save marks
  const handleSave = async () => {
    if (!selectedClassId || !selectedSubject) {
      toast.error('Please select a class and subject');
      return;
    }

    setSaving(true);
    try {
      const marksToSave: CreateUnitTestMark[] = Object.values(marksMap).map((entry) => ({
        student_id: entry.student_id,
        class_id: selectedClassId,
        subject: selectedSubject,
        writing_marks: entry.writing_marks,
        oral_marks: entry.oral_marks,
        entered_by: profile?.id || undefined,
      }));

      await unitTestMarksService.upsertMarks(marksToSave);
      toast.success(`Marks saved for ${selectedSubject}!`);
      await loadExistingMarks();
    } catch (error: any) {
      console.error('Error saving marks:', error);
      toast.error(error?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) return <LoadingSpinner />;

  if (!isAdminOrTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only administrators and teachers can enter marks.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Unit Test 4 - Marks Entry"
        description="Enter writing (max 15) and oral (max 5) marks for each student. Total: 20"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class-select">Select Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Choose a class..." />
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

            <div>
              <Label htmlFor="subject-select">Select Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!selectedClassId}
              >
                <SelectTrigger id="subject-select">
                  <SelectValue placeholder="Choose a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedClassId && selectedSubject && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 flex items-center gap-3">
              <PenTool className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Writing</p>
                <p className="text-2xl font-bold text-blue-800">15 Marks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 flex items-center gap-3">
              <Mic className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Oral</p>
                <p className="text-2xl font-bold text-green-800">5 Marks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-purple-800">20 Marks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marks Entry Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : selectedClassId && selectedSubject && students.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {selectedClassName} - {selectedSubject}
              <Badge variant="outline" className="ml-3">
                {students.length} Students
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadExistingMarks}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-[120px]">Adm. No.</TableHead>
                    <TableHead className="w-[130px] text-center">
                      Writing (15)
                    </TableHead>
                    <TableHead className="w-[130px] text-center">
                      Oral (5)
                    </TableHead>
                    <TableHead className="w-[100px] text-center">
                      Total (20)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const entry = marksMap[student.id] || {
                      writing_marks: 0,
                      oral_marks: 0,
                    };
                    const total = (entry.writing_marks || 0) + (entry.oral_marks || 0);
                    const percentage = ((total / 20) * 100).toFixed(0);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.admissionNumber}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={15}
                            step={0.5}
                            value={entry.writing_marks}
                            onChange={(e) =>
                              handleMarksChange(student.id, 'writing_marks', e.target.value)
                            }
                            className="w-full text-center"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={5}
                            step={0.5}
                            value={entry.oral_marks}
                            onChange={(e) =>
                              handleMarksChange(student.id, 'oral_marks', e.target.value)
                            }
                            className="w-full text-center"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span
                              className={cn(
                                'font-bold text-lg',
                                total >= 16 ? 'text-green-600' :
                                total >= 10 ? 'text-blue-600' :
                                total >= 7 ? 'text-yellow-600' : 'text-red-600'
                              )}
                            >
                              {total}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({percentage}%)
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving Marks...' : 'Save All Marks'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedClassId && selectedSubject && students.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No students found in this class.</p>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Select a class and subject to start entering marks.
          </p>
        </Card>
      )}
    </div>
  );
}
