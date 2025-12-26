import { useEffect, useState } from 'react';
import { studentService, type Student, type CreateStudentData } from '@/services/student.service';
import { ROLES, GENDERS } from '@/lib/constants';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { classService } from '@/services/classService';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Filter,
  SortAsc,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  Calendar,
  Droplets,
  GraduationCap,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import { PageAnimation } from '@/components/ui/page-animation';
import { AnimatedText } from '@/components/ui/animated-text';
import { CardAnimation, CardHoverAnimation } from '@/components/ui/card-animation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProfileAccess } from '@/services/profileService';
import { Navigate } from 'react-router-dom';

const formClasses = {
  select: "w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer",
  input: "w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
  label: "block text-sm font-medium text-foreground mb-1",
  card: "backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all border border-border",
};

const StudentForm = ({ handleSubmit, formData, setFormData, loading, editingStudent, classes }) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className={formClasses.label}>Admission Number*</Label>
        <Input
          value={formData.admissionNumber}
          onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
          required
          placeholder="Enter admission number"
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Name*</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter full name"
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Date of Birth*</Label>
        <Input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Gender*</Label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          required
          className={formClasses.select}
        >
          <option value="">Select Gender</option>
          {Object.values(GENDERS).map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className={formClasses.label}>Class*</Label>
        <select
          value={formData.classId}
          onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
          required
          className={formClasses.select}
        >
          <option value="">Select Class</option>
          {classes?.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - {cls.section}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className={formClasses.label}>Blood Group</Label>
        <Input
          value={formData.bloodGroup}
          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          placeholder="Enter blood group"
          className={formClasses.input}
        />
      </div>
      <div className="col-span-2">
        <Label className={formClasses.label}>Address*</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          placeholder="Enter full address"
          className={formClasses.input}
          rows={3}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Contact Number*</Label>
        <Input
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          required
          placeholder="Enter contact number"
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Parent Name*</Label>
        <Input
          value={formData.parentName}
          onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
          required
          placeholder="Enter parent name"
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Parent Contact*</Label>
        <Input
          type="tel"
          value={formData.parentContact}
          onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
          required
          placeholder="Enter parent contact"
          className={formClasses.input}
        />
      </div>
      <div>
        <Label className={formClasses.label}>Parent Email*</Label>
        <Input
          type="email"
          value={formData.parentEmail}
          onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
          required
          placeholder="Enter parent email"
          className={formClasses.input}
        />
      </div>
    </div>
    <div className="flex justify-end space-x-2">
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
      </Button>
    </div>
  </form>
);

export default function StudentsPage() {
  const { profile, isAdminOrTeacher, loading: profileLoading } = useProfileAccess();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    admissionNumber: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    contactNumber: '',
    parentName: '',
    parentContact: '',
    parentEmail: '',
    bloodGroup: '',
    classId: ''
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    username: string;
  } | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await classService.getAllClasses();
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students based on class filter
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let data;
        if (selectedClassFilter && selectedClassFilter !== 'all') {
          data = await studentService.findMany({ classId: selectedClassFilter });
        } else {
          data = await studentService.getAllStudents();
        }
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassFilter]);

  // Filter students by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(query) ||
      student.admissionNumber?.toLowerCase().includes(query) ||
      student.parentName?.toLowerCase().includes(query) ||
      student.contactNumber?.includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedClassFilter && selectedClassFilter !== 'all') {
        data = await studentService.findMany({ classId: selectedClassFilter });
      } else {
        data = await studentService.getAllStudents();
      }
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingStudent) {
        const updated = await studentService.update(editingStudent.id, formData);
        toast.success('Student updated successfully');
      } else {
        const result = await studentService.create(formData as CreateStudentData);
        setCredentials(result.credentials);
        toast.success('Student created successfully');
      }
      fetchStudents();
      handleDialogClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admissionNumber: student.admissionNumber || '',
      name: student.name || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender || '',
      address: student.address || '',
      contactNumber: student.contactNumber || '',
      parentName: student.parentName || '',
      parentContact: student.parentContact || '',
      parentEmail: student.parentEmail || '',
      bloodGroup: student.bloodGroup || '',
      classId: student.classId || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        setLoading(true);
        await studentService.delete(studentToDelete.id);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      } finally {
        setStudentToDelete(null);
        setLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      admissionNumber: '',
      name: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      contactNumber: '',
      parentName: '',
      parentContact: '',
      parentEmail: '',
      bloodGroup: '',
      classId: ''
    });
  };

  // Show loading spinner while profile is loading
  if (profileLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageAnimation>
      <div className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <AnimatedText
            text="Students"
            className="text-3xl font-bold"
          />
          <Button
            onClick={() => {
              setIsDialogOpen(true);
              setEditingStudent(null);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Filter */}
              <div>
                <Label className="block text-sm font-medium mb-2">Filter by Class</Label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className={formClasses.select}
                >
                  <option value="all">All Classes</option>
                  {classes?.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.section ? `- ${cls.section}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium mb-2">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, admission number, parent name, or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
              {selectedClassFilter !== 'all' && (
                <span> in {classes.find(c => c.id === selectedClassFilter)?.name}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {students.length === 0 ? 'No students found' : 'No students match your search'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {students.length === 0 
                  ? 'Add students to get started' 
                  : 'Try adjusting your search or filter criteria'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onView={() => setViewingStudent(student)}
                onEdit={() => handleEdit(student)}
                onDelete={() => setStudentToDelete(student)}
              />
            ))}
          </div>
        )}

        {/* Student Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            </DialogHeader>
            <StudentForm
              handleSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              editingStudent={editingStudent}
              classes={classes}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStudentToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student Detail View Modal */}
        <StudentDetailModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={() => {
            if (viewingStudent) {
              handleEdit(viewingStudent);
              setViewingStudent(null);
            }
          }}
          classes={classes}
        />
      </div>
    </PageAnimation>
  );
}

// StudentCard Component
const StudentCard = ({
  student,
  onView,
  onEdit,
  onDelete
}: {
  student: Student;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className={formClasses.card}>
    <CardContent className="p-6">
      <div className="space-y-3">
        {/* Header with name and class badge */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{student.name}</h3>
            <p className="text-xs text-muted-foreground">Adm. No: {student.admissionNumber}</p>
          </div>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {student.class?.name} {student.class?.section}
          </span>
        </div>

        {/* Student Details */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Parent: {student.parentName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{student.contactNumber}</span>
          </div>
          {student.parentEmail && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{student.parentEmail}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onView} className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Student Detail Modal Component
const StudentDetailModal = ({
  student,
  onClose,
  onEdit,
  classes
}: {
  student: Student | null;
  onClose: () => void;
  onEdit: () => void;
  classes: any[];
}) => {
  if (!student) return null;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const studentClass = classes?.find(c => c.id === student.classId);

  return (
    <Dialog open={!!student} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            Student Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info Header */}
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-sm text-muted-foreground">Admission No: {student.admissionNumber}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {studentClass?.name} {studentClass?.section || ''}
                </span>
                {student.gender && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary-foreground">
                    {student.gender}
                  </span>
                )}
                {student.bloodGroup && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <Droplets className="h-3 w-3 inline mr-1" />
                    {student.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={<Calendar className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDate(student.dateOfBirth)}
              />
              <DetailItem
                icon={<User className="h-4 w-4" />}
                label="Gender"
                value={student.gender || 'N/A'}
              />
              <DetailItem
                icon={<Droplets className="h-4 w-4" />}
                label="Blood Group"
                value={student.bloodGroup || 'N/A'}
              />
              <DetailItem
                icon={<GraduationCap className="h-4 w-4" />}
                label="Class"
                value={`${studentClass?.name || 'N/A'} ${studentClass?.section || ''}`}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={<Phone className="h-4 w-4" />}
                label="Contact Number"
                value={student.contactNumber || 'N/A'}
              />
              <DetailItem
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={student.address || 'N/A'}
                fullWidth
              />
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={<Users className="h-4 w-4" />}
                label="Parent Name"
                value={student.parentName || 'N/A'}
              />
              <DetailItem
                icon={<Phone className="h-4 w-4" />}
                label="Parent Contact"
                value={student.parentContact || 'N/A'}
              />
              <DetailItem
                icon={<Mail className="h-4 w-4" />}
                label="Parent Email"
                value={student.parentEmail || 'N/A'}
                fullWidth
              />
            </div>
          </div>

          {/* System Information */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <div className="flex justify-between">
              <span>Created: {formatDate(student.createdAt)}</span>
              <span>Last Updated: {formatDate(student.updatedAt)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Detail Item Component for the modal
const DetailItem = ({
  icon,
  label,
  value,
  fullWidth = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) => (
  <div className={`flex items-start gap-3 p-3 bg-muted/30 rounded-lg ${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);
