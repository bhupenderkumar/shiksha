import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AttendanceFormProps {
  students: Array<{
    id: string;
    name: string;
    admissionNumber: string;
  }>;
  onSubmit: (data: any) => Promise<void>;
  defaultDate?: Date;
  isSubmitting?: boolean;
  defaultValues?: any;
  isEdit?: boolean;
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export function AttendanceForm({ 
  students, 
  onSubmit, 
  defaultDate, 
  isSubmitting,
  defaultValues,
  isEdit 
}: AttendanceFormProps) {
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>(
    defaultValues ? { [defaultValues.studentId]: defaultValues.status } :
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
    
    if (!date) {
      alert('Please select a date');
      return;
    }

    try {
      if (isEdit && defaultValues) {
        // For editing a single record
        await onSubmit({
          id: defaultValues.id,
          status: attendanceData[defaultValues.studentId]
        });
      } else {
        // For creating new attendance records
        const records = Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          date: date.toISOString(),
          status
        }));
        await onSubmit(records);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  if (!students.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No students found
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate || new Date());
                  setIsDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

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
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-[180px] max-w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[200px]">
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
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {isEdit ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            isEdit ? 'Update Attendance' : 'Submit Attendance'
          )}
        </Button>
      </div>
    </form>
  );
}