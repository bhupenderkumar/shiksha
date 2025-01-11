import { useEffect, useState } from 'react';
import { useAsync } from '@/hooks/use-async';
import { attendanceService } from '@/services/attendanceService';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttendanceForm } from '@/components/forms/attendance-form';
import { Calendar as CalendarIcon, Plus, Edit, Trash } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { studentService } from '@/services/student.service';

export default function AttendancePage() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const data = await attendanceService.getAll(
          selectedClassId,
          startOfDay,
          endOfDay
        );

        setAttendanceData(Array.isArray(data) ? data : []);

        // Calculate summary
        const summary = data.reduce((acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});
        setAttendanceSummary(summary);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to load attendance data');
      }
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

  const { execute: createAttendance, loading: isSubmitting } = useAsync(
    async (data) => {
      if (!selectedClassId) {
        toast.error('Please select a class first');
        return;
      }

      try {
        const promises = data.map((record: any) =>
          attendanceService.create({
            date: new Date(record.date),
            status: record.status,
            studentId: record.studentId,
            classId: selectedClassId
          })
        );

        await Promise.all(promises);
        await fetchAttendance();
        setIsCreateDialogOpen(false);
        toast.success('Attendance marked successfully!');
      } catch (error) {
        console.error('Error creating attendance:', error);
        toast.error('Failed to mark attendance');
      }
    },
    { showErrorToast: true }
  );

  const { execute: updateAttendance } = useAsync(
    async (data: any) => {
      if (!selectedRecord) return;
      try {
        await attendanceService.update(selectedRecord.id, data.status);
        await fetchAttendance();
        setIsEditDialogOpen(false);
        setSelectedRecord(null);
        toast.success('Attendance updated successfully!');
      } catch (error) {
        console.error('Error updating attendance:', error);
        toast.error('Failed to update attendance');
      }
    },
    { showErrorToast: true }
  );

  const { execute: deleteAttendance } = useAsync(
    async () => {
      if (!selectedRecord) return;
      try {
        await attendanceService.delete(selectedRecord.id);
        await fetchAttendance();
        setIsDeleteDialogOpen(false);
        setSelectedRecord(null);
        toast.success('Attendance record deleted successfully!');
      } catch (error) {
        console.error('Error deleting attendance:', error);
        toast.error('Failed to delete attendance record');
      }
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

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
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
        {/* Date and Class Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </div>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date || new Date());
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

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
        </div>

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
                        {isAdminOrTeacher && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isAdminOrTeacher ? 4 : 3} className="text-center py-8 text-muted-foreground">
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
                            {isAdminOrTeacher && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(record)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(record)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
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
          onOpenChange={(open) => {
            if (!open) setIsCreateDialogOpen(false);
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            {!selectedClassId ? (
              <div className="p-4">
                <p className="text-muted-foreground mb-4">Please select a class first</p>
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
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <Label>Select Date</Label>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                      onClick={() => setIsDatePickerOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </div>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date || new Date());
                          setIsDatePickerOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {students.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">No students found in this class</p>
                  </div>
                ) : (
                  <AttendanceForm
                    students={students}
                    onSubmit={createAttendance}
                    date={selectedDate}
                    classId={selectedClassId}
                    isLoading={isSubmitting}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isAdminOrTeacher && (
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Attendance</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <Select
                value={selectedRecord?.status}
                onValueChange={(value) => updateAttendance({ status: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {isAdminOrTeacher && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this attendance record? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAttendance}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
