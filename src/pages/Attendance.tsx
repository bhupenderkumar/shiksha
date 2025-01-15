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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { studentService } from '@/services/student.service';
import { useProfileAccess } from '@/services/profileService';
import React from 'react';

export default function AttendancePage() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [groupedAttendance, setGroupedAttendance] = useState<Record<string, any[]>>({});
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDateDetails, setSelectedDateDetails] = useState<any[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
      if (!selectedClassId && !profile?.id) return;

      try {
        let data;
        if (isAdminOrTeacher) {
          // For admin/teacher, fetch all attendance for the selected class and month
          const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
          const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
          data = await attendanceService.getAll(selectedClassId, startOfMonth, endOfMonth);
        } else {
          // For students, fetch their own attendance
          data = await attendanceService.getByStudent(profile!.id, selectedMonth);
        }

        setAttendanceData(Array.isArray(data) ? data : []);

        // Group attendance by date
        const grouped = data.reduce((acc: Record<string, any[]>, curr: any) => {
          const dateKey = format(new Date(curr.date), 'yyyy-MM-dd');
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(curr);
          return acc;
        }, {});
        setGroupedAttendance(grouped);

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
  }, [selectedClassId, selectedMonth]);

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

  const { execute: updateAttendance, loading: isUpdating } = useAsync(
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
    setSelectedRecord({
      ...record,
      date: new Date(record.date)
    });
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title="Attendance Management"
        description={isAdminOrTeacher ? "Manage student attendance records" : "View your attendance records"}
      />

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {isAdminOrTeacher && (
          <div className="w-full md:w-64">
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={classesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
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
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <Button
              variant="outline"
              className="w-full sm:w-[240px] justify-start text-left font-normal"
              onClick={() => setIsDatePickerOpen(true)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedMonth, 'MMMM yyyy')}
            </Button>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => {
                  setSelectedMonth(date || new Date());
                  setIsDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {isAdminOrTeacher && selectedClassId && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="hidden md:flex"
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="hidden md:flex"
            >
              Calendar View
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(attendanceSummary).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">
                {status}
                <span className="float-right text-2xl">{count as number}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      {!selectedClassId && isAdminOrTeacher ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground">Please select a class to view attendance records</p>
        </div>
      ) : attendanceLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground">{isAdminOrTeacher ? "Start by marking attendance for this class" : "No attendance records found for this month"}</p>
          {isAdminOrTeacher && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {isAdminOrTeacher && <TableHead>Student</TableHead>}
                  <TableHead>Status</TableHead>
                  {isAdminOrTeacher && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedAttendance).map(([date, records]) => (
                  <React.Fragment key={date}>
                    {records.map((record: any, index: number) => (
                      <TableRow key={record.id} className="group">
                        <TableCell>
                          {index === 0 && (
                            <span className="font-medium">
                              {format(new Date(date), 'dd MMM yyyy')}
                            </span>
                          )}
                        </TableCell>
                        {isAdminOrTeacher && (
                          <TableCell>{record.student?.name}</TableCell>
                        )}
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        {isAdminOrTeacher && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Object.entries(groupedAttendance).map(([date, records]) => (
            <Card
              key={date}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedDateDetails(records);
                setIsDetailsDialogOpen(true);
              }}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(date), 'dd MMM')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  {records.map((record: any) => (
                    <div key={record.id} className="w-2 h-2 rounded-full" style={{
                      backgroundColor: record.status === 'PRESENT' ? '#22c55e' :
                        record.status === 'ABSENT' ? '#ef4444' :
                        record.status === 'LATE' ? '#f59e0b' : '#6b7280'
                    }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-1">
            <AttendanceForm
              students={students}
              onSubmit={createAttendance}
              isSubmitting={isSubmitting}
              defaultDate={selectedDate}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-1">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Student</Label>
                <p className="text-sm text-gray-500">{selectedRecord?.student?.name}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm text-gray-500">
                  {selectedRecord?.date && format(new Date(selectedRecord.date), "PPP")}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedRecord?.status}
                  onValueChange={(value) => {
                    updateAttendance({ status: value });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="w-[200px]">
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                    <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateAttendance({ status: selectedRecord?.status })}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteAttendance()}
              className="w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Attendance Details - {selectedDateDetails[0] && format(new Date(selectedDateDetails[0].date), 'dd MMM yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'].map((status) => {
                const count = selectedDateDetails.filter(r => r.status === status).length;
                return (
                  <Card key={status}>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm font-medium">
                        {status}
                        <span className="float-right">{count}</span>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdminOrTeacher && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDateDetails.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student?.name}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      {isAdminOrTeacher && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsEditDialogOpen(true);
                                setIsDetailsDialogOpen(false);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsDeleteDialogOpen(true);
                                setIsDetailsDialogOpen(false);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
