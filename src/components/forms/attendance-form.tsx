import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AttendanceFormProps {
  students: Array<{
    id: string;
    name: string;
    admissionNumber: string;
  }>;
  onSubmit: (data: any) => Promise<void>;
  date: Date;
  classId: string;
  isLoading?: boolean;
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export function AttendanceForm({ students, onSubmit, date, classId, isLoading }: AttendanceFormProps) {
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>(
    students.reduce((acc, student) => ({ ...acc, [student.id]: 'PRESENT' }), {})
  );

  const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: 'LATE', label: 'Late' },
    { value: 'HALF_DAY', label: 'Half Day' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform attendance data into records matching the database schema
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      studentId,
      date: date.toISOString(),
      status
    }));

    await onSubmit(records);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Student Name</TableHead>
              <TableHead className="whitespace-nowrap">Admission No.</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground">{student.admissionNumber}</TableCell>
                <TableCell>
                  <Select
                    value={attendanceData[student.id]}
                    onValueChange={(value: AttendanceStatus) => 
                      setAttendanceData(prev => ({ ...prev, [student.id]: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px] max-w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Attendance'}
        </Button>
      </div>
    </form>
  );
}