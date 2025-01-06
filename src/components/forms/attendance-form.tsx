import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttendanceStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { classService } from '@/services/classService';
import { studentService } from '@/services/student.service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type AttendanceFormProps = {
  onSubmit: (data: any) => Promise<void>;
};

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'SICK_LEAVE', label: 'Sick Leave' },
  { value: 'NO_NOTICE', label: 'No Notice' }
];

export function AttendanceForm({ onSubmit }: AttendanceFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAll();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  // Load students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const data = await studentService.getByClass(selectedClassId);
        setStudents(data);
        // Initialize all students as present
        const initialRecords = data.reduce((acc, student) => ({
          ...acc,
          [student.id]: AttendanceStatus.PRESENT
        }), {});
        setRecords(initialRecords);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }

    const attendanceRecords = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status
    }));

    await onSubmit({
      date,
      records: attendanceRecords,
      classId: selectedClassId
    });
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, "success" | "error" | "warning" | "default"> = {
      PRESENT: "success",
      ABSENT: "error",
      LATE: "warning",
      HALF_DAY: "default",
      SICK_LEAVE: "warning",
      NO_NOTICE: "error"
    };

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Date</Label>
          <div className="border rounded-lg p-2 bg-background">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setDate(date || new Date())}
              defaultMonth={new Date()}
              initialFocus
              className="w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <LoadingSpinner />
        </div>
      ) : selectedClassId && students.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Select
                          value={records[student.id]}
                          onValueChange={(value) => 
                            handleStatusChange(student.id, value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              {getStatusBadge(records[student.id])}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {getStatusBadge(value as AttendanceStatus)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {records[student.id] !== 'PRESENT' && (
                          <input
                            type="text"
                            className="w-full rounded-md border px-3 py-2"
                            placeholder="Add remarks..."
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : selectedClassId ? (
        <div className="text-center text-muted-foreground">
          No students found in this class
        </div>
      ) : null}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={!selectedClassId || students.length === 0}>
          Save Attendance
        </Button>
      </div>
    </form>
  );
} 