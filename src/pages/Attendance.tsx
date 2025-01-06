import { useEffect, useState } from 'react';
import { useAsync } from '@/hooks/use-async';
import { attendanceService } from '@/services/attendanceService';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttendanceForm } from '@/components/forms/attendance-form';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useProfileAccess } from '@/services/profileService';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { studentService } from '@/services/student.service';

export default function AttendancePage() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>({});

  // Fetch classes
  const { loading: classesLoading, execute: fetchClasses } = useAsync(
    async () => {
      const { data, error } = await supabase
        .schema('school')
        .from('Class')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
        return;
      }

      setClasses(Array.isArray(data) ? data : []);
    },
    { showErrorToast: true }
  );

  // Fetch students for selected class
  const { loading: studentsLoading, execute: fetchStudents } = useAsync(
    async () => {
      if (!selectedClassId) return;

      const students = await studentService.findMany({ classId: selectedClassId });
      setStudents(students);
    },
    { showErrorToast: true }
  );

  // Fetch attendance data
  const { loading: attendanceLoading, execute: fetchAttendance } = useAsync(
    async () => {
      if (!selectedClassId) return;

      const data = await attendanceService.getAll(
        selectedClassId,
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      );
      setAttendanceData(data);

      // Calculate summary
      const summary = data.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      setAttendanceSummary(summary);
    },
    { showErrorToast: true }
  );

  useEffect(() => {
    if (isAdminOrTeacher) {
      fetchClasses();
    } else if (profile?.classId) {
      setSelectedClassId(profile.classId);
    }
  }, [profile, isAdminOrTeacher]);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClassId, selectedDate]);

  const { execute: createAttendance } = useAsync(
    async (data) => {
      await attendanceService.create({
        ...data,
        classId: selectedClassId
      });
      await fetchAttendance();
      setIsCreateDialogOpen(false);
      toast.success('Attendance marked successfully!');
    },
    { showErrorToast: true }
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "error" | "warning" | "default"> = {
      PRESENT: "success",
      ABSENT: "error",
      LATE: "warning",
      HALF_DAY: "default"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (classesLoading || profileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage student attendance records
          </p>
        </div>
        {isAdminOrTeacher && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Class Selection */}
        {isAdminOrTeacher && (
          <Card>
            <CardHeader>
              <CardTitle>Select Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to view attendance" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {selectedClassId && (
          <div className="grid gap-6 md:grid-cols-12">
            {/* Calendar and Summary */}
            <div className="md:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(attendanceSummary).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50">
                      {getStatusBadge(status)}
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Attendance List */}
            <Card className="md:col-span-8">
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No attendance records found for the selected date
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {record.student?.name}
                              <div className="text-sm text-muted-foreground">
                                {record.student?.admissionNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Attendance Dialog */}
      {isAdminOrTeacher && (
        <Dialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <AttendanceForm
              students={students}
              onSubmit={createAttendance}
              date={new Date()}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
