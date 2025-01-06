import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useProfileAccess } from '@/services/profileService';
import { ROLES } from '@/lib/constants';
import { Calendar } from '@/components/ui/calendar';
// Make sure this path is correct
import {
  AttendanceType,
  loadAttendance,
  bulkCreateAttendance,
  getAttendanceStats,
  deleteAttendance
} from '@/services/attendanceService';
import { ClassType, loadClasses } from '@/services/classService';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadStudentsByClass } from '@/services/studentService'; // Add this import

// Move interface declarations to top
interface StudentAttendanceViewProps {
  studentId?: string;
}

const AttendanceStatuses = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
} as const;

interface AttendanceFormData {
  date: Date;
  classId: string;
  students: Array<{
    studentId: string;
    status: string;
  }>;
}

// Add new AttendanceActions component
const AttendanceActions = ({ 
  attendance, 
  onStatusChange 
}: { 
  attendance: AttendanceType;
  onStatusChange: (id: string, status: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={attendance.status}
        onValueChange={(value) => onStatusChange(attendance.id, value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(AttendanceStatuses).map(([key, value]) => (
            <SelectItem key={value} value={value}>
              {key.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const AttendanceForm = ({ 
  onSubmit, 
  onClose, 
  classes,
  selectedDate,
  selectedClass,
  students,
  onClassChange // Add this prop
}: { 
  onSubmit: (data: AttendanceFormData) => Promise<void>;
  onClose: () => void;
  classes: ClassType[];
  selectedDate: Date;
  selectedClass: string;
  students: any[];
  onClassChange: (classId: string) => Promise<void>; // Add this type
}) => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    date: selectedDate,
    classId: selectedClass,
    students: []  // Initialize empty
  });
  const [loading, setLoading] = useState(false);

  // Add useEffect to update students when they change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      students: students.map(student => ({
        studentId: student.id,
        status: 'ABSENT'
      }))
    }));
  }, [students]);

  // Update class change handler to call parent function
  const handleClassChange = async (value: string) => {
    await onClassChange(value); // Call parent handler first
    setFormData(prev => ({
      ...prev,
      classId: value,
      students: [] // Clear students when class changes
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (studentId: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(s => 
        s.studentId === studentId ? { ...s, status } : s
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={format(formData.date, 'yyyy-MM-dd')}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <Label>Class</Label>
          <Select 
            value={formData.classId} 
            onValueChange={handleClassChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Only show student table if there are students */}
        {students.length > 0 && (
          <div className="border rounded-md p-4">
            <Label className="mb-2 block">Mark Attendance</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Select
                        value={formData.students.find(s => s.studentId === student.id)?.status}
                        onValueChange={(value) => handleStatusChange(student.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AttendanceStatuses).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {key.replace('_', ' ')}
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
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">Creating...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            'Create Attendance'
          )}
        </Button>
      </div>
    </form>
  );
};

export default function AttendancePage() {
  const { user } = useAuth();
  const { profile, isAdminOrTeacher } = useProfileAccess();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isAdminOrTeacher) {
      loadClasses().then(setClasses);
    }
  }, [isAdminOrTeacher]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, selectedClass, profile]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      let data;
      if (isAdminOrTeacher) {
        data = await loadAttendance(selectedDate, selectedClass);
      } else {
        data = await loadAttendance(selectedDate, undefined, profile?.id);
      }
      setAttendance(data || []);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (studentId: string, status: string) => {
    try {
      const existingAttendance = attendance.find(a => a.student?.id === studentId);
      if (existingAttendance) {
        // Update existing attendance
        await bulkCreateAttendance([{
          id: existingAttendance.id, // Add id for update
          studentId,
          date: selectedDate,
          status: status as any
        }]);
      } else {
        // Create new attendance
        await bulkCreateAttendance([{
          studentId,
          date: selectedDate,
          status: status as any
        }]);
      }
      toast.success('Attendance marked successfully');
      loadAttendanceData();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleCreateAttendance = async (data: AttendanceFormData) => {
    try {
      setLoading(true);
      // First, delete existing attendance for the class and date if any
      if (data.classId) {
        await Promise.all(data.students.map(async student => {
          const existingAttendance = attendance.find(a => 
            a.student?.id === student.studentId && 
            format(new Date(a.date), 'yyyy-MM-dd') === format(data.date, 'yyyy-MM-dd')
          );
          if (existingAttendance) {
            await deleteAttendance(existingAttendance.id);
          }
        }));
      }

      // Create new attendance records
      await bulkCreateAttendance(data.students.map(student => ({
        studentId: student.studentId,
        date: data.date,
        status: student.status
      })));

      toast.success('Attendance records created successfully');
      setIsDialogOpen(false);
      loadAttendanceData();
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error('Failed to create attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Add student loading handler
  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    if (classId) {
      try {
        setLoading(true);
        const [studentData, attendanceData] = await Promise.all([
          loadStudentsByClass(classId),
          loadAttendance(selectedDate, classId)
        ]);
        setStudents(studentData);
        setAttendance(attendanceData || []);
      } catch (error) {
        toast.error('Failed to load class data');
        setStudents([]);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    } else {
      setStudents([]);
      setAttendance([]);
    }
  };

  // Add confirmation handling
  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteAttendance(deleteId);
        toast.success('Attendance record deleted successfully');
        loadAttendanceData();
      } catch (error) {
        toast.error('Failed to delete attendance record');
      } finally {
        setDeleteId(null);
        setConfirmDelete(false);
      }
    }
  };

  // Update the dialog open handler to clear students
  const handleOpenDialog = async () => {
    setIsDialogOpen(true);
    if (selectedClass) {
      try {
        setLoading(true);
        const studentData = await loadStudentsByClass(selectedClass);
        setStudents(studentData);
      } catch (error) {
        toast.error('Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAdminOrTeacher) {
    return <StudentAttendanceView studentId={profile?.id} />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <Button 
          onClick={handleOpenDialog}
          disabled={loading}
          className="bg-primary text-white"
        >
          Create Attendance
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Attendance</DialogTitle>
          </DialogHeader>
          <AttendanceForm
            onSubmit={handleCreateAttendance}
            onClose={() => setIsDialogOpen(false)}
            classes={classes}
            selectedDate={selectedDate}
            selectedClass={selectedClass}
            students={students}
            onClassChange={handleClassChange} // Add this prop
          />
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <div>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[200px]">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{record.student?.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {record.student?.admissionNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        record.status === 'PRESENT' ? 'success' :
                        record.status === 'ABSENT' ? 'destructive' :
                        record.status === 'LATE' ? 'warning' : 'default'
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.updatedAt), 'PPp')}
                  </TableCell>
                  <TableCell className="text-right">
                    <AttendanceActions 
                      attendance={record}
                      onStatusChange={handleAttendanceChange}
                    />
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => {
                        setDeleteId(record.id);
                        setConfirmDelete(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {attendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add confirmation dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export the StudentAttendanceView component
export function StudentAttendanceView({ studentId }: StudentAttendanceViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const stats = await getAttendanceStats(studentId, startDate, new Date());
        setStats(stats);
      } catch (error) {
        toast.error('Failed to load attendance stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [studentId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Attendance</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Present Days</h3>
              <p className="text-2xl">{stats?.presentDays || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Absent Days</h3>
              <p className="text-2xl">{stats?.absentDays || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Late Days</h3>
              <p className="text-2xl">{stats?.lateDays || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Attendance Rate</h3>
              <p className="text-2xl">
                {stats?.attendanceRate ? `${stats.attendanceRate}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
