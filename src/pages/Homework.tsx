import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { useProfileAccess } from '@/services/profileService'; // Add this import
import { 
  HomeworkType,
  loadHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  uploadHomeworkFile,
  deleteHomeworkFile
} from '@/services/homeworkService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeworkStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { statusColors } from '@/styles/colors';
import { Logo } from '@/components/Logo';
import { loadSubjects, SubjectType } from '@/services/subjectService';
import { CalendarIcon, FileIcon, TrashIcon, UploadIcon, PencilIcon } from 'lucide-react';
import { loadClasses, ClassType } from '@/services/classService';

const formClasses = {
  select: "w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all",
  input: "w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all",
  label: "block text-sm font-medium text-foreground mb-1",
  card: "backdrop-blur-sm bg-card/90 dark:bg-card/80 hover:bg-card/95 dark:hover:bg-card/90 transition-all border border-border shadow-sm hover:shadow-md",
};

// Add proper typing for Homework form data
interface HomeworkFormData {
  title: string;
  description: string;
  dueDate: Date | string;
  status: HomeworkStatus;
  subjectId: string;
  classId: string; // Add this
}

interface HomeworkFormProps {
  homework?: HomeworkType;
  onSubmit: (data: HomeworkFormData) => Promise<void>;
  onClose: () => void;
  subjects: Array<{ id: string; name: string }>;
}

const HomeworkForm = ({ homework, onSubmit, onClose, subjects, classes, onClassChange }: HomeworkFormProps & { 
  classes: ClassType[];
  onClassChange: (classId: string) => void;
}) => {
  const [formData, setFormData] = useState<HomeworkFormData>({
    title: homework?.title || '',
    description: homework?.description || '',
    dueDate: homework?.dueDate ? new Date(homework.dueDate) : new Date(),
    status: homework?.status || HomeworkStatus.PENDING,
    subjectId: homework?.subjectId || '',
    classId: homework?.classId || '' // Add this
  });

  // Initialize selectedClass with homework's classId if in edit mode
  const [selectedClass, setSelectedClass] = useState<string>(homework?.classId || '');

  // Load subjects when component mounts if in edit mode
  useEffect(() => {
    if (homework?.classId) {
      onClassChange(homework.classId);
    }
  }, [homework, onClassChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      classId: selectedClass // Make sure classId is included
    });
    onClose();
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setFormData(prev => ({
      ...prev,
      classId, // Update formData's classId
      subjectId: '' // Reset subject when class changes
    }));
    onClassChange(classId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className={formClasses.label}>Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter homework title"
            className={formClasses.input}
          />
        </div>

        <div className="col-span-2">
          <Label className={formClasses.label}>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Enter homework description"
            className={formClasses.input}
            rows={4}
          />
        </div>

        <div>
          <Label className={formClasses.label}>Class</Label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            required
            className={formClasses.select}
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className={formClasses.label}>Subject</Label>
          <select
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            required
            className={formClasses.select}
            disabled={!selectedClass} // Disable if no class selected
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className={formClasses.label}>Due Date</Label>
          <Input
            type="date"
            value={typeof formData.dueDate === 'string' ? formData.dueDate : format(formData.dueDate, 'yyyy-MM-dd')}
            onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
            required
            className={formClasses.input}
          />
        </div>

        <div>
          <Label className={formClasses.label}>Status</Label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as HomeworkStatus })}
            required
            className={formClasses.select}
          >
            {Object.values(HomeworkStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {homework ? 'Update' : 'Create'} Homework
        </Button>
      </div>
    </form>
  );
};

