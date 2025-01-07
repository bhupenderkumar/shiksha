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
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load students data
  useEffect(() => {
    if (!profileLoading && isAdminOrTeacher) {
      loadStudentData();
    }
  }, [profileLoading, isAdminOrTeacher]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const data = await loadStudents();
      setStudents(data || []);
    } catch (error) {
      toast.error('Failed to load students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      if (!editingStudent) {
        setIsDialogOpen(true); // Keep dialog open to show credentials
      } else {
        handleDialogClose();
      }
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

  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
    setIsDialogOpen(true);
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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await classService.getAll();
        setClasses(classData);
      } catch (error) {
        console.error('Error loading classes:', error);
        toast.error('Failed to load classes');
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdminOrTeacher) {
    return <div>Access denied</div>;
  }

  return (
    <PageAnimation>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="h-8 w-8 text-primary" />
              </motion.div>
              <AnimatedText
                text="Students"
                className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
                variant="slideUp"
              />
            </div>
            <p className="text-muted-foreground mt-1">Manage and view all students</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <SortAsc className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value=""
            onChange={(e) => {}}
            className="pl-10 bg-card/50 backdrop-blur-sm"
          />
        </div>

        {/* Students Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-primary/20 rounded w-3/4" />
                      <div className="h-3 bg-primary/20 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            students?.map((student, index) => (
              <CardAnimation key={student.id} delay={index * 0.1}>
                <CardHoverAnimation>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary">
                              {student.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {student.class?.name || 'No Class'} - {student.class?.section || 'No Section'}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog open={isDialogOpen && studentToDelete === student} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                              <Button onClick={async () => {
                                if (studentToDelete) {
                                  await deleteStudent(studentToDelete.id);
                                  toast.success('Student deleted successfully');
                                  loadStudentData();
                                }
                                setIsDialogOpen(false);
                              }}>Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {student.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {student.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {student.address}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                      </div>
                    </CardContent>
                  </Card>
                </CardHoverAnimation>
              </CardAnimation>
            ))
          )}
        </div>
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
