import { useEffect, useState } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { Student, loadStudents, createStudent, updateStudent, deleteStudent } from '@/services/studentService';
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
} from 'lucide-react';
import { PageAnimation } from '@/components/ui/page-animation';
import { AnimatedText } from '@/components/ui/animated-text';
import { CardAnimation, CardHoverAnimation } from '@/components/ui/card-animation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const formClasses = {
  select: "w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
  input: "w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
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
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  useEffect(() => {
    loadStudentData();
  }, [profile?.id]);

  const loadStudentData = async () => {
    if (!profile?.id || !isAdminOrTeacher) return;

    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        loadStudents(),
        classService.findMany()
      ]);
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileLoading && !isAdminOrTeacher) {
      navigate('/dashboard');
    }
  }, [profileLoading, isAdminOrTeacher, navigate]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdminOrTeacher) {
    return null; // Will be redirected by the useEffect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        toast.success('Student updated successfully');
      } else {
        const result = await createStudent(formData);
        setCredentials(result.credentials);
        toast.success('Student created successfully');
      }
      loadStudentData();
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
      admissionNumber: student.admissionNumber,
      name: student.name,
      dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
      gender: student.gender,
      address: student.address,
      contactNumber: student.contactNumber,
      parentName: student.parentName,
      parentContact: student.parentContact,
      parentEmail: student.parentEmail,
      bloodGroup: student.bloodGroup || '',
      classId: student.classId
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        setLoading(true);
        await deleteStudent(studentToDelete.id);
        toast.success('Student deleted successfully');
        loadStudentData();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      } finally {
        handleDialogClose();
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

  return (
    <PageAnimation>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <AnimatedText
            text="Students"
            className="text-3xl font-bold"
          />
          {isAdminOrTeacher && (
            <Button
              onClick={() => {
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
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : students.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No students found</p>
              <p className="text-sm text-muted-foreground/70">Add students to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={() => {
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
                }}
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
      </div>
    </PageAnimation>
  );
}

// StudentCard Component
const StudentCard = ({
  student,
  onEdit,
  onDelete
}: {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className={formClasses.card}>
    <CardContent className="p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{student.name}</h3>
        <p className="text-sm text-muted-foreground">Admission: {student.admissionNumber}</p>
        <p className="text-sm text-muted-foreground">Class: {student.class?.name} {student.class?.section}</p>
        <div className="flex space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