const HomeworkCard = ({ homework, onEdit, onDelete, onFileUpload, isStudent }) => {
  const status = homework.status.toLowerCase();
  const colors = statusColors.light[status];
  const darkColors = statusColors.dark[status];

  return (
    <Card className={`${formClasses.card} group`}>
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="flex justify-between items-center text-lg text-foreground">
          <span className="truncate mr-2">{homework.title}</span>
          <Badge 
            className={`${colors.bg} ${colors.text} ${darkColors.bg} ${darkColors.text} ${colors.border} ${darkColors.border}`}
          >
            {homework.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-foreground/80 leading-relaxed">
            {homework.description}
          </p>
          <p className="text-xs text-foreground/70 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Due: {format(new Date(homework.dueDate), 'PPP')}
          </p>
        </div>

        {homework.attachments && homework.attachments.length > 0 && (
          <div className="rounded-lg p-3 bg-muted/30 dark:bg-muted/10 border border-border">
            <p className="text-xs font-medium mb-2 text-foreground/70">Attachments</p>
            <ul className="space-y-1">
              {homework.attachments.map(file => (
                <li key={file.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                    {file.fileName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteHomeworkFile(file.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-border">
          {isStudent ? (
            <div className="space-x-2">
              {/* Add student-specific actions like submit homework */}
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => document.getElementById(`submission-${homework.id}`).click()}
              >
                <UploadIcon className="w-4 h-4 mr-1" />
                Submit
              </Button>
            </div>
          ) : (
            <>
              {/* Existing teacher/admin actions */}
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => document.getElementById(`file-${homework.id}`).click()}
                >
                  <UploadIcon className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                <Input
                  id={`file-${homework.id}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onFileUpload(e.target.files[0], homework.id);
                    }
                  }}
                />
              </div>
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-background"
                  onClick={() => onEdit(homework)}
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(homework.id)}
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function HomeworkComponent() {
  const { user } = useAuth();
  const { profile, isAdminOrTeacher } = useProfileAccess(); // Use the profile hook
  const [homeworks, setHomeworks] = useState<HomeworkType[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (user && profile) {
      loadHomeworkData();
      loadClassData();
    }
  }, [user, profile]);

  const loadClassData = async () => {
    try {
      const data = await loadClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const loadHomeworkData = async () => {
    try {
      setLoading(true);
      const data = await loadHomeworks(user?.id!, profile?.role);
      setHomeworks(data || []);
    } catch (error) {
      toast.error('Failed to load homeworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<HomeworkType>) => {
    try {
      if (selectedHomework) {
        await updateHomework(selectedHomework.id, data);
        toast.success('Homework updated successfully');
      } else {
        const newHomework = {
          title: data.title,
          description: data.description,
          dueDate: new Date(data.dueDate!).toISOString(),
          status: HomeworkStatus.PENDING,
          subjectId: data.subjectId,
          classId: selectedClassId, // Add the selected class ID
        } as Omit<HomeworkType, 'id' | 'createdAt' | 'updatedAt'>;

        await createHomework(newHomework);
        toast.success('Homework created successfully');
      }
      loadHomeworkData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving homework:', error);
      toast.error('Failed to save homework');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteHomework(id);
      toast.success('Homework deleted successfully');
      loadHomeworkData();
    } catch (error) {
      toast.error('Failed to delete homework');
    }
  };

  const handleFileUpload = async (file: File, homeworkId: string) => {
    try {
      await uploadHomeworkFile(file, homeworkId);
      toast.success('File uploaded successfully');
      loadHomeworkData();
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleClassSelection = async (classId: string) => {
    setSelectedClassId(classId);
    if (classId) {
      try {
        const data = await loadSubjects(classId);
        setSubjects(data || []);
      } catch (error) {
        toast.error('Failed to load subjects for selected class');
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  };

  const handleEdit = (homework: HomeworkType) => {
    setSelectedHomework(homework);
    setSelectedClassId(homework.classId);
    // Load subjects for the selected class
    handleClassSelection(homework.classId);
    setIsDialogOpen(true);
  };

  const canManageHomework = userRole === 'ADMIN' || userRole === 'TEACHER';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <h1 className="text-2xl font-bold text-foreground">Homeworks</h1>
        </div>
        {isAdminOrTeacher && (
          <Button onClick={() => setIsDialogOpen(true)}>Add Homework</Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedHomework ? 'Edit Homework' : 'Create Homework'}
            </DialogTitle>
          </DialogHeader>
          <HomeworkForm
            homework={selectedHomework || undefined}
            onSubmit={handleSubmit}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedHomework(null);
              setSelectedClassId(''); // Reset selected class
              setSubjects([]); // Reset subjects
            }}
            subjects={subjects}
            classes={classes}
            onClassChange={handleClassSelection}
          />
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {homeworks.map((homework) => (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            onEdit={isAdminOrTeacher ? handleEdit : undefined}
            onDelete={isAdminOrTeacher ? handleDelete : undefined}
            onFileUpload={isAdminOrTeacher ? handleFileUpload : undefined}
            isStudent={!isAdminOrTeacher}
          />
        ))}
      </div>
    </div>
  );
}